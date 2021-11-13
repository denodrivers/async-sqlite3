import time
import sqlite3
import rapidjson
import itertools

def perform_jobs(conn, jobs):
    cursor = conn.cursor()
    for job in jobs:
        cursor.execute(job['text'], tuple(job['params']) if 'params' in job else () )
        conn.commit()
    conn.commit()

def perform_workflow(workflow):
    start = time.time() * 1000

    conn = sqlite3.connect(workflow['specifier'])
    
    perform_jobs(conn, workflow['setupJobs'])
    perform_jobs(conn, workflow['jobs'])
    
    return time.time() * 1000 - start

file = open("../workflows.json")
json = file.read()
workflows = rapidjson.loads(json)

print("python-sqlite3")

for workflow in workflows:
    t = perform_workflow(workflow)
    print("  {:s}: {:.4f}ms".format(workflow['name'], t))

