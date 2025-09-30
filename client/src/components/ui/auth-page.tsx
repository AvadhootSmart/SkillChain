"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { ChevronLeftIcon } from "lucide-react";
import TransitionLink from "../transitionLink";
import FormStepper from "../formStepper";
import { IUser, USER_ROLE } from "@/types/user.types";
import { Input } from "./input";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { uploadJSONToPinata } from "@/lib/pinata";
import { profileContract } from "@/abi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AuthPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [1, 2, 3];
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const router = useRouter();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [formData, setFormData] = useState<IUser>({
    username: "",
    userAddress: "",
    role: "client",
  });

  const updateFormData = (newData: Partial<IUser>) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const handleRoleSelect = (role: USER_ROLE) => {
    updateFormData({ role: role });
    updateFormData({ userAddress: address });
    setCurrentStep((prev) => prev + 1);
  };

  const handleUserDetails = (username: string) => {
    updateFormData({ username });
    setCurrentStep((prev) => prev + 1);
  };

  async function handleSave() {
    const profileCid = await uploadJSONToPinata(formData);

    const hash = await writeContractAsync({
      address: profileContract.address,
      abi: profileContract.abi,
      functionName: "setProfile",
      args: [formData.username, profileCid, formData.role],
    });
    setTxHash(hash);
  }

  // const handleFormSubmit = () => {
  //   // console.log("Form submitted with data:", formData);
  // };

  React.useEffect(() => {
    if (isSuccess && txHash) {
      toast.success("Profile saved!");
      router.push(`/user/${formData.userAddress}`);
      setTxHash(undefined);
    }
  }, [isSuccess, txHash]);

  // Variants for staggering
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3, ease: "easeIn" as const },
    },
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center p-4">
      <Button variant="ghost" className="absolute top-7 left-5" asChild>
        <TransitionLink href="/">
          <ChevronLeftIcon className="size-4 me-2" />
          Go Back
        </TransitionLink>
      </Button>

      <motion.div
        className="mx-auto space-y-4 sm:w-sm"
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <FormStepper
          setCurrentStep={setCurrentStep}
          steps={steps}
          currentStep={currentStep}
        />
        {currentStep === 1 && (
          <>
            <h1 className="text-2xl my-4 text-center font-medium tracking-tight">
              Join as a client or freelancer
            </h1>

            <motion.div className="space-y-2" variants={item}>
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => handleRoleSelect("client")}
              >
                Continue as a client
              </Button>
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => handleRoleSelect("freelancer")}
              >
                Continue as a freelancer
              </Button>
            </motion.div>

            <motion.p
              className="text-muted-foreground mt-8 text-sm"
              variants={item}
            >
              By clicking continue, you agree to our{" "}
              <a
                href="#"
                className="hover:text-primary underline underline-offset-4"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="hover:text-primary underline underline-offset-4"
              >
                Privacy Policy
              </a>
              .
            </motion.p>
          </>
        )}
        {currentStep === 2 && (
          <>
            <h1>How do you want to be seen on this platform.</h1>
            <Input
              type="text"
              placeholder="Enter your username"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <Button onClick={() => handleUserDetails(formData.username)}>
              Confirm Username
            </Button>
          </>
        )}
        {currentStep === 3 && (
          <ReviewFormDetailsCard
            formData={formData}
            handleSubmit={handleSave}
          />
        )}
      </motion.div>
    </main>
  );
}

interface ReviewFormDetailsCardProps {
  formData: IUser;
  handleSubmit: () => void;
}
const ReviewFormDetailsCard = ({
  formData,
  handleSubmit,
}: ReviewFormDetailsCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-medium">Review your details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <p>
          <span className="font-semibold">Role:</span> {formData.role}
        </p>
        <p>
          <span className="font-semibold">Username:</span> {formData.username}
        </p>
        <p className="truncate">
          <span className="font-semibold">Address:</span> {formData.address}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2">
        <Button onClick={handleSubmit}>Submit</Button>
      </CardFooter>
    </Card>
  );
};
