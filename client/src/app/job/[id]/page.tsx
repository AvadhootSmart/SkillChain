"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useReadContract,
  useConnection,
  useWaitForTransactionReceipt,
} from "wagmi";
import { jobsContract, proposalsContract } from "@/abi";
import { fetchFromPinata, uploadJSONToPinata } from "@/lib/pinata";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Clock,
  ShieldCheck,
  Briefcase,
  Send,
  FileText,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { IconEthereum } from "@/icons/ethereum";
import { formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user.store";
import { useMockStore } from "@/store/mock.store";
import { getMockJobById } from "@/lib/mock-data";
import { toast } from "sonner";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@/providers/provider";
import Link from "next/link";

interface IJob {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  clientAddress: string;
  amount: string;
  skills?: string[];
  deliverables?: string;
}

const JobDetailsPage = () => {
  const { id } = useParams();
  const { isConnected } = useConnection();
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalText, setProposalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { user } = useUserStore();
  const { mockEnabled } = useMockStore();

  // Contract Read for job metadata
  const { data: jobData } = useReadContract({
    ...jobsContract,
    functionName: "getJobByJobID",
    args: id ? [BigInt(id as string)] : undefined,
    query: {
      enabled: !!id && !mockEnabled,
    },
  });

  React.useEffect(() => {
    if (mockEnabled) {
      setJob(getMockJobById(id) as unknown as IJob);
      setLoading(false);
      return;
    }
    async function getJobDetails() {
      if (jobData) {
        try {
          const typedJob = jobData as any;
          // The contract returns a tuple named 'job'
          const jobInfo = typedJob;
          const metadata = await fetchFromPinata(jobInfo.jobCID);
          setJob({
            ...metadata,
            clientAddress: jobInfo.client,
            amount: jobInfo.amount.toString(),
          });
        } catch (error) {
          console.error("Error fetching job details:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    getJobDetails();
  }, [jobData, mockEnabled, id]);

  React.useEffect(() => {
    if (isSuccess) {
      toast.success("Proposal submitted successfully!");
      setTxHash(undefined);
    }
  }, [isSuccess]);

  async function handleSendProposal() {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);
      const proposalCid = await uploadJSONToPinata({
        freelancerName: user?.username,
        freelancerAddress: user?.userAddress,
        description: proposalText,
        timestamp: new Date().toISOString(),
      });

      const { request } = await simulateContract(config, {
        address: proposalsContract.address,
        abi: proposalsContract.abi,
        functionName: "CreateProposal",
        args: [proposalCid, BigInt(id as string)],
      });

      const hash = await writeContract(config, request);

      setTxHash(hash);
    } catch (error: any) {
      console.error("Proposal creation error:", error);
      toast.error(error.message || "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-32 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col gap-8 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-3xl" />
              <div className="h-48 bg-muted rounded-3xl" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded-3xl" />
              <div className="h-64 bg-muted rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/explore/jobs">
            <Button
              variant="ghost"
              className="hover:bg-primary/10 transition-colors gap-2 rounded-full"
            >
              <ChevronLeft size={20} />
              Back to Explore
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Job Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 right-0 p-6">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 px-4 py-1 gap-2 text-sm"
                  >
                    <ShieldCheck size={16} />
                    On-Chain Verified
                  </Badge>
                </div>

                <CardHeader className="px-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <Briefcase size={28} />
                    </div>
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                      {job?.category || "General Opportunity"}
                    </span>
                  </div>
                  <CardTitle className="text-4xl font-bold tracking-tight">
                    {job?.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-6  space-y-8">
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-border/50">
                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                      <Clock size={16} className="text-primary" />
                      <span>
                        {job?.deadline
                          ? formatDistanceToNow(new Date(job.deadline), {
                              addSuffix: true,
                            })
                          : "No deadline"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                      <Calendar size={16} className="text-primary" />
                      <span>Posted 2 days ago</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                      <Briefcase size={16} className="text-primary" />
                      <span>Remote Position</span>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                      <FileText size={20} className="text-primary" />
                      Job Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {job?.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                      <Layers className="text-primary" />
                      Skill Requirements
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {job?.skills?.map((skill, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="px-5 py-2 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                      <FileText size={20} className="text-primary" />
                      Key Deliverables
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                      {job?.deliverables}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {user?.role === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] p-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Send size={18} />
                      </div>
                      Submit Proposal
                    </CardTitle>
                    <CardDescription>
                      Pitch your skills to the client. Be concise and highlight
                      your experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Tell the client why your are the best fit..."
                      className="min-h-[180px] rounded-2xl border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all text-base"
                      value={proposalText}
                      onChange={(e) => setProposalText(e.target.value)}
                    />
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex gap-3 items-start">
                      <AlertCircle
                        size={18}
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Proposals are publicly visible but your contact details
                        should be shared only if shortlisted.
                      </p>
                    </div>
                    <Button
                      className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-2"
                      onClick={handleSendProposal}
                      disabled={
                        !isConnected ||
                        isSubmitting ||
                        proposalText.length < 50 ||
                        txHash !== undefined
                      }
                    >
                      {isSubmitting
                        ? "Processing..."
                        : isConnected
                          ? "Send Proposal"
                          : "Connect Wallet to Apply"}
                      <Send
                        size={20}
                        className={cn(isSubmitting ? "animate-pulse" : "")}
                      />
                    </Button>
                    {!isConnected && (
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        Authentication required to secure your submission.
                      </p>
                    )}
                    {isConnected &&
                      proposalText.length > 0 &&
                      proposalText.length < 50 && (
                        <p className="text-center text-xs text-primary font-medium">
                          Minimum 50 characters required ({proposalText.length}
                          /50)
                        </p>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar: Budget & Actions */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[2rem] overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                <CardHeader className="pb-2">
                  <p className="text-primary-foreground/70 uppercase tracking-widest text-xs font-bold">
                    Total Budget
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-2">
                    <IconEthereum className="w-8 h-8 opacity-90" />
                    <span className="text-5xl font-black">{job?.budget}</span>
                    <span className="text-xl font-medium opacity-80 uppercase tracking-tight">
                      ETH
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                    <ShieldCheck size={16} />
                    Funds Held in Escrow
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl bg-card/30 backdrop-blur-md rounded-[2rem]">
                <CardContent className="flex flex-col gap-4">
                  <div className="relative">
                    <div className="size-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {job?.clientAddress.slice(2, 4).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold mb-1">About the Client</h4>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-blue-500">
                        <CheckCircle2 size={14} /> 5 Jobs Posted
                      </span>
                      <span className="flex items-center gap-1.5 text-green-500">
                        <Wallet size={14} /> Payments Verified
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl border-border/50 hover:bg-card"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Star icon as it was missing from lucide set
const Star = ({
  className,
  size,
  ...props
}: { className?: string; size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Layers = ({
  className,
  size,
  ...props
}: { className?: string; size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a1 1 0 0 0 0 1.83l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a1 1 0 0 0 0-1.83Z" />
    <path d="m2.6 11.39 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09" />
    <path d="m2.6 15.87 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09" />
  </svg>
);

export default JobDetailsPage;
