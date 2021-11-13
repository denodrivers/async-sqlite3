const sqlite = require("sqlite3").verbose();

const performance = require("perf_hooks").performance;

function performJobs(db, jobs) {
  for (const job of jobs) {
    if (job.type === "order") {
      db.run(job.text, ...(job.params || []));
    } else {
      db.all(job.text, ...(job.params || []));
    }
  }
}

async function performWorkflow(workflow) {
  const start = performance.now();

  const db = new sqlite.Database(":memory:");

  await new Promise((resolve) =>
    db.serialize(async () => {
      performJobs(db, workflow.setupJobs);

      for (let i = 0; i < workflow.iterations; i++) {
        performJobs(db, workflow.jobs);
      }

      resolve();
    })
  );

  return performance.now() - start;
}

const workflows = JSON.parse(
  require("fs").readFileSync("../workflows.json", "utf8"),
);

console.log("node-sqlite3");

(async () => {
  for (const workflow of workflows) {
    const t = await performWorkflow(workflow);
    console.log(`  ${workflow.name}: ${t.toFixed(4)}ms`);
  }
})();
