# `deno_sqlite3`

Non-blocking, asynchronous FFI bindings to SQlite3.

## Usage

```typescript
import { Connection } from "./mod.ts";
const conn = new Connection();

await conn.open("test.db");

await conn.execute("CREATE TABLE User (username TEXT NOT NULL)");
await conn.execute("INSERT INTO User VALUES (?)", ["littledivy"]);

const rows = await conn.query("SELECT * FROM User WHERE username = ?", [
  "littledivy",
]);

assertEquals(rows[0 /* First row */][0 /* First column */], "littledivy");
```

## Performance

```
deno_sqlite3
  insert 10000 rows in bench.db: 8852.2726ms

x/sqlite
  insert 10000 rows in bench.db: 43125.2081ms

node-sqlite3
  insert 10000 rows in bench.db: 42322.9281ms

better-sqlite3
  insert 10_000 rows in bench.db: 44505.2927ms

python-sqlite3
  insert 10000 rows in bench.db: 32438.6240ms
```

Measured on an Intel i7-4510U (4) @ 3.1 SSD

## Building from source

Install `deno_bindgen` CLI

```
```

## License

MIT
