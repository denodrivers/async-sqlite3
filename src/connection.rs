use deno_bindgen::deno_bindgen;
use deno_bindgen::serde_json::Value;
use lazy_static::lazy_static;
use rusqlite::Connection;
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;

lazy_static! {
    pub static ref HANDLE: Arc<Mutex<HashMap<usize, Arc<Mutex<Connection>>>>> =
        Arc::new(Mutex::new(HashMap::new()));
    pub static ref LAST_ERROR: Mutex<Vec<u8>> = Mutex::new(Vec::new());
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
pub fn get_last_error(buf: &mut [u8]) {
    buf.swap_with_slice(&mut *LAST_ERROR.lock().unwrap());
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_open(id: usize, path: &str) -> isize {
    exec(move || {
        let conn = Arc::new(Mutex::new(Connection::open(path)?));
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

fn from(value: &Value) -> rusqlite::types::Value {
    match value {
        Value::String(v) => rusqlite::types::Value::Text(v.to_string()),
        Value::Null => rusqlite::types::Value::Null,
        Value::Number(v) => rusqlite::types::Value::Real(v.as_f64().unwrap()),
        _ => unimplemented!(),
    }
}

#[deno_bindgen]
pub struct ExecuteParams {
    stmt: String,
    params: Vec<Value>,
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_execute(id: usize, params: ExecuteParams) -> isize {
    exec(move || {
        let mutex_conn = HANDLE.lock().unwrap();
        let mutex_conn = mutex_conn
            .get(&id)
            .ok_or(anyhow::anyhow!("Connection does not exist"))?;

        let conn = mutex_conn.lock().unwrap();
        let mut stmt = conn.prepare_cached(&params.stmt)?;
        let params: Vec<rusqlite::types::Value> = params.params.iter().map(|p| from(p)).collect();
        stmt.execute(rusqlite::params_from_iter(params))?;
        Ok(())
    })
}

#[deno_bindgen(non_blocking)]
pub fn sqlite3_query() -> isize {}
