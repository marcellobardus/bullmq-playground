import { Job } from "bullmq";

export async function worker5(job: Job) {
  console.log(
    "Worker 5: Executing: ",
    job.name,
    " job id: ",
    job.id,
    " attemptsMade: ",
    job.attemptsMade
  );
  if (job.attemptsMade < 2) {
    throw new Error("Worker 5: Error: ");
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Worker 5: Finished: ", job.name);
}
