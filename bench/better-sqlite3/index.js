const sqlite = require("better-sqlite3");

const performance = require("perf_hooks").performance;

function performJobs(db, jobs) {
  for (const job of jobs) {
    if (job.type === "order" || job.type === "pragma") {
      db.prepare(job.text).run(...(job.params || []));
    } else if (job.type === "query") {
      db.prepare(job.text).all(...(job.params || []));
    }
  }
}

async function performWorkflow(workflow) {
  const db = sqlite(workflow.specifier);

  performJobs(db, workflow.setupJobs);

  const start = performance.now();

  for (let i = 0; i < workflow.iterations; i++) {
    performJobs(db, workflow.jobs);
  }

  db.close();

  return performance.now() - start;
}

const workflows = JSON.parse(
  require("fs").readFileSync("../workflows.json", "utf8"),
);

console.log("better-sqlite3");

(async () => {
  for (const workflow of workflows) {
    const t = await performWorkflow(workflow);
    console.log(`  ${workflow.name}: ${t.toFixed(4)}ms`);
  }
})();
