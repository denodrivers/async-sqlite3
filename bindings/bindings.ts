// Auto-generated with deno_bindgen
import { Plug } from "https://deno.land/x/plug@0.4.0/mod.ts"
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v
  return new TextEncoder().encode(v)
}
const opts = {
  name: "deno_sqlite3",
  url: (new URL("../target/release", import.meta.url)).toString(),
}
const _lib = await Plug.prepare(opts, {
  deno_sqlite3_open: {
    parameters: ["usize", "buffer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  sqlite3_execute: {
    parameters: ["usize", "buffer", "usize", "buffer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  fill_result: {
    parameters: ["buffer", "usize"],
    result: "void",
    nonblocking: false,
  },
  get_result_len: { parameters: [], result: "usize", nonblocking: false },
  sqlite3_open_memory: {
    parameters: ["usize"],
    result: "isize",
    nonblocking: true,
  },
  sqlite3_query: {
    parameters: ["usize", "buffer", "usize", "buffer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  get_last_error: {
    parameters: ["buffer", "usize"],
    result: "void",
    nonblocking: false,
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
export function deno_sqlite3_open(a0: number, a1: string) {
  const a1_buf = encode(a1)
  return _lib.symbols.deno_sqlite3_open(
    a0,
    a1_buf,
    a1_buf.byteLength,
  ) as Promise<number>
}
export function sqlite3_execute(a0: number, a1: string, a2: ExecuteParams) {
  const a1_buf = encode(a1)
  const a2_buf = encode(JSON.stringify(a2))
  return _lib.symbols.sqlite3_execute(
    a0,
    a1_buf,
    a1_buf.byteLength,
    a2_buf,
    a2_buf.byteLength,
  ) as Promise<number>
}
export function fill_result(a0: Uint8Array) {
  const a0_buf = encode(a0)
  return _lib.symbols.fill_result(a0_buf, a0_buf.byteLength) as null
}
export function get_result_len() {
  return _lib.symbols.get_result_len() as number
}
export function sqlite3_open_memory(a0: number) {
  return _lib.symbols.sqlite3_open_memory(a0) as Promise<number>
}
export function sqlite3_query(a0: number, a1: string, a2: ExecuteParams) {
  const a1_buf = encode(a1)
  const a2_buf = encode(JSON.stringify(a2))
  return _lib.symbols.sqlite3_query(
    a0,
    a1_buf,
    a1_buf.byteLength,
    a2_buf,
    a2_buf.byteLength,
  ) as Promise<number>
}
export function get_last_error(a0: Uint8Array) {
  const a0_buf = encode(a0)
  return _lib.symbols.get_last_error(a0_buf, a0_buf.byteLength) as null
}
