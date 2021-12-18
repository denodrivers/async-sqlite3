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
  insert 10_000 rows in bench.db: 1114.5801ms
  query 10_000 rows in bench.db: 30.3004ms

x/sqlite3
  insert 10_000 rows in bench.db: 1306.1578ms
  query 10_000 rows in bench.db: 163.2021ms

node-sqlite3
  insert 10_000 rows in bench.db: 1165.0645ms
  query 10_000 rows in bench.db: 8.1728ms

better-sqlite3
  insert 10_000 rows in bench.db: 592.1117ms
  query 10_000 rows in bench.db: 11.3483ms

python-sqlite3
  insert 10_000 rows in bench.db: 546.4092ms
  query 10_000 rows in bench.db: 0.4868ms

x/sqlite
  insert 10_000 rows in bench.db: 28672.3261ms
  query 10_000 rows in bench.db: 16.8747ms
```

Measured on an Intel i7-4510U (4) @ 3.1 SSD

## License

MIT
