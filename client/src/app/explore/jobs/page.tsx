"use client";

import React from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { jobsContract } from "@/abi";
import { fetchFromPinata } from "@/lib/pinata";
import { encodeEventTopics, decodeEventLog } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/pageWrapper";
import { JobCard } from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Briefcase,
  Layers,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Type for IPFS metadata
interface IJobMetadata {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category?: string;
}

// Combined on-chain + IPFS job
interface IJob extends IJobMetadata {
  jobID: string;
  clientAddress: string;
  amount: string;
}

const CATEGORIES = [
  { name: "All Jobs", icon: LayoutGrid },
  { name: "Development", icon: Zap },
  { name: "Design", icon: Sparkles },
  { name: "Marketing", icon: ArrowRight },
  { name: "Writing", icon: Layers },
];

const ExploreJobsPage = () => {
  const publicClient = usePublicClient();
  const [allJobs, setAllJobs] = React.useState<IJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All Jobs");

  // Fetch all past JobCreated events
  React.useEffect(() => {
    async function fetchAllJobs() {
      if (!publicClient) return;

      setLoading(true);
      try {
        const topics = encodeEventTopics({
          abi: jobsContract.abi,
          eventName: "JobCreated",
        });

        const logs = await publicClient.getLogs({
          address: jobsContract.address,
          fromBlock: 0n,
          toBlock: "latest",
          topics,
        });

        if (!logs || logs.length === 0) {
          setAllJobs([]);
          return;
        }

        const events = logs.map((log) =>
          decodeEventLog({
            abi: jobsContract.abi,
            data: log.data,
            topics: log.topics,
            eventName: "JobCreated",
          })
        );

        const jobs: IJob[] = await Promise.all(
          events.map(async (event: any) => {
            try {
              const jobCID = event.args.jobCID as string;
              const metadata: IJobMetadata = await fetchFromPinata(jobCID);

              return {
                jobID: event.args.jobID.toString(),
                clientAddress: event.args.clientAddress as string,
                amount: event.args.amount.toString(),
                ...metadata,
              };
            } catch (err) {
              console.error("Error fetching job metadata:", err);
              return {
                jobID: event.args.jobID.toString(),
                clientAddress: event.args.clientAddress as string,
                amount: event.args.amount.toString(),
                title: "Premium Opportunity",
                description:
                  "This job's full details are being loaded from the decentralized web.",
                budget: "Pending",
                deadline: "",
                category: "General",
              };
            }
          })
        );

        // Sort by newest first
        setAllJobs(jobs.reverse());
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllJobs();
  }, [publicClient]);

  // Watch for new jobs
  useWatchContractEvent({
    address: jobsContract.address,
    abi: jobsContract.abi,
    eventName: "JobCreated",
    onLogs(logs: any[]) {
      logs.forEach(async (log) => {
        try {
          const metadata: IJobMetadata = await fetchFromPinata(log.args.jobCID);
          const newJob: IJob = {
            jobID: log.args.jobID.toString(),
            clientAddress: log.args.clientAddress as string,
            amount: log.args.amount.toString(),
            ...metadata,
          };
          setAllJobs((prev) => [newJob, ...prev]);
        } catch (err) {
          console.error("Error processing new job:", err);
        }
      });
    },
  });

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Jobs" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageWrapper className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 inline-block">
              Discover On-Chain Opportunities
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Find Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Web3 Career Move
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Browse the highest quality decentralized jobs. Payments secured
              via smart contracts, verified on-chain.
            </p>

            {/* Premium Search Bar */}
            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-600/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center bg-card border-border shadow-2xl rounded-2xl p-2 h-16">
                <Search className="ml-4 text-muted-foreground" size={24} />
                <Input
                  className="flex-1 border-none focus-visible:ring-0 text-lg bg-transparent"
                  placeholder="Search by role, skill, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="h-full px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                  Search
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-32">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (UI) */}
          <aside className="w-full lg:w-72 space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Filter size={18} className="text-primary" />
                Categories
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      selectedCategory === cat.name
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-card hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <cat.icon size={18} />
                    <span className="font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <Zap className="text-primary mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Want to Hire?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Find the best talent in the Web3 space. Post a job in minutes.
                </p>
                <Button className="w-full rounded-xl" variant="default">
                  Post a Job
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Job Listings Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="text-primary" />
                {loading
                  ? "Loading Jobs..."
                  : `${filteredJobs.length} Live Opportunities`}
              </h2>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <button className="px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                  Newest
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                  Highest Paid
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse border-border/50">
                    <CardHeader className="h-40 bg-muted/20" />
                    <CardContent className="p-6 space-y-4">
                      <div className="h-6 w-2/3 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-10 w-full bg-muted rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                <div className="mx-auto w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  No jobs match your search
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your keywords or category filters to find what
                  you're looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-8 rounded-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Jobs");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.jobID}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default ExploreJobsPage;
