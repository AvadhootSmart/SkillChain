"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReadContract, useWriteContract } from "wagmi";
import { proposalsContract, jobsContract } from "@/abi";
import { fetchFromPinata } from "@/lib/pinata";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProposalsPopupProps {
  jobId: string | number;
  children: React.ReactNode;
}

export function ProposalsPopup({ jobId, children }: ProposalsPopupProps) {
  const [proposals, setProposals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: rawProposals, refetch } = useReadContract({
    ...proposalsContract,
    functionName: "getProposalsByJobID",
    args: [BigInt(jobId)],
    query: {
      enabled: isOpen,
    },
  });

  const { writeContractAsync: hireFreelancer } = useWriteContract();
  const { writeContractAsync: approveProposal } = useWriteContract();

  React.useEffect(() => {
    async function loadProposalDetails() {
      if (rawProposals && Array.isArray(rawProposals)) {
        setLoading(true);
        try {
          const detailedProposals = await Promise.all(
            rawProposals.map(async (p: any) => {
              try {
                const metadata = await fetchFromPinata(p.proposalCID);
                return {
                  ...p,
                  ...metadata,
                  proposalID: p.proposalID.toString(),
                  jobID: p.jobID.toString(),
                };
              } catch (e) {
                console.error("Error fetching proposal from Pinata:", e);
                return {
                  ...p,
                  description: "Failed to load description from IPFS",
                  proposalID: p.proposalID.toString(),
                  jobID: p.jobID.toString(),
                };
              }
            }),
          );
          setProposals(detailedProposals);
        } catch (error) {
          console.error("Error fetching proposal details:", error);
          toast.error("Failed to load some proposal details");
        } finally {
          setLoading(false);
        }
      }
    }

    if (isOpen && rawProposals) {
      loadProposalDetails();
    }
  }, [rawProposals, isOpen]);

  const handleAccept = async (proposal: any) => {
    try {
      toast.info("Processing acceptance...");

      // 1. Hire Freelancer on Jobs contract
      const hireHash = await hireFreelancer({
        address: jobsContract.address,
        abi: jobsContract.abi,
        functionName: "HireFreelancer",
        args: [proposal.freelancer, BigInt(jobId)],
      });

      console.log("Hired freelancer:", hireHash);

      // 2. Approve Proposal on Proposals contract
      const approveHash = await approveProposal({
        address: proposalsContract.address,
        abi: proposalsContract.abi,
        functionName: "ApproveProposal",
        args: [BigInt(proposal.proposalID)],
      });

      console.log("Approved proposal:", approveHash);

      toast.success("Proposal accepted and freelancer hired!");
      refetch();
    } catch (error: any) {
      console.error("Error accepting proposal:", error);
      toast.error(error.message || "Failed to accept proposal");
    }
  };

  const handleReject = (proposalId: string) => {
    setProposals((prev) => prev.filter((p) => p.proposalID !== proposalId));
    toast.success("Proposal rejected (hidden from view)");
  };

  return (
    <Dialog onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            Job Proposals
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Review and manage applications for your job posting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-muted-foreground font-medium animate-pulse">
                Fetching proposal data from IPFS...
              </p>
            </div>
          ) : !rawProposals || proposals.length === 0 ? (
            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50 flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted/10">
                <FileText size={48} className="text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold italic">
                  No proposals yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Keep an eye out! Proposals will appear here as freelancers
                  apply.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {proposals.map((proposal, idx) => (
                  <motion.div
                    key={proposal.proposalID}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative p-6 rounded-[1.5rem] bg-gradient-to-br from-card to-background border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-base flex items-center gap-2">
                            {proposal.freelancer.name}
                            {/* {proposal.freelancer.slice(0, 6)}...{proposal.freelancer.slice(-4)} */}
                            <a
                              href={`https://etherscan.io/address/${proposal.freelancer}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </p>
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} className="text-primary" />
                            {proposal.timestamp
                              ? formatDistanceToNow(
                                  new Date(proposal.timestamp),
                                  { addSuffix: true },
                                )
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={proposal.approved ? "default" : "outline"}
                        className={
                          proposal.approved
                            ? "bg-green-500 hover:bg-green-600 rounded-full px-3"
                            : "rounded-full px-3 border-primary/20 text-primary"
                        }
                      >
                        {proposal.approved ? "Accepted" : "Pending"}
                      </Badge>
                    </div>

                    <div className="relative mb-6">
                      <div className="absolute left-0 top-0 w-1 h-full bg-primary/20 rounded-full" />
                      <p className="text-sm text-muted-foreground leading-relaxed pl-4 line-clamp-4 group-hover:line-clamp-none transition-all">
                        {proposal.description}
                      </p>
                    </div>

                    {!proposal.approved && (
                      <div className="flex gap-4">
                        <Button
                          className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11 transition-all active:scale-95 gap-2"
                          onClick={() => handleAccept(proposal)}
                        >
                          <CheckCircle2 size={18} />
                          Accept Proposal
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground font-medium h-11 gap-2"
                          onClick={() => handleReject(proposal.proposalID)}
                        >
                          <XCircle size={18} />
                          Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
