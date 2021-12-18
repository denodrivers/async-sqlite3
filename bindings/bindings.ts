// Auto-generated with deno_bindgen
import { CachePolicy, prepare } from "https://deno.land/x/plug@0.4.1/plug.ts";
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v;
  return new TextEncoder().encode(v);
}
const opts = {
  name: "deno_sqlite3",
  url: (new URL("../target/release", import.meta.url)).toString(),
  policy: undefined,
};
const _lib = await prepare(opts, {
  sqlite3_execute: {
    parameters: ["usize", "pointer", "usize", "pointer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  fill_result: {
    parameters: ["pointer", "usize"],
    result: "void",
    nonblocking: false,
  },
  get_last_error: {
    parameters: ["pointer", "usize"],
    result: "void",
    nonblocking: false,
  },
  deno_sqlite3_open: {
    parameters: ["usize", "pointer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  sqlite3_query: {
    parameters: [
      "usize",
      "pointer",
      "usize",
      "pointer",
      "usize",
      "pointer",
      "usize",
    ],
    result: "isize",
    nonblocking: true,
  },
  get_result_len: { parameters: [], result: "usize", nonblocking: false },
  sqlite3_open_memory: {
    parameters: ["usize"],
    result: "isize",
    nonblocking: true,
  },
  deno_sqlite3_close: {
    parameters: ["usize"],
    result: "isize",
    nonblocking: true,
  },
});

export function sqlite3_execute(a0: number, a1: string, a2: Uint8Array) {
  const a1_buf = encode(a1);
  const a2_buf = encode(a2);
  return _lib.symbols.sqlite3_execute(
    a0,
    a1_buf,
    a1_buf.byteLength,
    a2_buf,
    a2_buf.byteLength,
  ) as Promise<number>;
}
export function fill_result(a0: Uint8Array) {
  const a0_buf = encode(a0);
  return _lib.symbols.fill_result(a0_buf, a0_buf.byteLength) as null;
}
export function get_last_error(a0: Uint8Array) {
  const a0_buf = encode(a0);
  return _lib.symbols.get_last_error(a0_buf, a0_buf.byteLength) as null;
}
export function deno_sqlite3_open(a0: number, a1: string) {
  const a1_buf = encode(a1);
  return _lib.symbols.deno_sqlite3_open(
    a0,
    a1_buf,
    a1_buf.byteLength,
  ) as Promise<number>;
}
export function sqlite3_query(
  a0: number,
  a1: string,
  a2: Uint8Array,
  a3: Uint8Array,
) {
  const a1_buf = encode(a1);
  const a2_buf = encode(a2);
  const a3_buf = encode(a3);
  return _lib.symbols.sqlite3_query(
    a0,
    a1_buf,
    a1_buf.byteLength,
    a2_buf,
    a2_buf.byteLength,
    a3_buf,
    a3_buf.byteLength,
  ) as Promise<number>;
}
export function get_result_len() {
  return _lib.symbols.get_result_len() as number;
}
export function sqlite3_open_memory(a0: number) {
  return _lib.symbols.sqlite3_open_memory(a0) as Promise<number>;
}
export function deno_sqlite3_close(a0: number) {
  return _lib.symbols.deno_sqlite3_close(a0) as Promise<number>;
}
