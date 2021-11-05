use deno_bindgen::deno_bindgen;
use lazy_static::lazy_static;
use rusqlite::Connection;
use serde::Serialize;
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;

lazy_static! {
    pub static ref HANDLE: Arc<Mutex<HashMap<usize, Arc<Mutex<Connection>>>>> =
        Arc::new(Mutex::new(HashMap::new()));
    pub static ref LAST_ERROR: Mutex<Vec<u8>> = Mutex::new(Vec::new());
    pub static ref LAST_RESULT: Mutex<Vec<u8>> = Mutex::new(Vec::new());
}

#[deno_bindgen]
#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Value {
    Null,
    Text { text: String },
    Integer { integer: i64 },
    Real { real: f64 },
}

pub fn exec<F, T>(f: F) -> isize
where
    F: Fn() -> Result<T, anyhow::Error>,
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
        let initial_pragmas = "
        -- enable write-ahead-logging mode
        PRAGMA journal_mode=WAL;
        PRAGMA temp_store=memory;
        PRAGMA page_size=4096;
        PRAGMA mmap_size=6000000;
        PRAGMA optimize;
      ";

      conn.execute_batch(initial_pragmas)?;
      conn.set_prepared_statement_cache_capacity(128);
        let conn = Arc::new(Mutex::new(conn));
        let prev = HANDLE.lock().unwrap().insert(id, conn);
        if prev.is_some() {
            return Err(anyhow::anyhow!("Failed to insert connection handle."));
        }
        Ok(())
    })
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_open_memory(id: usize) -> isize {
    exec(move || {
        let conn = Arc::new(Mutex::new(Connection::open_in_memory()?));
        let prev = HANDLE.lock().unwrap().insert(id, conn);
        if prev.is_some() {
            return Err(anyhow::anyhow!("Failed to insert connection handle."));
        }

        Ok(())
    })
}

use rusqlite::types::ValueRef;
impl From<ValueRef<'_>> for Value {
    fn from(value: ValueRef<'_>) -> Value {
        match value {
            ValueRef::Null => Value::Null,
            ValueRef::Integer(integer) => Value::Integer { integer },
            ValueRef::Real(real) => Value::Real { real },
            ValueRef::Text(text) => Value::Text {
                text: std::str::from_utf8(text).unwrap().to_string(),
            },
            _ => unimplemented!(),
        }
    }
}

fn from(value: &Value) -> rusqlite::types::Value {
    match value {
        Value::Text { text } => rusqlite::types::Value::Text(text.to_string()),
        Value::Null => rusqlite::types::Value::Null,
        Value::Real { real } => rusqlite::types::Value::Real(*real),
        Value::Integer { integer } => rusqlite::types::Value::Integer(*integer),
    }
}

#[deno_bindgen]
pub struct ExecuteParams {
    params: Vec<Value>,
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_execute(id: usize, stmt: &str, params: ExecuteParams) -> isize {
    exec(move || {
        let mutex_conn = HANDLE.lock().unwrap();
        let mutex_conn = mutex_conn
            .get(&id)
            .ok_or(anyhow::anyhow!("Connection does not exist"))?;

        let conn = mutex_conn.lock().unwrap();
        let mut stmt = conn.prepare_cached(stmt)?;
        let params: Vec<rusqlite::types::Value> = params.params.iter().map(|p| from(p)).collect();
        stmt.execute(rusqlite::params_from_iter(params))?;
        Ok(())
    })
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_query(id: usize, stmt: &str, params: ExecuteParams) -> isize {
    exec(move || {
        let mutex_conn = HANDLE.lock().unwrap();
        let mutex_conn = mutex_conn
            .get(&id)
            .ok_or(anyhow::anyhow!("Connection does not exist"))?;

        let conn = mutex_conn.lock().unwrap();
        let mut stmt = conn.prepare_cached(stmt)?;
        let params: Vec<rusqlite::types::Value> = params.params.iter().map(|p| from(p)).collect();

        let mut rows = stmt.query(rusqlite::params_from_iter(params))?;
        let mut result: Vec<Vec<Value>> = vec![];
        while let Some(row) = rows.next()? {
            let columns = row.as_ref().column_count();
            let row: Vec<Value> = (0..columns)
                .map(|idx| Value::from(row.get_ref_unwrap(idx)))
                .collect();

            result.push(row);
        }

        let encoded = deno_bindgen::serde_json::to_vec(&result)?;
        *LAST_RESULT.lock().unwrap() = encoded;

        Ok(())
    })
}

