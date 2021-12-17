// sqlite r2d2 connection pool.
use r2d2::ManageConnection;
use rusqlite::Connection;
use rusqlite::Error;

pub enum Specifier {
  InMemory,
  Path(String),
}
 
pub struct ConnectionPool {
  specifier: Specifier,
}

impl Default for ConnectionPool {
  fn default() -> Self {
    Self {
      specifier: Specifier::InMemory,
    }
  }
}

impl ConnectionPool {
  pub fn new(specifier: Specifier) -> Self {
    Self { specifier }
  }
}
impl ManageConnection for ConnectionPool {
  type Connection = Connection;
  type Error = Error;

  fn connect(&self) -> Result<Self::Connection, Self::Error> {
    match self.specifier {
      Specifier::InMemory => Connection::open_in_memory(),
      Specifier::Path(ref path) => Connection::open(path),
    }
  }

  fn is_valid(&self, conn: &mut Connection) -> Result<(), Self::Error> {
    conn.execute_batch("")?;

    Ok(())
  }

  fn has_broken(&self, _: &mut Connection) -> bool {
    false
  }
}
