"use client";

import React from "react";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { jobsContract } from "@/abi";
import { fetchFromPinata } from "@/lib/pinata";
import { encodeEventTopics, decodeEventLog } from "viem";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Type for IPFS metadata
interface IJobMetadata {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category?: string;
}

// Combined on-chain + IPFS job
interface IJob extends IJobMetadata {
  jobID: string;
  clientAddress: string;
  amount: string;
}

const AllJobsPage = () => {
  const publicClient = usePublicClient();
  const [allJobs, setAllJobs] = React.useState<IJob[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const { address } = useAccount();

  const formatDateString = (date: string) =>
    date ? new Date(date).toDateString() : "N/A";

  // Fetch all past JobCreated events
  React.useEffect(() => {
    async function fetchAllJobs() {
      setLoading(true);
      try {
        // 1️⃣ Encode the topics for JobCreated event
        const topics = encodeEventTopics({
          abi: jobsContract.abi,
          eventName: "JobCreated",
        });

        // 2️⃣ Fetch logs
        const logs = await publicClient?.getLogs({
          address: jobsContract.address,
          fromBlock: 0n,
          toBlock: "latest",
          topics,
        });

        // 3️⃣ Decode logs
        const events = logs?.map((log) =>
          decodeEventLog({
            abi: jobsContract.abi,
            data: log.data,
            topics: log.topics,
            eventName: "JobCreated",
          }),
        );

        // 4️⃣ Fetch IPFS metadata
        const jobs: IJob[] = await Promise.all(
          events.map(async (event) => {
            const jobCID = event.args.jobCID;
            const metadata: IJobMetadata = await fetchFromPinata(jobCID);

            return {
              jobID: event.args.jobID.toString(),
              clientAddress: event.args.clientAddress,
              amount: event.args.amount.toString(),
              ...metadata,
            };
          }),
        );

        setAllJobs(jobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllJobs();
  }, [publicClient]);

  // Watch new JobCreated events live
  useWatchContractEvent({
    address: jobsContract.address,
    abi: jobsContract.abi,
    eventName: "JobCreated",
    listener: async (event) => {
      try {
        const jobCID = event.args.jobCID;
        const metadata: IJobMetadata = await fetchFromPinata(jobCID);

        const newJob: IJob = {
          jobID: event.args.jobID.toString(),
          clientAddress: event.args.clientAddress,
          amount: event.args.amount.toString(),
          ...metadata,
        };

        setAllJobs((prev) => [newJob, ...prev]);
      } catch (err) {
        console.error("Error fetching new job metadata:", err);
      }
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Jobs on Platform</h1>

      <ConnectButton />

      {loading && <p>Loading jobs...</p>}

      <div className="grid gap-6 mt-4">
        {allJobs.map((job) => (
          <div
            key={job.jobID}
            className={cn("p-4 border border-border rounded-md shadow-sm cursor-pointer", {
              "bg-accent": job.clientAddress === address,
            })}
            onClick={() => {
              router.push(`/job/${job.jobID}`);
            }}
          >
            <h2 className="font-semibold text-lg">{job.title}</h2>
            <p className="mt-1">{job.description}</p>
            <p>
              <strong>Budget:</strong> {job.budget} /{" "}
              <strong>Amount paid:</strong> {job.amount}
            </p>
            <p>
              <strong>Deadline:</strong> {formatDateString(job.deadline)}
            </p>
            <p>
              <strong>Category:</strong> {job.category || "N/A"}
            </p>
            <p>
              <strong>Client:</strong> {job.clientAddress}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllJobsPage;
