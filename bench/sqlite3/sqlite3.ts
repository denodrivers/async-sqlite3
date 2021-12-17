import type { Job, Workflow } from "../types.ts";
import { Database } from "https://deno.land/x/sqlite3@0.2.1/mod.ts";

function performJobs(db: DB, jobs: Job[]) {
  for (const job of jobs) {
    db.queryArray(job.text, job.params ?? []);
  }
}

export function performWorkflow(workflow: Workflow) {
  const db = new Database(workflow.specifier);

  performJobs(db, workflow.setupJobs);

  const start = performance.now();
  for (let i = 0; i < workflow.iterations; i++) {
    performJobs(db, workflow.jobs);
  }

  db.close();
  return performance.now() - start;
}

const workflows: Workflow[] = JSON.parse(
  Deno.readTextFileSync("../workflows.json"),
);

console.log("x/sqlite3");

for (const workflow of workflows) {
  const t = await performWorkflow(workflow);
  console.log(`  ${workflow.name}: ${t.toFixed(4)}ms`);
}
