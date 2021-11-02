import { Connection } from "./connection.ts";

Deno.test({
  name: "connect_memory#test",
  fn: async () => {
    const conn = new Connection();
    await conn.open(":memory:");
  },
});

Deno.test({
  name: "connect_err#test",
  fn: async () => {
    const conn = new Connection();
    try {
      await conn.open("connection_test.ts");
      throw "Should error";
    } catch (e) {
      if (!e) throw "Should error";
    }
  },
});
