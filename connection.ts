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
import { decodeArray, encode, fromValue, intoValue } from "./value.ts";

const CONNECTION_IDS: Connection[] = [];

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

  close() {
    exec(() => deno_sqlite3_close(this.id));
    this.#_id = null;
  }

  async execute(stmt: string, params: any[] = []) {
    const u8 = encode(params);
    await exec(() => sqlite3_execute(this.id, stmt, u8));
  }

  async query(stmt: string, params: any[] = []) {
    const u8 = encode(params);
    const resultLen = new Uint8Array(4);
    const view = new DataView(resultLen.buffer);
    await exec(() => sqlite3_query(this.id, stmt, u8, resultLen));

    const len = view.getUint32(0);
    const resultBuf = new Uint8Array(len);
    fill_result(resultBuf);
    const result = decodeArray(resultBuf);
    return result;
  }
}
