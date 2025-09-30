"use client";
import { profileContract } from "@/abi";
import { IUser } from "@/types/user.types";
import { useParams } from "next/navigation";
import React from "react";
import { useReadContract } from "wagmi";

const page = () => {
  // const userDetails = fetch(`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`,)
  const { id: address } = useParams();
  const [profile, setProfile] = React.useState<IUser>({
    username: "",
    // cid: "",
    role: "",
    userAddress: "" as address,
  });

  const { data, refetch } = useReadContract({
    ...profileContract,
    functionName: "getProfileByAddress",
    args: [address],
  });

  React.useEffect(() => {
    if (data) {
      console.log(data);
      setProfile({
        username: data.username,
        // cid: data.cid,
        role: data.role,
        userAddress: data.userAddress,
      });
    }
  }, [data]);
  return (
    <div>
      <h1>{JSON.stringify(profile)}</h1>
    </div>
  );
};

export default page;
