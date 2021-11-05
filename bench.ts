import { bench, runBenchmarks } from "https://deno.land/std@0.113.0/testing/bench.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Connection } from "./connection.ts";

const LARGE_TEXT = "SAMPLE".repeat(10000);

{
const specififer = "bench.db"
const conn1 = new DB("x_sqlite_" + specififer);
conn1.query("CREATE TABLE IF NOT EXISTS Bench (data TEXT NOT NULL)");   

const conn2 = new Connection();
await conn2.open("deno_sqlite3_" + specififer);

await conn2.execute("CREATE TABLE IF NOT EXISTS Bench (data TEXT NOT NULL)");

bench({
  name: `query_x10#x/sqlite (${specififer})`,
  runs: 10,
  async func(b) {
    b.start();
    conn1.query("INSERT INTO Bench VALUES (?)", [LARGE_TEXT])
    b.stop();
  },
});

bench({
  name: `query_x10#deno_sqlite3 (${specififer})`,
  runs: 10,
  async func(b) {
   b.start();
    await conn2.execute("INSERT INTO Bench VALUES (?)", [LARGE_TEXT])
    b.stop();
  },
});

}

{
 
const specififer = ":memory:"
const conn1 = new DB(specififer);
conn1.query("CREATE TABLE IF NOT EXISTS Bench (data TEXT NOT NULL)");   

const conn2 = new Connection();
await conn2.open(specififer);

await conn2.execute("CREATE TABLE IF NOT EXISTS Bench (data TEXT NOT NULL)");

bench({
  name: `query_x10#x/sqlite (${specififer})`,
  runs: 10,
  async func(b) {
    b.start();
    conn1.query("INSERT INTO Bench VALUES (?)", [LARGE_TEXT])
    b.stop();
  },
});

bench({
  name: `query_x10#deno_sqlite3 (${specififer})`,
  runs: 10,
  async func(b) {
   b.start();
    await conn2.execute("INSERT INTO Bench VALUES (?)", [LARGE_TEXT])
    b.stop();
  },
});

 
}

runBenchmarks();

