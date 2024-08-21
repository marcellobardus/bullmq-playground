import { FlowJob, Job, Queue } from "bullmq";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { FlowProducer } from "bullmq";
import { worker1 } from "./worker1";
import { worker2 } from "./worker2";
import { worker3 } from "./worker3";
import { worker4 } from "./worker4";
import { worker5 } from "./worker5";

const connection = new IORedis(6379, {
  host: "localhost",
  maxRetriesPerRequest: null,
});

const firstQueueName = "ONCHAIN_DECOMMITMENT";
const firstQueue = new Queue(firstQueueName, { connection });
const firstWorker = new Worker(firstQueueName, worker1, { connection });

// Second worker
const secondQueueName = "PROOF_VERIFICATION";
const secondQueue = new Queue(secondQueueName, { connection });
const secondWorker = new Worker(secondQueueName, worker2, { connection });

// Third worker
const thirdQueueName = "PROOF_GENERATION";
const thirdQueue = new Queue(thirdQueueName, { connection });
const thirdWorker = new Worker(thirdQueueName, worker3, { connection });

// Fourth worker
const fourthQueueName = "TRACE_GENERATION";
const fourthQueue = new Queue(fourthQueueName, { connection });
const fourthWorker = new Worker(fourthQueueName, worker4, { connection });

// Fourth worker
const fifthQueueName = "MMR_ROOT_CACHING";
const fifthQueue = new Queue(fifthQueueName, { connection });
const fifthWorker = new Worker(fifthQueueName, worker5, { connection });

const flowProducer = new FlowProducer();

function buildExecutionFlow(
  batchId: string,
  workersSerializedBatch: any
): FlowJob {
  // First step of the flow - caching the MMR root
  const cacheMmrRootJob: FlowJob = {
    queueName: "MMR_ROOT_CACHING",
    name: `cache-mmr-root-${batchId}`,
    data: workersSerializedBatch,
    opts: {
      attempts: 5,
      delay: 1000,
    },
  };
  // Second step of the flow - generating the trace
  const generateTraceJob: FlowJob = {
    queueName: "TRACE_GENERATION",
    name: `generate-trace-${batchId}`,
    data: workersSerializedBatch,
    opts: {
      attempts: 5,
      delay: 1000,
    },
  };
  // Third step of the flow - generating the proof
  const generateProofJob: FlowJob = {
    queueName: "PROOF_GENERATION",
    name: `generate-proof-${batchId}`,
    data: workersSerializedBatch,
    opts: {
      attempts: 5,
      delay: 1000,
    },
  };
  // Fourth step of the flow - verifying the proof
  const verifyProofJob: FlowJob = {
    queueName: "PROOF_VERIFICATION",
    name: `verify-proof-${batchId}`,
    data: workersSerializedBatch,
    opts: {
      attempts: 5,
      delay: 1000,
    },
  };
  // Fifth step of the flow - finalizing the batch
  const finalizeBatchJob: FlowJob = {
    queueName: "ONCHAIN_DECOMMITMENT",
    name: `finalize-batch-${batchId}`,
    data: workersSerializedBatch,
    opts: {
      attempts: 5,
      delay: 1000,
    },
  };

  const jobs = [
    cacheMmrRootJob,
    generateTraceJob,
    generateProofJob,
    verifyProofJob,
    finalizeBatchJob,
  ];

  // This confusing code is just building a nested object that represents the flow
  const flow: FlowJob = {
    ...jobs[jobs.length - 1],
  };
  let currentFlow = flow;
  for (let i = jobs.length - 2; i >= 0; i--) {
    currentFlow["children"] = [jobs[i]];
    currentFlow = jobs[i];
  }
  return flow;
}

async function addJobs() {
  const flow = await buildExecutionFlow("123", "serializedBatch");
  await flowProducer.add(flow);
}

addJobs();
