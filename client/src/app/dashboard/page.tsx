"use client";
import { jobsContract, profileContract } from "@/abi";
import { CreateJobDialog } from "@/components/popups/createJobPopup";
import { Button } from "@/components/ui/button";
import { fetchFromPinata } from "@/lib/pinata";
import { IUser } from "@/types/user.types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { useAccount, useReadContract } from "wagmi";

const page = () => {
  // const userDetails = fetch(`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`,)
  const { isConnected, address } = useAccount();
  const [profile, setProfile] = React.useState<IUser>({
    username: "",
    role: "client",
    userAddress: "",
  });

  const [allJobs, setAllJobs] = React.useState<any>([]); //TODO: add types for jobs

  const { data } = useReadContract({
    ...profileContract,
    functionName: "getProfileByAddress",
    args: [address],
  });

  const { data: jobs }: any = useReadContract({
    ...jobsContract,
    functionName: "getJobsByClientAddress",
    args: [address],
  });

  React.useEffect(() => {
    if (data) {
      console.log(data);
      const profile = data as IUser;
      setProfile({
        username: profile.username,
        role: profile.role,
        userAddress: profile.userAddress,
      });
    }
  }, [data]);

  async function fetchData(cids: string[]) {
    const data = await Promise.all(
      cids.map(async (cid: string) => await fetchFromPinata(cid)),
    );
    console.log("fetched data", data);
    // return data;
    setAllJobs(data);
  }

  const formatDateString = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toDateString();
  };

  React.useEffect(() => {
    if (jobs) {
      const cids = jobs.map((job: any) => job.jobCID);
      fetchData(cids);
    }
  }, [jobs]);
  return (
    <div className="p-8">
      <h1>Username: {profile.username}</h1>
      <h1>Role: {profile.role}</h1>
      <h1>Address: {profile.userAddress}</h1>

      <div className="flex gap-2">
        {isConnected && (
          <CreateJobDialog>
            <Button> Create job</Button>
          </CreateJobDialog>
        )}

        <ConnectButton />
      </div>

      <div className="my-10">
        <h1 className="text-2xl">Your Jobs</h1>
        {allJobs.map((job: any) => (
          <div
            className="my-4 border border-border border-b-2 p-4 rounded-md"
            key={job.jobID}
          >
            <h1>Title: {job.title}</h1>
            <h1>Description: {job.description}</h1>
            <h1>Category: {job.category}</h1>
            <h1>Budget: {job.budget}</h1>
            <h1>Deadline: {formatDateString(job.deadline)}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
