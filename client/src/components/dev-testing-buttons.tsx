"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { profileContract, jobsContract, proposalsContract } from "@/abi";
import { uploadJSONToPinata } from "@/lib/pinata";
import { parseEther } from "viem";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@/providers/provider";
import { toast } from "sonner";
import { Loader2, PlusCircle, UserPlus } from "lucide-react";
import { useConnection } from "wagmi";
import { useUserStore } from "@/store/user.store";

export function DevTestingButtons() {
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [isFreelancerLoading, setIsFreelancerLoading] = useState(false);
  const { address } = useConnection();
  const { setUser } = useUserStore();

  const setupClientAndJob = async () => {
    setIsClientLoading(true);
    try {
      // 1. Create Client Profile
      const clientData = {
        username: "DevClient_" + Math.floor(Math.random() * 1000),
        userAddress: address,
        role: 0, // Client
      };
      toast.info("Uploading Client Profile to IPFS...");
      const profileCid = await uploadJSONToPinata(clientData);
      setUser({
        username: clientData.username,
        userAddress: clientData.userAddress as string,
        role: clientData.role,
      });

      toast.info("Creating Client Profile on-chain...");
      const { request: profileRequest } = await simulateContract(config, {
        address: profileContract.address,
        abi: profileContract.abi,
        functionName: "setProfile",
        args: [clientData.username, profileCid, clientData.role],
      });
      const profileHash = await writeContract(config, profileRequest);
      console.log("Profile created:", profileHash);

      // 2. Create Job
      const jobData = {
        title: "Build a Decentralized Platform",
        description:
          "We need a skilled developer to build a decentralized platform for skill sharing.",
        budget: 1,
        category: "Web Development",
        skills: ["React", "Solidity", "TypeScript"],
        deliverables: "The developer should deliver the source code via GitHub and a deployed demo link.",
        requirements: [
          { label: "GitHub Repo", description: "Link to the public repository" },
          { label: "Live Demo", description: "URL of the deployed application" }
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      toast.info("Uploading Job to IPFS...");
      const jobCid = await uploadJSONToPinata(jobData);

      toast.info("Creating Job on-chain...");
      const { request: jobRequest } = await simulateContract(config, {
        address: jobsContract.address,
        abi: jobsContract.abi,
        functionName: "CreateJob",
        args: [jobCid],
        value: parseEther(jobData.budget.toString()),
      });
      const jobHash = await writeContract(config, jobRequest);
      console.log("Job created:", jobHash);

      toast.success("Client & Job Setup Complete!");
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to setup client & job");
    } finally {
      setIsClientLoading(false);
    }
  };

  const setupFreelancerAndProposal = async () => {
    setIsFreelancerLoading(true);
    try {
      // 1. Create Freelancer Profile
      const freelancerData = {
        username: "DevFreelancer_" + Math.floor(Math.random() * 1000),
        userAddress: address,
        role: 1, // Freelancer
      };
      toast.info("Uploading Freelancer Profile to IPFS...");
      const profileCid = await uploadJSONToPinata(freelancerData);
      setUser({
        username: freelancerData.username,
        userAddress: freelancerData.userAddress as string,
        role: freelancerData.role,
      });

      toast.info("Creating Freelancer Profile on-chain...");
      const { request: profileRequest } = await simulateContract(config, {
        address: profileContract.address,
        abi: profileContract.abi,
        functionName: "setProfile",
        args: [freelancerData.username, profileCid, freelancerData.role],
      });
      const profileHash = await writeContract(config, profileRequest);
      console.log("Profile created:", profileHash);

      // 2. Create Proposal (for Job ID 1)
      const proposalData = {
        freelancerName: freelancerData.username,
        description:
          "I am an experienced developer with 5 years in blockchain. I have built several DApps using React and Solidity. I can deliver this project within the deadline with high quality.",
        timestamp: new Date().toISOString(),
      };
      toast.info("Uploading Proposal to IPFS...");
      const proposalCid = await uploadJSONToPinata(proposalData);

      toast.info("Creating Proposal on-chain for Job #1...");
      const { request: proposalRequest } = await simulateContract(config, {
        address: proposalsContract.address,
        abi: proposalsContract.abi,
        functionName: "CreateProposal",
        args: [proposalCid, BigInt(1)],
      });
      const proposalHash = await writeContract(config, proposalRequest);
      console.log("Proposal created:", proposalHash);

      toast.success("Freelancer & Proposal Setup Complete!");
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to setup freelancer & proposal");
    } finally {
      setIsFreelancerLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <div className="bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-primary/20 shadow-xl flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">
          Dev Tools
        </p>
        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2 rounded-xl border-primary/20 hover:bg-primary/5 h-10"
          onClick={setupClientAndJob}
          disabled={isClientLoading}
        >
          {isClientLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4 text-blue-500" />
          )}
          Setup Client & Job
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="justify-start gap-2 rounded-xl border-primary/20 hover:bg-primary/5 h-10"
          onClick={setupFreelancerAndProposal}
          disabled={isFreelancerLoading}
        >
          {isFreelancerLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <PlusCircle className="size-4 text-green-500" />
          )}
          Setup Freelancer & Proposal
        </Button>
      </div>
    </div>
  );
}
