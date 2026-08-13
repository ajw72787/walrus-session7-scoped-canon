import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  key: process.env.MEMWAL_PRIVATE_KEY,
  accountId: process.env.MEMWAL_ACCOUNT_ID,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "memory-reconciler-test",
});

console.log("MemWal client created.");

try {
  console.log("Submitting remember job...");

  const job = await memwal.remember(
    "Ubuntu MemWal SDK connectivity test for Memory Reconciler."
  );

  console.log("Remember job:", job.job_id);
  console.log("Waiting for remember job to finish...");

  const completed = await Promise.race([
    memwal.waitForRememberJob(job.job_id),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timed out waiting 90 seconds for remember job")),
        90000
      )
    ),
  ]);

  console.log("Remember job completed:");
  console.dir(completed, { depth: null });

  console.log("Recalling memory...");

  const result = await memwal.recall({
    query: "Ubuntu MemWal SDK connectivity test",
    limit: 5,
  });

  console.log("Recall result:");
  console.dir(result, { depth: null });
} catch (error) {
  console.error("MemWal test failed:");
  console.error(error);
  process.exitCode = 1;
}
