import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { IconEthereum } from "@/icons/ethereum";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Clock, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { ProposalsPopup } from "./popups/proposalsPopup";

interface JobCardProps {
  job: any;
  showProposals?: boolean;
}

export const JobCard = ({ job, showProposals }: JobCardProps) => {
  const jobUrl = showProposals ? `track/job/${job.jobID}` : `/job/${job.jobID}`;

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 h-full flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
            {job.category || "General"}
          </span>
          <div className="flex gap-2">
            <Link href={jobUrl}>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink size={16} />
              </button>
            </Link>
          </div>
        </div>
        <CardTitle className="text-xl mt-4 line-clamp-1 group-hover:text-primary transition-colors">
          {job.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-2 h-10">
          {job.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>
                {job.deadline
                  ? formatDistanceToNow(new Date(job.deadline), {
                      addSuffix: true,
                    })
                  : "No deadline"}
              </span>
            </div>
            <div className="font-bold text-lg text-primary flex items-center gap-1">
              <IconEthereum />
              {job.budget}
            </div>
          </div>
          <div className="w-full h-[1px] bg-border/50" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              Published
            </span>
          </div>
        </div>
      </CardContent>
      <div className="px-6 mt-auto flex flex-col gap-3">
        <Link href={jobUrl} className="w-full">
          <Button className="w-full rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};
