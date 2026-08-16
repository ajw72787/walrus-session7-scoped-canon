import "server-only";
import type { MemoryJob } from "@/lib/client-state";
import { rememberBulkStatus, rememberStatus } from "@/lib/memwal";

type StoredJob = MemoryJob & { storyNamespace: string };

const globalJobs = globalThis as typeof globalThis & {
  __continuityKeeperJobs?: Map<string, StoredJob>;
};
const jobs = (globalJobs.__continuityKeeperJobs ??= new Map());

export function trackMemoryJob(storyNamespace: string, job: MemoryJob): void {
  jobs.set(job.jobId, { ...job, storyNamespace });
}

function publicJob(job: StoredJob): MemoryJob {
  const { storyNamespace: _, ...result } = job;
  void _;
  return result;
}

export async function inspectMemoryJobs(
  storyNamespace: string,
  jobIds: string[],
): Promise<MemoryJob[]> {
  const selected = jobIds
    .map((id) => jobs.get(id))
    .filter((job): job is StoredJob => job?.storyNamespace === storyNamespace);
  const bulk = selected.filter((job) => job.operation === "remember_bulk");
  const single = selected.filter((job) => job.operation === "remember");

  if (bulk.length) {
    const status = await rememberBulkStatus(bulk.map((job) => job.jobId));
    for (const current of status.results) {
      const job = jobs.get(current.job_id);
      if (job) update(job, current);
    }
  }
  await Promise.all(
    single.map(async (job) => update(job, await rememberStatus(job.jobId))),
  );
  return selected.map(publicJob);
}

function update(
  job: StoredJob,
  status: { status: string; blob_id?: string; error?: string },
): void {
  job.state =
    status.status === "done"
      ? "completed"
      : status.status === "failed" || status.status === "not_found"
        ? "failed"
        : status.status === "pending"
          ? "pending"
          : status.status === "uploaded"
            ? "uploaded"
            : "running";
  job.blobId = status.blob_id;
  job.error = status.error;
}
