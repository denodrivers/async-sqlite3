# `deno_sqlite3`

Non-blocking, asynchronous FFI bindings to SQlite3. 

## usage

```typescript
import { Connection } from "./mod.ts";
const conn = new Connection();

await conn.open("test.db");

await conn.execute("CREATE TABLE User (username TEXT NOT NULL)");
await conn.execute("INSERT INTO User VALUES (?)", ["littledivy"]);

const rows = await conn.query("SELECT * FROM User WHERE username = ?", ["littledivy"]);

assertEquals(rows[0 /* First row */][0 /* First column */], "littledivy");
```


