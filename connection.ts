import {
  get_last_error,
  sqlite3_execute,
  sqlite3_open,
  sqlite3_open_memory,
} from "./bindings/bindings.ts";

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
    return sqlite3_open(this.id, specifier);
  }

  async execute(stmt: string, params: any[] = []) {
    await exec(() => sqlite3_execute(this.id, { stmt, params }));
  }
}
