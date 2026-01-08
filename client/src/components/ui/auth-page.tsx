"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import {
  ChevronLeftIcon,
  User as UserIcon,
  Briefcase,
  CheckCircle2,
  Loader2,
  Wallet,
} from "lucide-react";
import FormStepper from "../formStepper";
import { IUser, UserRole } from "@/types/user.types";
import { Input } from "./input";
import {
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./card";
import { uploadJSONToPinata } from "@/lib/pinata";
import { profileContract } from "@/abi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@/providers/provider";
import { useUserStore } from "@/store/user.store";
import Link from "next/link";

export function AuthPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [1, 2, 3];
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { setUser } = useUserStore();

  const { address, isConnected } = useConnection();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [formData, setFormData] = useState<IUser>({
    username: "",
    userAddress: "",
    role: UserRole.Client,
  });

  const updateFormData = (newData: Partial<IUser>) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const handleRoleSelect = (role: UserRole) => {
    updateFormData({ role: role, userAddress: address || "" });
    setCurrentStep(2);
  };

  const handleUserDetails = () => {
    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    setCurrentStep(3);
  };

  async function handleSave() {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsUploading(true);
      const profileCid = await uploadJSONToPinata(formData);

      const { request } = await simulateContract(config, {
        address: profileContract.address,
        abi: profileContract.abi,
        functionName: "setProfile",
        args: [formData.username, profileCid, formData.role],
      });

      const hash = await writeContract(config, request);

      setTxHash(hash);
    } catch (error: any) {
      console.error("Profile creation error:", error);
      toast.error(error.message || "Failed to create profile");
    } finally {
      setIsUploading(false);
    }
  }

  React.useEffect(() => {
    if (isSuccess && txHash) {
      toast.success("Profile created successfully!");
      setUser(formData);
      router.push(`/dashboard`);
    }
  }, [isSuccess, txHash, router, setUser, formData]);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 },
    },
    exit: { opacity: 0, y: -10 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <Button
        variant="ghost"
        className="absolute top-8 left-8 hover:bg-primary/10 transition-colors"
        asChild
      >
        <Link href="/">
          <ChevronLeftIcon className="size-4 mr-2" />
          Back to Home
        </Link>
      </Button>

      <motion.div
        className="w-full max-w-md space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Create Profile</h1>
          <p className="text-muted-foreground text-lg">
            Step {currentStep} of 3
          </p>
        </div>

        <FormStepper
          setCurrentStep={setCurrentStep}
          steps={steps}
          currentStep={currentStep}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold">Choose your path</h2>
                  <p className="text-muted-foreground mt-2">
                    How do you plan to use SkillChain?
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      role: UserRole.Client,
                      icon: UserIcon,
                      label: "I want to hire",
                      desc: "Post jobs and find top talent",
                    },
                    {
                      role: UserRole.Freelancer,
                      icon: Briefcase,
                      label: "I want to work",
                      desc: "Find projects and earn rewards",
                    },
                  ].map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                        formData.role === item.role
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-xl",
                          formData.role === item.role
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <Card className="border-2 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Pick a username</CardTitle>
                  <CardDescription>
                    This is how others will identify you on the network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <UserIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      type="text"
                      placeholder="CryptoWizard_24"
                      className="pl-10 h-12 text-lg rounded-xl"
                      value={formData.username}
                      onChange={(e) =>
                        updateFormData({ username: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full h-12 text-lg rounded-xl"
                    onClick={handleUserDetails}
                    disabled={formData.username.length < 3}
                  >
                    Continue
                  </Button>
                </CardFooter>
              </Card>
            )}

            {currentStep === 3 && (
              <ReviewFormDetailsCard
                formData={formData}
                isBusy={isUploading || isTxLoading}
                handleSubmit={handleSave}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <motion.p
          className="text-center text-xs text-muted-foreground mt-8 px-8"
          variants={itemVariants}
        >
          By continuing, you agree to our Terms of Service and recognize that
          your profile data will be stored permanently on IPFS.
        </motion.p>
      </motion.div>
    </main>
  );
}

interface ReviewFormDetailsCardProps {
  formData: IUser;
  isBusy: boolean;
  handleSubmit: () => void;
}

const ReviewFormDetailsCard = ({
  formData,
  isBusy,
  handleSubmit,
}: ReviewFormDetailsCardProps) => {
  return (
    <Card className="border-2 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <div className="h-2 w-full bg-primary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="text-green-500" />
          Review & Confirm
        </CardTitle>
        <CardDescription>
          Final check before securing your identity on-chain.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-xs uppercase font-bold text-muted-foreground mb-1">
              Role
            </p>
            <p className="font-medium capitalize">
              {formData.role === UserRole.Client ? "Client" : "Freelancer"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-xs uppercase font-bold text-muted-foreground mb-1">
              Username
            </p>
            <p className="font-medium">{formData.username}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border">
          <p className="text-xs uppercase font-bold text-muted-foreground mb-1">
            Connected Wallet
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Wallet size={16} className="text-primary" />
            <span className="font-mono truncate">{formData.userAddress}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 p-6 border-t">
        <Button
          className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
          onClick={handleSubmit}
          disabled={isBusy}
        >
          {isBusy ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              {isBusy ? "Processing..." : "Confirming Transaction"}
            </span>
          ) : (
            "Create On-Chain Profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
