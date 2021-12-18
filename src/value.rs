use crate::cache;
use rusqlite::types::Value;
use rusqlite::types::ValueRef;

pub fn encode(values: Vec<ValueRef>) -> Vec<u8> {
  let mut encoded = Vec::new();

  for value in values {
    match value {
      ValueRef::Null => {
        encoded.push(0x00);
      }
      ValueRef::Integer(int) => {
        encoded.push(0x01);
        encoded.extend_from_slice(&int.to_be_bytes());
      }
      ValueRef::Real(real) => {
        encoded.push(0x02);
        encoded.extend_from_slice(&real.to_be_bytes());
      }
      ValueRef::Text(text) => {
        encoded.push(0x03);
        encoded.extend_from_slice(&(text.len() as u32).to_be_bytes());
        encoded.extend_from_slice(text);
      }
      _ => unimplemented!(),
    }
  }

  encoded
}

pub fn decode(encoded: &[u8]) -> Vec<Value> {
  if let Some(decoded) = cache::get(encoded) {
    return decoded.clone();
  }

  let items = encoded[0] as usize;
  let mut c = 1;
  let mut decoded = Vec::with_capacity(items);
  for _ in 0..items {
    c += 1;
    let value = match encoded[c - 1] {
      0x00 => Value::Null,
      0x01 => {
        let mut be_bytes = [0; 8];
        let raw = &encoded[c..c + 8];
        be_bytes.copy_from_slice(raw);

        c += 8;
        Value::Integer(i64::from_be_bytes(be_bytes))
      }
      0x02 => {
        let mut be_bytes = [0; 8];
        let raw = &encoded[c..c + 8];
        be_bytes.copy_from_slice(raw);

        c += 8;
        Value::Real(f64::from_be_bytes(be_bytes))
      }
      0x03 => {
        let mut raw = [0; 4];
        raw.copy_from_slice(&encoded[c..c + 4]);
        let len = u32::from_be_bytes(raw) as usize;
        c += 4;

        let raw = &encoded[c..c + len];
        c += len;
        Value::Text(String::from_utf8_lossy(raw).to_string())
      }
      _ => panic!("Unknown value type"),
    };

    decoded.push(value);
  }

  cache::set(encoded.to_vec(), decoded.clone());
  decoded
}

#[cfg(test)]
mod tests {
  use super::*;
  use rusqlite::types::Value;

  #[test]
  fn test_decode() {
    assert_eq!(decode(&[0x01, 0x00]), vec![Value::Null]);
    assert_eq!(
      decode(&[0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      vec![Value::Integer(0)]
    );
    assert_eq!(
      decode(&[0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      vec![Value::Real(0.0)]
    );
    assert_eq!(
      decode(&[0x01, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]),
      vec![Value::Text("".to_string())]
    );
  }
}
