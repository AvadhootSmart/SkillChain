"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useReadContract,
  useConnection,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { jobsContract, proposalsContract } from "@/abi";
import { fetchFromPinata } from "@/lib/pinata";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Loader2,
  Package,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { IconEthereum } from "@/icons/ethereum";
import TransitionLink from "@/components/transitionLink";
import { toast } from "sonner";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { config } from "@/providers/provider";
import { IJob } from "@/types/job.types";
import { ContractStatusSidebar } from "@/components/contract-status-card";

interface ProposalMetadata {
  freelancerName: string;
  freelancerAddress: string;
  description: string;
  timestamp: string;
}

interface ProposalWithMetadata {
  proposalID: bigint;
  proposalCID: string;
  jobID: bigint;
  approved: boolean;
  freelancer: string;
  metadata?: ProposalMetadata;
  rejected?: boolean;
}

const TrackJobPage = () => {
  const { id } = useParams();
  const { isConnected, address } = useConnection();
  const [job, setJob] = useState<IJob | null>(null);
  const [proposals, setProposals] = useState<ProposalWithMetadata[]>([]);
  const [deliverables, setDeliverables] = useState<Record<
    string,
    string
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    job: false,
    proposals: false,
    deliverables: false,
  });
  const [actionLoading, setActionLoading] = useState<bigint | null>(null);
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  // Removing conflicting global transaction monitoring
  // Each handler now manages its own transaction lifecycle independently


  const {
    data: jobData,
    isFetched: isJobFetched,
    isError: isJobError,
  } = useReadContract({
    ...jobsContract,
    functionName: "getJobByJobID",
    args: id ? [BigInt(id as string)] : undefined,
    query: { enabled: !!id },
  });

  const {
    data: proposalsData,
    isFetched: isProposalsFetched,
    isError: isProposalsError,
  } = useReadContract({
    ...proposalsContract,
    functionName: "getProposalsByJobID",
    args: id ? [BigInt(id as string)] : undefined,
    query: { enabled: !!id },
  });

  // console.log(
  //   "Job Data:",
  //   jobData,
  //   "Fetched:",
  //   isJobFetched,
  //   "Error:",
  //   isJobError,
  // );
  // console.log(
  //   "Proposals Data:",
  //   proposalsData,
  //   "Fetched:",
  //   isProposalsFetched,
  //   "Error:",
  //   isProposalsError,
  // );

  //fetches job details
  useEffect(() => {
    if (isJobFetched && jobData) {
      const typedJob = jobData as any;
      fetchFromPinata(typedJob.jobCID).then((metadata) => {
        setJob({
          ...metadata,
          clientAddress: typedJob.client,
          amount: typedJob.amount,
        });
        setDataLoaded((prev) => ({ ...prev, job: true }));
      });

      fetchFromPinata(typedJob.deliverableCID).then((metadata) => {
        console.log("Deliverables:", metadata);
        setDeliverables(metadata);
        setDataLoaded((prev) => ({ ...prev, deliverables: true }));
      });
    } else if (isJobFetched && !jobData) {
      setDataLoaded((prev) => ({ ...prev, job: true }));
    }
  }, [jobData, isJobFetched]);

  //loads and sets proposal
  useEffect(() => {
    if (isProposalsFetched && proposalsData) {
      const loadProposals = async () => {
        const typed = proposalsData as any[];
        const proposalsWithMetadata = await Promise.all(
          typed.map(async (proposal) => {
            const metadata = await fetchFromPinata(proposal.proposalCID);
            return {
              ...proposal,
              metadata,
            } as ProposalWithMetadata;
          }),
        );
        setProposals(proposalsWithMetadata);
        setDataLoaded((prev) => ({ ...prev, proposals: true }));
      };
      loadProposals();
    } else if (isProposalsFetched && !proposalsData) {
      setDataLoaded((prev) => ({ ...prev, proposals: true }));
    }
  }, [proposalsData, isProposalsFetched]);

  //manages loading state
  useEffect(() => {
    if (dataLoaded.job && dataLoaded.proposals) {
      setLoading(false);
    }
  }, [dataLoaded]);

  useWatchContractEvent({
    address: proposalsContract.address,
    abi: proposalsContract.abi,
    eventName: "ProposalApproved",
    onLogs: (logs) => {
      console.log("ProposalApproved event received:", logs);
      logs.forEach((log) => {
        const parsed = log as any;
        const approvedProposalID = BigInt(parsed.args.proposalID);
        console.log("Approved proposal ID:", approvedProposalID);
        setProposals((prev) =>
          prev.map((p) => {
            const pID = BigInt(p.proposalID);
            return pID === approvedProposalID ? { ...p, approved: true } : p;
          }),
        );
      });
    },
  });

  useEffect(() => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
    }
  }, [isConnected]);

  // const isClient = user?.role === 1;
  const isOwner =
    address && job?.clientAddress?.toLowerCase() === address.toLowerCase();

  const handleApprove = async (proposalID: bigint) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setActionLoading(proposalID);

      // 1. Accept Proposal (Auto-hires freelancer)
      toast.info("Accepting proposal...");
      const { request } = await simulateContract(config, {
        address: proposalsContract.address,
        abi: proposalsContract.abi,
        functionName: "ApproveProposal",
        args: [proposalID],
      });

      const approveProposalHash = await writeContract(config, request);
      // setTxHash(approveProposalHash); // Removed to avoid global state conflict

      // Wait for approval confirmation
      toast.loading("Confirming on-chain...");
      await waitForTransactionReceipt(config, { hash: approveProposalHash });
      toast.success("Proposal accepted & Freelancer hired!");

      // Invalidate queries to refresh data from chain
      queryClient.invalidateQueries({ queryKey: ["proposals", id] });
      queryClient.invalidateQueries({ queryKey: ["proposalsData", id] });
      queryClient.invalidateQueries({ queryKey: ["deliverables", id] });
      queryClient.invalidateQueries({ queryKey: ["job", id] }); // Also refresh job status

      // Optimistic update
      setProposals((prev) =>
        prev.map((p) =>
          BigInt(p.proposalID) === BigInt(proposalID)
            ? { ...p, approved: true }
            : p,
        ),
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to approve proposal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (proposalID: bigint) => {
    // Only local optimistic rejection since there is no on-chain reject
    setProposals((prev) =>
      prev.map((p) =>
        BigInt(p.proposalID) === BigInt(proposalID)
          ? { ...p, rejected: true }
          : p,
      ),
    );
    toast.success("Proposal rejected locally");
  };

  const toggleProposalExpand = (proposalId: string) => {
    setExpandedProposals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(proposalId)) {
        newSet.delete(proposalId);
      } else {
        newSet.add(proposalId);
      }
      return newSet;
    });
  };

  const handleMarkCompleted = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!job) return;

    try {
      setActionLoading(BigInt(id as string)); // Using job ID for loading state
      const toastId = toast.loading("Marking job as complete...");

      const { request } = await simulateContract(config, {
        address: jobsContract.address,
        abi: jobsContract.abi,
        functionName: "MarkClientJobCompleted",
        args: [BigInt(id as string)],
      });

      const hash = await writeContract(config, request);
      
      toast.loading("Confirming completion on-chain...", { id: toastId });
      await waitForTransactionReceipt(config, { hash });
      
      toast.success("Job marked as complete!", { id: toastId });
      
      // Update local state
      setJob((prev) => (prev ? { ...prev, clientApproved: true } : null));

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["deliverables", id] });
      
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message || "Failed to mark job as complete");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col gap-8 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="pt-32 container mx-auto px-4 max-w-6xl">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view this job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="pt-32 container mx-auto px-4 max-w-6xl">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is only accessible to clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransitionLink href="/explore/jobs">
              <Button className="w-full">Browse Jobs</Button>
            </TransitionLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <TransitionLink href="/dashboard">
            <Button
              variant="ghost"
              className="hover:bg-primary/10 transition-colors gap-2 rounded-full"
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </Button>
          </TransitionLink>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden rounded-2xl">
                <CardHeader className="px-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <FileText size={28} />
                    </div>
                    <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                      {job?.category || "General"}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {job?.title || "Loading..."}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-6 space-y-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {job?.description || "Loading description..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 px-4 py-3 rounded-full border border-border/50 w-fit">
                    <IconEthereum size={18} className="text-primary" />
                    <span className="font-bold text-lg">
                      {job?.budget || "0"} ETH
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="proposals" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-3">
                  <TabsTrigger value="proposals">Proposals</TabsTrigger>
                  <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                </TabsList>

                <TabsContent value="proposals">
                  <Card className="shadow-xl bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="px-8 border-b border-border/50">
                      <CardTitle className="flex items-center gap-2">
                        <Users size={22} className="text-primary" />
                        Proposals ({proposals.length})
                      </CardTitle>
                      <CardDescription>
                        Review and manage freelancer proposals
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {proposals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                          <div className="p-4 rounded-full bg-muted mb-4">
                            <Users
                              size={32}
                              className="text-muted-foreground"
                            />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            No Proposals Yet
                          </h3>
                          <p className="text-muted-foreground max-w-sm">
                            This job hasn&apos;t received any proposals from
                            freelancers yet. Check back later.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {proposals.map((proposal, index) => (
                            <motion.div
                              key={proposal.proposalID.toString()}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * (index + 1) }}
                              className="p-6 hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="size-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                      {proposal.metadata?.freelancerName?.charAt(
                                        0,
                                      ) ||
                                        proposal.freelancer
                                          .slice(2, 4)
                                          .toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">
                                        {proposal.metadata?.freelancerName ||
                                          "Anonymous Freelancer"}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {proposal.freelancer.slice(0, 6)}...
                                        {proposal.freelancer.slice(-4)}
                                      </p>
                                    </div>
                                    {proposal.approved && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 bg-green-500/10 text-green-500 border-green-500/20"
                                      >
                                        <CheckCircle
                                          size={12}
                                          className="mr-1"
                                        />
                                        Approved
                                      </Badge>
                                    )}
                                  </div>
                                  {proposal.metadata?.description ? (
                                    <div className="mt-2">
                                      {expandedProposals.has(proposal.proposalID.toString()) ? (
                                        <div className="max-h-40 overflow-y-auto text-sm text-muted-foreground pr-2">
                                          {proposal.metadata.description}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                          {proposal.metadata.description}
                                        </p>
                                      )}
                                      <button
                                        onClick={() => toggleProposalExpand(proposal.proposalID.toString())}
                                        className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                                      >
                                        {expandedProposals.has(proposal.proposalID.toString()) ? (
                                          <>
                                            <ChevronUp size={14} />
                                            Show less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown size={14} />
                                            Read more
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      No description available
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Submitted{" "}
                                    {proposal.metadata?.timestamp
                                      ? new Date(
                                          proposal.metadata.timestamp,
                                        ).toLocaleDateString()
                                      : "recently"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {!proposal.approved && !proposal.rejected && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-500 hover:bg-red-500/10 border-red-500/20"
                                        onClick={() =>
                                          handleReject(proposal.proposalID)
                                        }
                                        disabled={actionLoading !== null}
                                      >
                                        <XCircle size={16} className="mr-1" />
                                        Reject
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleApprove(proposal.proposalID)
                                        }
                                        disabled={actionLoading !== null}
                                      >
                                        {actionLoading ===
                                        proposal.proposalID ? (
                                          <Loader2
                                            size={16}
                                            className="animate-spin mr-1"
                                          />
                                        ) : (
                                          <CheckCircle
                                            size={16}
                                            className="mr-1"
                                          />
                                        )}
                                        Accept
                                      </Button>
                                    </>
                                  )}
                                  {proposal.rejected && (
                                    <Badge
                                      variant="outline"
                                      className="text-red-500 border-red-500/20"
                                    >
                                      Rejected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deliverables">
                  <Card className="shadow-xl bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden min-h-[400px]">
                    <CardHeader className="px-8 border-b border-border/50">
                      <CardTitle className="flex items-center gap-2">
                        <Package size={22} className="text-primary" />
                        Deliverables
                      </CardTitle>
                      <CardDescription>
                        Track and review work submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {!deliverables ||
                      Object.keys(deliverables).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-full bg-primary/5 mb-6"
                          >
                            <Package size={48} className="text-primary/40" />
                          </motion.div>
                          <h3 className="text-xl font-bold mb-2">
                            No Deliverables Yet
                          </h3>
                          <p className="text-muted-foreground max-w-md text-base">
                            Once the hired freelancer submits their work for
                            review, it will appear here. You&apos;ll be able to
                            review, approve, or request changes.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="divide-y divide-border/50">
                            {Object.entries(deliverables).map(
                              ([label, value], index) => (
                                <motion.div
                                  key={label}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * (index + 1) }}
                                  className="p-6 hover:bg-muted/20 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-lg mb-1">
                                        {label}
                                      </h4>
                                      <a
                                        href={
                                          value.startsWith("http")
                                            ? value
                                            : `https://${value}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1 text-sm truncate"
                                      >
                                        {value}
                                        <ExternalLink size={14} />
                                      </a>
                                    </div>
                                  </div>
                                </motion.div>
                              ),
                            )}
                          </div>
                          
                          <div className="p-6 bg-muted/30 border-t border-border/50 flex justify-end">
                            {job?.clientApproved ? (
                              <Badge className="h-10 px-4 text-base bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 gap-2">
                                <CheckCircle size={18} />
                                Job Marked Complete
                              </Badge>
                            ) : (
                              <Button 
                                onClick={handleMarkCompleted}
                                disabled={actionLoading !== null}
                                className="gap-2"
                              >
                                {actionLoading === BigInt(id as string) ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                                Mark as Complete
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl bg-card/30 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Job Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">
                      Budget
                    </span>
                    <span className="font-bold flex items-center gap-1">
                      <IconEthereum size={14} />
                      {job?.budget || "0"} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">
                      Proposals
                    </span>
                    <Badge variant="secondary">{proposals.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">
                      Status
                    </span>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <ContractStatusSidebar job={jobData as IJob} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackJobPage;
