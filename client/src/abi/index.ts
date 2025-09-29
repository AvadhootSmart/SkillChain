import { abi as profileAbi } from "./UserProfile.json";

export const profileContract = {
  address: process.env.NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS as `0x${string}`,
  abi: profileAbi,
} as const;
