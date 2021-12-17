import {
  deno_sqlite3_close,
  deno_sqlite3_open,
  fill_result,
  get_last_error,
  get_result_len,
  sqlite3_execute,
  sqlite3_execute_sync,
  sqlite3_open_memory,
  sqlite3_query,
  Value,
} from "./bindings/bindings.ts";
import { fromValue, intoValue } from "./value.ts";

const CONNECTION_IDS: Connection[] = [];

const decode =
  // @ts-ignore
  Deno.core?.decode ||
  (new TextDecoder()).decode;

async function exec(f: () => Promise<number> | number) {
  const err_len = await f();
  if (err_len !== -1) {
    const err_slice = new Uint8Array(err_len);
    get_last_error(err_slice);
    const error = decode(err_slice);

    throw new TypeError(error);
  }
}

export class Connection {
  async open(path: string) {
    await exec(() => this.#open(path));
  }

  #open(specifier: string) {
    if (specifier == ":memory:") {
      return sqlite3_open_memory();
    }
    return deno_sqlite3_open(specifier);
  }

  close() {
    exec(() => deno_sqlite3_close());
  }

  async execute(stmt: string, params: any[] = []) {
    params = params.map((p) => intoValue(p));
    await exec(() => sqlite3_execute(stmt, { params }));
  }

  async query(stmt: string, params: any[] = []) {
    params = params.map((p) => intoValue(p));
    await exec(() => sqlite3_query(stmt, { params }));

    const len = get_result_len();
    const result_buf = new Uint8Array(len);
    fill_result(result_buf);
    const result = decode(result_buf);
    return JSON.parse(result).map((r: Value[]) =>
      r.map((v: Value) => fromValue(v))
    );
  }
}
