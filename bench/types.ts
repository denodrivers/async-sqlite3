export type Job = {
  type: "query" | "order";
  text: string;
  params?: unknown[];
};

export interface Workflow {
  name: string;
  memory: boolean;
  iterations: number;
  specifier: string;
  setupJobs: Job[];
  jobs: Job[];
}
