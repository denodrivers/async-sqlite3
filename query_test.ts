import { Connection } from "./connection.ts";
import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";

Deno.test({
  name: "query#test",
  fn: async () => {
    const conn = new Connection();
    await conn.open(":memory:");

    await conn.execute(
      "CREATE TABLE User (id INTEGER NOT NULL, username TEXT NOT NULL)",
    );
    assertEquals(await conn.query("SELECT * FROM User"), []);

    const values = [1, "littledivy"];
    await conn.execute("INSERT INTO User VALUES (?, ?)", values);

    assertEquals(await conn.query("SELECT * FROM User"), [values]);
    assertEquals(
      await conn.query("SELECT username FROM User WHERE id = ?", [values[0]]),
      [[values[1]]],
    );
  },
});
