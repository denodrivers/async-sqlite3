use crate::value::decode;
use crate::value::encode;
use deno_bindgen::deno_bindgen;
use once_cell::sync::Lazy;
use rusqlite::types::ValueRef;
use rusqlite::Connection;
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;

pub static HANDLE: Lazy<Arc<Mutex<HashMap<usize, Arc<Mutex<Connection>>>>>> =
  Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

pub static LAST_ERROR: Lazy<Mutex<Vec<u8>>> =
  Lazy::new(|| Mutex::new(Vec::new()));

pub static LAST_RESULT: Lazy<Mutex<Vec<u8>>> =
  Lazy::new(|| Mutex::new(Vec::new()));

pub fn exec<F, T>(mut f: F) -> isize
where
  F: FnMut() -> Result<T, anyhow::Error>,
{
  match f() {
    Ok(_) => -1,
    Err(e) => {
      let err = e.to_string().into_bytes();
      let len = err.len();
      *LAST_ERROR.lock().unwrap() = err;
      len as isize
    }
  }
}

#[deno_bindgen]
pub fn get_result_len() -> usize {
  LAST_RESULT.lock().unwrap().len()
}

#[deno_bindgen]
pub fn fill_result(buf: &mut [u8]) {
  buf.swap_with_slice(&mut *LAST_RESULT.lock().unwrap());
}

#[deno_bindgen]
pub fn get_last_error(buf: &mut [u8]) {
  buf.swap_with_slice(&mut *LAST_ERROR.lock().unwrap());
}

#[deno_bindgen(non_blocking)]
pub fn deno_sqlite3_open(id: usize, path: &str) -> isize {
  exec(move || {
    let conn = Connection::open(path)?;
    let conn = Arc::new(Mutex::new(conn));

    HANDLE.lock().unwrap().insert(id, conn);
    Ok(())
  })
}

#[deno_bindgen(non_blocking)]
pub fn deno_sqlite3_close(id: usize) -> isize {
  exec(move || {
    let mut mutex_conn = HANDLE.lock().unwrap();
    let mutex_conn = mutex_conn
      .remove(&id)
      .ok_or(anyhow::anyhow!("Connection does not exist"))?;

    let conn = mutex_conn.lock().unwrap();
    drop(conn);
    Ok(())
  })
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_open_memory(id: usize) -> isize {
  exec(move || {
    let conn = Arc::new(Mutex::new(Connection::open_in_memory()?));

    HANDLE.lock().unwrap().insert(id, conn);
    Ok(())
  })
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_execute(id: usize, stmt: &str, params: &[u8]) -> isize {
  exec(move || {
    let mutex_conn = HANDLE.lock().unwrap();
    let mutex_conn = mutex_conn
      .get(&id)
      .ok_or(anyhow::anyhow!("Connection does not exist"))?;

    let conn = mutex_conn.lock().unwrap();
    let mut stmt = conn.prepare_cached(stmt)?;
    let params = decode(params);
    stmt.execute(rusqlite::params_from_iter(params))?;
    Ok(())
  })
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_query(
  id: usize,
  stmt: &str,
  params: &[u8],
  result_len: &mut [u8],
) -> isize {
  exec(move || {
    let mutex_conn = HANDLE.lock().unwrap();
    let mutex_conn = mutex_conn
      .get(&id)
      .ok_or(anyhow::anyhow!("Connection does not exist"))?;

    let conn = mutex_conn.lock().unwrap();
    let mut stmt = conn.prepare_cached(stmt)?;
    let params = decode(params);

    let mut rows = stmt.query(rusqlite::params_from_iter(params))?;
    let mut result: Vec<u8> = vec![];
    while let Some(row) = rows.next()? {
      let columns = row.as_ref().column_count();
      let row: Vec<ValueRef> =
        (0..columns).map(|idx| row.get_ref_unwrap(idx)).collect();
      let encoded_row: Vec<u8> = encode(row);

      result.extend_from_slice(&(encoded_row.len() as u32).to_be_bytes());
      result.extend(encoded_row);
    }

    result_len.copy_from_slice(&(result.len() as u32).to_be_bytes());
    *LAST_RESULT.lock().unwrap() = result;

    Ok(())
  })
}
