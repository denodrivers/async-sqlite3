// Auto-generated with deno_bindgen
import { Plug } from "https://deno.land/x/plug@0.4.0/mod.ts";
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v;
  return new TextEncoder().encode(v);
}
const opts = {
  name: "deno_sqlite3",
  url: (new URL("../target/debug", import.meta.url)).toString(),
};
const _lib = await Plug.prepare(opts, {
  get_last_error: {
    parameters: ["buffer", "usize"],
    result: "void",
    nonblocking: false,
  },
  sqlite3_open: {
    parameters: ["usize", "buffer", "usize"],
    result: "isize",
    nonblocking: true,
  },
  sqlite3_open_memory: {
    parameters: ["usize"],
    result: "isize",
    nonblocking: true,
  },
  sqlite3_execute: {
    parameters: ["usize", "buffer", "usize"],
    result: "isize",
    nonblocking: true,
  },
});
export type ExecuteParams = {
  stmt: string;
  params: Array<any>;
};
export function get_last_error(a0: Uint8Array) {
  const a0_buf = encode(a0);
  return _lib.symbols.get_last_error(a0_buf, a0_buf.byteLength) as null;
}
export function sqlite3_open(a0: number, a1: string) {
  const a1_buf = encode(a1);
  return _lib.symbols.sqlite3_open(a0, a1_buf, a1_buf.byteLength) as Promise<
    number
  >;
}
export function sqlite3_open_memory(a0: number) {
  return _lib.symbols.sqlite3_open_memory(a0) as Promise<number>;
}
export function sqlite3_execute(a0: number, a1: ExecuteParams) {
  const a1_buf = encode(JSON.stringify(a1));
  return _lib.symbols.sqlite3_execute(a0, a1_buf, a1_buf.byteLength) as Promise<
    number
  >;
}
