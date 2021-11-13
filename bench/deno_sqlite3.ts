import type { Workflow, Job} from "./types.ts";
import { Connection } from "../connection.ts";

async function performJobs(conn: Connection, jobs: Job[]) {
  for (const job of jobs) {
    if (job.type === "order") {
      await conn.execute(job.text, job.params ?? []);
    } else {
      await conn.query(job.text, job.params ?? []);
    }
  }
}

export async function performWorkflow(workflow: Workflow) {
  const conn = new Connection();
  await conn.open(workflow.specifier);

  await performJobs(conn, workflow.setupJobs);

  const start = performance.now();
  for (let i = 0; i < workflow.iterations; i++) {
    await performJobs(conn, workflow.jobs);
  }

  return performance.now() - start;
}

const workflows: Workflow[] = JSON.parse(
  Deno.readTextFileSync("./workflows.json"),
);

console.log("deno_sqlite3");

for (const workflow of workflows) {
  const t = await performWorkflow(workflow);
  console.log(`  ${workflow.name}: ${t.toFixed(4)}ms`);
}
