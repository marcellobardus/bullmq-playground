import { Job } from "bullmq";

export async function worker1(job: Job) {
  console.log("Worker 1: Executing: ", job.name);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Worker 1: Finished: ", job.name);
}
