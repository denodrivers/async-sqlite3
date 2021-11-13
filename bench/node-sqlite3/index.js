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
  const db = new sqlite.Database(workflow.specifier);

  const start = await new Promise((resolve) => {
    db.serialize(() => {
      performJobs(db, workflow.setupJobs);
    });

    const start = performance.now();
    db.serialize(async () => {
      for (let i = 0; i < workflow.iterations; i++) {
        performJobs(db, workflow.jobs);
      }
    });

    db.close(() => resolve(start));
  });

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
