"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useConnection,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { jobsContract } from "@/abi";
import { fetchFromPinata, uploadJSONToPinata } from "@/lib/pinata";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ExternalLink,
  Lock,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@/providers/provider";
import Link from "next/link";
import { IJob } from "@/types/job.types";

// --- Components ---

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-screen pt-20">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-muted-foreground animate-pulse font-medium">
      Loading security clearances...
    </p>
  </div>
);

const AccessDeniedState = ({
  isConnected,
  address,
}: {
  isConnected: boolean;
  address?: string;
}) => (
  <div className="container mx-auto px-4 pt-32 max-w-2xl text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-12 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl space-y-6"
    >
      <div className="mx-auto w-24 h-24 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500">
        <Lock size={48} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground text-lg">
          This page is restricted to the hired freelancer for this job.
        </p>
      </div>
      <div className="pt-4 flex flex-col gap-3">
        {!isConnected ? (
          <p className="text-sm text-amber-500 flex items-center justify-center gap-2">
            <AlertTriangle size={16} /> Please connect your wallet first
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Current wallet:{" "}
            <span className="font-mono text-xs bg-muted p-1 rounded capitalize">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </p>
        )}
        <Link href="/dashboard" className="w-full">
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl gap-2 text-base font-semibold"
          >
            <ChevronLeft size={20} /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </motion.div>
  </div>
);

const JobHeader = ({ job, id }: { job: IJob; id: string }) => (
  <CardHeader className="px-8 pt-2 relative">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
        <Briefcase size={28} />
      </div>
      <Badge
        variant="outline"
        className="font-bold uppercase tracking-widest text-[10px] py-1"
      >
        Job #{id}
      </Badge>
    </div>
    <CardTitle className="text-4xl font-black tracking-tight leading-tight">
      {job.title}
    </CardTitle>
    <CardDescription className="text-lg mt-2 line-clamp-2">
      {job.description}
    </CardDescription>

    {job.freelancerApproved && (
      <div className="mt-6 flex items-center gap-2 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 w-fit">
        <CheckCircle2 size={18} />
        <span className="text-sm font-bold">
          You have marked this job as completed
        </span>
      </div>
    )}
  </CardHeader>
);

