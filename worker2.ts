import { Job } from "bullmq";

export async function worker2(job: Job) {
  console.log("Worker 2: Executing: ", job.name);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Worker 2: Finished: ", job.name);
}
