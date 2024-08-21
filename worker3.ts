import { Job } from "bullmq";

export async function worker3(job: Job) {
  console.log("Worker 3: Executing: ", job.name);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Worker 3: Finished: ", job.name);
}
