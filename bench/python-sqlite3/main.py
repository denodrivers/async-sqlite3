import sqlite3
import time

import rapidjson


def perform_jobs(conn, jobs):
    cursor = conn.cursor()

    for job in jobs:
        cursor.execute(job["text"], (job["params"]) if "params" in job else ())
        conn.commit()


def perform_workflow(workflow):
    conn = sqlite3.connect(workflow["specifier"])

    perform_jobs(conn, workflow["setupJobs"])

    start = time.time() * 1000

    for _ in range(workflow["iterations"]):
        perform_jobs(conn, workflow["jobs"])

    conn.commit()
    conn.close()

    return time.time() * 1000 - start


def get_workflows():
    with open("../workflows.json") as file:
        return rapidjson.loads(file.read())


print("python-sqlite3")

for workflow in get_workflows():
    t = perform_workflow(workflow)
    print(f"  {workflow['name']:s}: {t:.4f}ms")
