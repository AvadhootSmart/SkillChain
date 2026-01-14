import { abi as profileAbi } from "./UserProfile.json";
import { abi as jobsAbi } from "./JobsContract.json";
import { abi as proposalsAbi } from "./ProposalsContract.json";

export const profileContract = {
  address: process.env.NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
  abi: profileAbi,
} as const;

export const jobsContract = {
  address: process.env.NEXT_PUBLIC_JOB_CONTRACT_ADDRESS as `0x${string}`,
  abi: jobsAbi,
} as const;

export const proposalsContract = {
  address: process.env.NEXT_PUBLIC_PROPOSAL_CONTRACT_ADDRESS as `0x${string}`,
  abi: proposalsAbi,
} as const;
