import type { Job } from "./types.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

function performJobs(db: DB, jobs: Job[]) {
  for (const job of jobs) {
    db.query(job.text, job.params ?? []);
  }
}

export function performWorkflow(workflow: Workflow) {
  const start = performance.now();
  const db = new DB(":memory:");

  performJobs(db, workflow.setupJobs);

  for (let i = 0; i < workflow.iterations; i++) {
    performJobs(db, workflow.jobs);
  }

  return performance.now() - start;
}

const workflows: Workflow[] = JSON.parse(
  Deno.readTextFileSync("./workflows.json"),
);

console.log("sqlite");

for (const workflow of workflows) {
  const t = await performWorkflow(workflow);
  console.log(`  ${workflow.name}: ${t.toFixed(4)}ms`);
}