const SubmissionForm = ({
  job,
  formValues,
  handleInputChange,
  handleMarkCompleted,
  isSubmitting,
  isTxLoading,
}: {
  job: IJob;
  formValues: Record<string, string>;
  handleInputChange: (label: string, value: string) => void;
  handleMarkCompleted: () => void;
  isSubmitting: boolean;
  isTxLoading: boolean;
}) => (
  <CardContent className="px-8 pb-2 space-y-10">
    <div className="pt-3 border-t border-border/50">
      <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
        <LinkIcon className="text-primary" size={24} />
        Submit Deliverables
      </h3>

      <div className="space-y-2">
        {job.requirements && job.requirements.length > 0 ? (
          job.requirements.map((del, index) => (
            <div
              key={index}
              className="space-y-2 p-4 rounded-3xl bg-muted/30 border border-border/50 group focus-within:border-primary/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <Label className="text-lg font-bold flex items-center gap-2">
                  <span className="size-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                    {index + 1}
                  </span>
                  {del.label}
                </Label>
                {formValues[del.label] && (
                  <a
                    href={
                      formValues[del.label].startsWith("http")
                        ? formValues[del.label]
                        : `https://${formValues[del.label]}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    Preview <ExternalLink size={12} />
                  </a>
                )}
              </div>
              {del.description && (
                <p className="text-sm text-muted-foreground italic pl-8">
                  {del.description}
                </p>
              )}
              <div className="pl-8">
                <Input
                  placeholder="Paste the link here (e.g., Google Drive, GitHub, Loom)"
                  className="h-12 rounded-xl bg-background border-border/50 focus:ring-primary text-base"
                  value={formValues[del.label] || ""}
                  onChange={(e) => handleInputChange(del.label, e.target.value)}
                  disabled={job.freelancerApproved}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-3xl bg-muted/20 border border-dashed border-border/50 text-center">
            <p className="text-muted-foreground">
              No specific deliverable requirements defined for this job.
            </p>
          </div>
        )}
      </div>
    </div>

    {!job.freelancerApproved && (
      <div>
        <Button
          className="w-full h-16 rounded-[1.5rem] font-black text-xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] gap-3"
          onClick={handleMarkCompleted}
          disabled={isSubmitting || isTxLoading}
        >
          {isTxLoading ? (
            <>
              <Loader2 className="animate-spin h-6 w-6" />
              Confirming...
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-6 w-6" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 size={24} />
              Mark Job as Completed
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4 font-medium px-4">
          By marking as completed, you notify the client to release the escrowed
          funds.
        </p>
      </div>
    )}
  </CardContent>
);

const ContractStatusSidebar = ({ job }: { job: IJob }) => (
  <Card className="rounded-[2rem] shadow-xl bg-card border-border/50 overflow-hidden">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Contract Status
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/50">
        <span className="text-sm font-medium">Freelancer (You)</span>
        <Badge
          variant={job.freelancerApproved ? "default" : "secondary"}
          className={
            job.freelancerApproved ? "bg-green-500 hover:bg-green-600" : ""
          }
        >
          {job.freelancerApproved ? "Approved" : "Pending"}
        </Badge>
      </div>
      <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/50">
        <span className="text-sm font-medium">Client</span>
        <Badge
          variant={job.clientApproved ? "default" : "secondary"}
          className={
            job.clientApproved ? "bg-green-500 hover:bg-green-600" : ""
          }
        >
          {job.clientApproved ? "Approved" : "Pending"}
        </Badge>
      </div>

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} className="text-primary" />
          <span className="text-sm font-black">Escrow Release</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Funds will be automatically released to your wallet once both you and
          the client mark the job as completed.
        </p>
      </div>
    </CardContent>
  </Card>
);

// --- Main Page Component ---

const DeliverPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { address, isConnected } = useConnection();
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isSuccess, isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch job from contract
  const { data: jobData, isLoading: contractLoading } = useReadContract({
    ...jobsContract,
    functionName: "getJobByJobID",
    args: id ? [BigInt(id as string)] : undefined,
    query: {
      enabled: !!id,
    },
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (jobData) {
        console.log("jobData", jobData);
        const typedJob = jobData as any;

        // Protection check: address must match freelancer address
        if (
          address &&
          typedJob.freelancer.toLowerCase() !== address.toLowerCase()
        ) {
          setLoading(false);
          return;
        }

        setFetchingMetadata(true);
        try {
          const metadata = await fetchFromPinata(typedJob.jobCID);
          setJob({
            ...metadata,
            freelancerAddress: typedJob.freelancer,
            clientAddress: typedJob.client,
            completed: typedJob.completed,
            freelancerApproved: typedJob.freelancerApproved,
            clientApproved: typedJob.clientApproved,
          });
        } catch (error) {
          console.error("Error fetching metadata:", error);
          toast.error("Failed to fetch job details from IPFS");
        } finally {
          setFetchingMetadata(false);
          setLoading(false);
        }
      } else if (!contractLoading) {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [jobData, address, contractLoading]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Job marked as completed from your side!");
      setTxHash(undefined);
      // Data will refresh due to contract read hook
    }
  }, [isSuccess]);

  const handleMarkCompleted = async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      const deliverableCID = await uploadJSONToPinata(formValues);
      toast.success("Deliverable uploaded successfully!");
      const { request } = await simulateContract(config, {
        ...jobsContract,
        functionName: "MarkFLJobCompleted",
        args: [BigInt(id as string), deliverableCID],
      });

      const hash = await writeContract(config, request);
      setTxHash(hash);
    } catch (error: any) {
      console.error("Error marking job completed:", error);
      toast.error(
        error.shortMessage ||
          error.message ||
          "Failed to mark job as completed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (label: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [label]: value }));
  };

  if (loading || contractLoading) {
    return <LoadingState />;
  }

  // Security Check UI
  if (!job || job.freelancerAddress.toLowerCase() !== address?.toLowerCase()) {
    return <AccessDeniedState isConnected={isConnected} address={address} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="hover:bg-primary/10 transition-colors gap-2 rounded-full pl-2"
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Delivery Form */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-2xl bg-card/50 backdrop-blur-xl border-border/50 overflow-hidden rounded-[2.5rem]">
                <JobHeader job={job} id={id as string} />
                <SubmissionForm
                  job={job}
                  formValues={formValues}
                  handleInputChange={handleInputChange}
                  handleMarkCompleted={handleMarkCompleted}
                  isSubmitting={isSubmitting}
                  isTxLoading={isTxLoading}
                />
              </Card>
            </motion.div>
          </div>

          {/* Sidebar: Status & Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ContractStatusSidebar job={job} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverPage;
