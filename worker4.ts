import { Job } from "bullmq";

export async function worker4(job: Job) {
  console.log("Worker 4: Executing: ", job.name);
  console.log("Worker 4: job parent: ", job.parent?.id);
  if (job.attemptsMade < 2) {
    console.log("retry");
    throw new Error("error");
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Worker 4: Finished: ", job.name);
}
