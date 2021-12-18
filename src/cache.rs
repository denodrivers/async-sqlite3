use lru::LruCache;
use once_cell::sync::Lazy;
use rusqlite::types::Value;

static mut DECODE_CACHE: Lazy<LruCache<Vec<u8>, Vec<Value>>> =
  Lazy::new(|| LruCache::unbounded());

pub fn get<'a>(key: &'a [u8]) -> Option<&'a Vec<Value>> {
  unsafe { DECODE_CACHE.get(key) }
}

pub fn set(key: Vec<u8>, value: Vec<Value>) {
  unsafe {
    DECODE_CACHE.put(key, value);
  }
}
