"use client";

import { jobsContract, profileContract, proposalsContract } from "@/abi";
import { CreateJobDialog } from "@/components/popups/createJobPopup";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchFromPinata } from "@/lib/pinata";
import { IUser, UserRole } from "@/types/user.types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { useConnection, useReadContract } from "wagmi";

import {
  Briefcase,
  Plus,
  Search,
  AlertCircle,
  LayoutDashboard,
  CheckCircle2,
  User,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { IconEthereum } from "@/icons/ethereum";
import { JobCard } from "@/components/job-card";

import { useUserStore } from "@/store/user.store";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const DashboardPage = () => {
  const { isConnected, address } = useConnection();
  const [searchQuery, setSearchQuery] = React.useState("");
  const { setUser } = useUserStore();

  const [profile, setProfile] = React.useState<IUser>({
    username: "",
    role: UserRole.Client,
    userAddress: "",
  });

  const [allJobs, setAllJobs] = React.useState<any>([]);
  const [allProposals, setAllProposals] = React.useState<any>([]);
  const [hasProfile, setHasProfile] = React.useState(false);
  const [showEarnings, setShowEarnings] = React.useState(false);
  const [totalEarnings, setTotalEarnings] = React.useState("0.00 ETH");
  const [earningsLoading, setEarningsLoading] = React.useState(false);

  // Query profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useReadContract({
    ...profileContract,
    functionName: "getProfileByAddress",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Query jobs (Client view)
  const {
    data: jobs,
    isLoading: jobsLoading,
    error: jobsError,
  } = useReadContract({
    ...jobsContract,
    functionName: "getJobsByClientAddress",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasProfile && profile.role === UserRole.Client,
    },
  });

  // Query proposals (Freelancer view)
  const {
    data: proposals,
    isLoading: proposalsLoading,
    error: proposalsError,
  } = useReadContract({
    ...proposalsContract,
    functionName: "getFreelancersProposals",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasProfile && profile.role === UserRole.Freelancer,
    },
  });

  // Handle profile data
  React.useEffect(() => {
    if (profileData && !profileLoading && !profileError) {
      const userProfile = profileData as IUser;
      setProfile({
        username: userProfile.username,
        role: userProfile.role,
        userAddress: userProfile.userAddress,
      });
      setUser({
        username: userProfile.username,
        role: userProfile.role,
        userAddress: userProfile.userAddress,
      });
      setHasProfile(true);
    } else if (profileError) {
      setHasProfile(false);
    }
  }, [profileData, profileLoading, profileError, setUser]);

  // Fetch jobs from Pinata
  React.useEffect(() => {
    async function fetchJobData(jobInfos: any[]) {
      try {
        const data = await Promise.all(
          jobInfos.map(async (info) => {
            const pinataData = await fetchFromPinata(info.jobCID);
            return { 
              ...pinataData, 
              ...info, // Spread all on-chain info (completed, amount, etc.)
              cid: info.jobCID 
            };
          }),
        );
        setAllJobs(data);
      } catch (error) {
        console.error("Error fetching jobs from Pinata:", error);
      }
    }

    if (jobs && !jobsLoading && !jobsError && Array.isArray(jobs)) {
      const jobInfos = jobs
        .filter((job: any) => job.jobCID)
        .map((job: any) => ({
          jobID: job.jobID.toString(),
          jobCID: job.jobCID,
          completed: job.completed,
          amount: job.amount,
          clientApproved: job.clientApproved,
          freelancerApproved: job.freelancerApproved,
        }));

      if (jobInfos.length > 0) {
        fetchJobData(jobInfos);
      } else {
        setAllJobs([]);
      }
    }
  }, [jobs, jobsLoading, jobsError]);

  // Fetch proposals from Pinata
  React.useEffect(() => {
    async function fetchProposalData(
      proposalInfos: {
        proposalID: string;
        proposalCID: string;
        jobID: string;
        approved: boolean;
      }[],
    ) {
      try {
        const data = await Promise.all(
          proposalInfos.map(async (info) => {
            const pinataData = await fetchFromPinata(info.proposalCID);
            return {
              ...pinataData,
              proposalID: info.proposalID,
              jobID: info.jobID,
              approved: info.approved,
              cid: info.proposalCID,
            };
          }),
        );
        setAllProposals(data);
      } catch (error) {
        console.error("Error fetching proposals from Pinata:", error);
      }
    }

    if (
      proposals &&
      !proposalsLoading &&
      !proposalsError &&
      Array.isArray(proposals)
    ) {
      const proposalInfos = proposals
        .filter((p: any) => p.proposalCID)
        .map((p: any) => ({
          proposalID: p.proposalID.toString(),
          proposalCID: p.proposalCID,
          jobID: p.jobID.toString(),
          approved: p.approved,
        }));

      if (proposalInfos.length > 0) {
        fetchProposalData(proposalInfos);
      } else {
        setAllProposals([]);
      }
    }
  }, [proposals, proposalsLoading, proposalsError]);

  const filteredJobs = allJobs.filter(
    (job: any) =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredProposals = allProposals.filter(
    (p: any) =>
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jobID?.toString().includes(searchQuery),
  );

  const calculateEarnings = React.useCallback(async () => {
    if (isClient) return;
    
    setEarningsLoading(true);
    try {
      const approvedProposals = allProposals.filter((p: any) => p.approved);
      const earnings = approvedProposals.reduce((acc: number, p: any) => {
        return acc + (Number(p.budget) || Number(p.amount) || 0);
      }, 0);
      setTotalEarnings(`${earnings.toFixed(4)} ETH`);
    } catch (error) {
      console.error("Error calculating earnings:", error);
    } finally {
      setEarningsLoading(false);
    }
  }, [isClient, allProposals]);

  const handleRefreshEarnings = () => {
    setShowEarnings(false);
    calculateEarnings();
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto max-w-7xl pt-20 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-primary/10 text-primary">
            <LayoutDashboard size={64} />
          </div>
          <div className="max-w-md">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Connect Your Wallet
            </h1>
            <p className="text-muted-foreground mb-8">
              Access your personalized dashboard, manage your jobs, and connect
              with top talent.
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (!hasProfile && !profileLoading) {
    return (
      <div className="container mx-auto max-w-7xl pt-20 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-yellow-500/10 text-yellow-500">
            <AlertCircle size={64} />
          </div>
          <div className="max-w-md">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              No Profile Found
            </h1>
            <p className="text-muted-foreground mb-8">
              You need to set up your profile before you can start posting or
              accepting jobs on SkillChain.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full px-8">
                Create Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isClient = profile.role === UserRole.Client;
  const isLoading = isClient ? jobsLoading : proposalsLoading;
  const displayItems = isClient ? filteredJobs : filteredProposals;

  return (
    <div className="container mx-auto max-w-7xl pt-8 pb-20 px-4">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            Welcome back,{" "}
            <span className="text-primary">
              {profileLoading ? "..." : profile.username}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <User size={16} />
            <span className="capitalize">
              {isClient ? "Client" : "Freelancer"}
            </span>{" "}
            Profile • {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="flex gap-3">
          {isConnected && hasProfile && isClient && (
            <CreateJobDialog>
              <Button
                size="lg"
                className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 gap-2"
              >
                <Plus size={20} />
                Post a New Job
              </Button>
            </CreateJobDialog>
          )}
        </div>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          {
            label: isClient ? "Active Jobs" : "Proposals Sent",
            value: isClient 
              ? allJobs.filter((j: any) => !j.completed).length 
              : allProposals.length,
            icon: Briefcase,
            color: "text-blue-500",
          },
          {
            label: isClient ? "Completed" : "Jobs Won",
            value: isClient 
              ? allJobs.filter((j: any) => j.completed).length 
              : allProposals.filter((p: any) => p.approved).length,
            icon: CheckCircle2,
            color: "text-green-500",
          },
          {
            label: isClient ? "Pending Actions" : "Pending Replies",
            value: isClient
               ? allJobs.filter((j: any) => !j.completed && j.freelancerApproved && !j.clientApproved).length
               : allProposals.filter((p: any) => !p.approved).length,
            icon: Search,
            color: "text-orange-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-card border ${stat.color}`}
                  >
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Total Earned/Spent Card with Eye Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isClient ? "Total Spent" : "Total Earned"}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {isClient ? (
                      `${allJobs
                        .filter((j: any) => j.completed)
                        .reduce((acc: number, j: any) => acc + (Number(j.budget) || 0), 0)
                        .toFixed(4)} ETH`
                    ) : showEarnings ? (
                      totalEarnings
                    ) : (
                      <span className="tracking-widest">••••••</span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {!isClient && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefreshEarnings}
                      disabled={earningsLoading}
                      className="h-10 w-10"
                    >
                      <RefreshCw
                        size={20}
                        className={earningsLoading ? "animate-spin" : ""}
                      />
                    </Button>
                  )}
                  {!isClient && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowEarnings(!showEarnings)}
                      className="h-10 w-10"
                    >
                      {showEarnings ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  )}
                  <div className="p-3 rounded-xl bg-card border text-purple-500">
                    <IconEthereum size={24} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            {isClient ? "Your Job Postings" : "Your Proposals"}
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {displayItems.length}
            </span>
          </h2>
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder={isClient ? "Search jobs..." : "Search proposals..."}
              className="pl-10 rounded-full bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-border/50">
                <CardHeader className="h-40 bg-muted/20" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 w-2/3 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
            <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <Search className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-xl font-medium">
              {isClient ? "No jobs found" : "No proposals sent"}
            </h3>
            <p className="text-muted-foreground mt-2 mb-6">
              {searchQuery
                ? "No results match your search criteria."
                : isClient
                  ? "You haven't posted any jobs yet."
                  : "You haven't submitted any proposals yet."}
            </p>
            {!searchQuery && isClient && (
              <CreateJobDialog>
                <Button variant="outline" className="rounded-full">
                  Post your first job
                </Button>
              </CreateJobDialog>
            )}
            {!searchQuery && !isClient && (
              <Link href="/explore/jobs">
                <Button variant="outline" className="rounded-full">
                  Explore Jobs
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {isClient
                ? filteredJobs.map((job: any, index: number) => (
                    <motion.div
                      key={job.cid || index}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <JobCard job={job} showProposals={true} />
                    </motion.div>
                  ))
                : filteredProposals.map((proposal: any) => (
                    <motion.div
                      key={proposal.cid || proposal.proposalID}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover:shadow-lg transition-all h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm group">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              Job #{proposal.jobID}
                            </Badge>
                            <Badge
                              variant={
                                proposal.approved ? "default" : "secondary"
                              }
                              className={
                                proposal.approved
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                              }
                            >
                              {proposal.approved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-bold line-clamp-1">
                            Application
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <Clock size={12} />
                            {proposal.timestamp
                              ? formatDistanceToNow(
                                  new Date(proposal.timestamp),
                                  {
                                    addSuffix: true,
                                  },
                                )
                              : "Recently"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="prose prose-sm dark:prose-invert">
                            <p className="line-clamp-3 text-muted-foreground text-sm">
                              {proposal.description}
                            </p>
                          </div>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto space-y-2">
                          <Link
                            href={`/job/${proposal.jobID}`}
                            className="w-full"
                          >
                            <Button
                              variant="secondary"
                              className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            >
                              View Job Details
                            </Button>
                          </Link>
                          {proposal.approved && (
                            <Link
                              href={`/deliver/job/${proposal.jobID}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                              >
                                Deliver Work
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
