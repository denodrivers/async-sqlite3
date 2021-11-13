import { SQLite } from "./mod.ts";
import { assertEquals, assertThrowsAsync } from "https://deno.land/std@0.114.0/testing/asserts.ts";

function usersTest(inMemory: boolean) {
    Deno.test(`users + reports database [${inMemory ? "memory" : "fs"}]`, async (t) => {
        if (!inMemory) {      
            await Deno.remove("./users.sql").catch(() => {});
          }
      
        let client!: SQLite;
        
        type User = [number, string, number];
        
        await t.step("create client", () => {
            client = new SQLite(inMemory ? { memory: true } : { path: "./users.sql" });  
          });
        
        await t.step("create connection", async () => {
            await client.init();  
          });
        
        await t.step("create users table", async () => {
            const query = `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER)`;
            await client.execute(query);
          });
      
        const draftUsers1: [User[1], User[2]][] = [
            ["jon doe", 50],
            ["jane doe", 20], // o_o susy baka
          ];
        
        await t.step("insert some users", async () => {
            await Promise.allSettled(draftUsers1.map(([name, age]) => client.execute(`INSERT INTO users (name, age) VALUES ("${name}", ${age})`)));
          });
        
        let users!: User[];
        
        await t.step("get back some users", async () => {
            users = await client.query("SELECT id, name, age FROM users");
          });
        
        assertEquals(users, draftUsers1.map((user, idx) => ([idx + 1, ...user])), "The user data should be the same.");
        
        await t.step("create reports system", async () => {
            await client.execute(
                `CREATE TABLE reports (id INTEGER PRIMARY KEY, name TEXT NOT NULL, grades TEXT)`);
          });
        
        const grades = {
            chemistry: 89,
            algebra: 74,
            english: 69,
          };
        
        await t.step("create some reports", async () => {
            await client.execute(`INSERT INTO reports (name, grades) VALUES ("jimmy", "${JSON.stringify(grades).replaceAll('"', '""')}")`);
          });
        
        await t.step("assert our reports", async () => {
            const [data] = await client.query("SELECT * FROM reports");
            data[2] = JSON.parse(data[2] as string);
            assertEquals([1, "jimmy", grades], data);
          });
        
        await t.step("close the connection", async () => {
            await client.close();
            
            await assertThrowsAsync(async () => {
                await client.query("SELECT id, name, age FROM users");    
              });
          });
            
        if (!inMemory) {    
            await Deno.remove("./users.sql"); // the file lock should be removed now
          }
      });
  }

    usersTest(true);
    usersTest(false);
  });
}
