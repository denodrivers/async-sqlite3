// Auto-generated with deno_bindgen
import { CachePolicy, prepare } from "https://deno.land/x/plug@0.4.1/plug.ts"
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v
  return new TextEncoder().encode(v)
}
const opts = {
  name: "deno_sqlite3",
  url: (new URL("../target/release", import.meta.url)).toString(),
  policy: undefined,
}
const _lib = await prepare(opts, {
  get_result_len: { parameters: [], result: "usize", nonblocking: false },
  fill_result: {
    parameters: ["pointer", "usize"],
    result: "void",
    nonblocking: false,
  },
  sqlite3_open_memory: { parameters: [], result: "isize", nonblocking: true },
  get_last_error: {
    parameters: ["pointer", "usize"],
    result: "void",
    nonblocking: false,
  },
  deno_sqlite3_close: { parameters: [], result: "isize", nonblocking: true },
  sqlite3_execute: {
    parameters: ["pointer", "usize", "pointer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  deno_sqlite3_open: {
    parameters: ["pointer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  sqlite3_query: {
    parameters: ["pointer", "usize", "pointer", "usize"],
    result: "isize",
    nonblocking: true,
  },
})
export type ExecuteParams = {
  params: Array<any>
}
export type Value =
  | "null"
  | {
    text: {
      text: string
    }
  }
  | {
    integer: {
      integer: number
    }
  }
  | {
    real: {
      real: number
    }
  }
export function get_result_len() {
  return _lib.symbols.get_result_len() as number
}
export function fill_result(a0: Uint8Array) {
  const a0_buf = encode(a0)
  return _lib.symbols.fill_result(a0_buf, a0_buf.byteLength) as null
}
export function sqlite3_open_memory() {
  return _lib.symbols.sqlite3_open_memory() as Promise<number>
}
export function get_last_error(a0: Uint8Array) {
  const a0_buf = encode(a0)
  return _lib.symbols.get_last_error(a0_buf, a0_buf.byteLength) as null
}
export function deno_sqlite3_close() {
  return _lib.symbols.deno_sqlite3_close() as Promise<number>
}
export function sqlite3_execute(a0: string, a1: ExecuteParams) {
  const a0_buf = encode(a0)
  const a1_buf = encode(JSON.stringify(a1))
  return _lib.symbols.sqlite3_execute(
    a0_buf,
    a0_buf.byteLength,
    a1_buf,
    a1_buf.byteLength,
  ) as Promise<number>
}
export function deno_sqlite3_open(a0: string) {
  const a0_buf = encode(a0)
  return _lib.symbols.deno_sqlite3_open(a0_buf, a0_buf.byteLength) as Promise<
    number
  >
}
export function sqlite3_query(a0: string, a1: ExecuteParams) {
  const a0_buf = encode(a0)
  const a1_buf = encode(JSON.stringify(a1))
  return _lib.symbols.sqlite3_query(
    a0_buf,
    a0_buf.byteLength,
    a1_buf,
    a1_buf.byteLength,
  ) as Promise<number>
}
