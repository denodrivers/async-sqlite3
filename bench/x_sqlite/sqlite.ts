import type { Job, Workflow } from "../types.ts";
import { DB } from "https://deno.land/x/sqlite@v3.1.3/mod.ts";

function performJobs(db: DB, jobs: Job[]) {
  for (const job of jobs) {
    db.query(job.text, job.params ?? []);
  }
}

export function performWorkflow(workflow: Workflow) {
  const db = new DB(workflow.specifier);

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

console.log("sqlite");

for (const workflow of workflows) {
  const t = await performWorkflow(workflow);
  console.log(`  ${workflow.name}: ${t.toFixed(4)}ms`);
}
