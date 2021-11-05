import {
  fill_result,
  get_last_error,
  get_result_len,
  sqlite3_execute,
  deno_sqlite3_open,
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

async function exec(f: () => Promise<number>) {
  const err_len = await f();
  if (err_len !== -1) {
    const err_slice = new Uint8Array(err_len);
    get_last_error(err_slice);
    const error = decode(err_slice);

    throw new TypeError(error);
  }
}

export class Connection {
  #_id: number | null = null;

  get id(): number {
    if (this.#_id == null) throw new TypeError("Connection is closed.");
    return this.#_id;
  }

  async open(path: string) {
    this.#_id = CONNECTION_IDS.push(this);
    await exec(() => this.#open(path));
  }

  #open(specifier: string) {
    if (specifier == ":memory:") {
      return sqlite3_open_memory(this.id);
    }
    return deno_sqlite3_open(this.id, specifier);
  }

  async execute(stmt: string, params: any[] = []) {
    params = params.map((p) => intoValue(p));
    await exec(() => sqlite3_execute(this.id, stmt, { params }));
  }

  async query(stmt: string, params: any[] = []) {
    params = params.map((p) => intoValue(p));
    await exec(() => sqlite3_query(this.id, stmt, { params }));

    const len = get_result_len();
    const result_buf = new Uint8Array(len);
    fill_result(result_buf);
    const result = decode(result_buf);
    return JSON.parse(result).map((r: Value[]) =>
      r.map((v: Value) => fromValue(v))
    );
  }
}

