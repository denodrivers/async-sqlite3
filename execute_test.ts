import { Connection } from "./connection.ts";

Deno.test({
  name: "execute#test",
  fn: async () => {
    const conn = new Connection();
    await conn.open(":memory:");

    await conn.execute("CREATE TABLE IF NOT EXISTS Test (id TEXT NOT NULL)");
    await conn.execute("INSERT INTO Test VALUES (?)", ["ABCD"]);

    try {
      await conn.execute("INSERT INTO Test VALUES (?)", []);
      throw new TypeError("Should error");
    } catch (e) {
      if (!e) throw new TypeError("Should error");
    }
  },
});
