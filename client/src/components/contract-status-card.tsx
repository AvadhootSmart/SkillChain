import { CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { IJob } from "@/types/job.types";

export const ContractStatusSidebar = ({ job }: { job: IJob }) => (
  <Card className="rounded-[2rem] shadow-xl bg-card border-border/50 overflow-hidden">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Contract Status
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/50">
        <span className="text-sm font-medium">Freelancer</span>
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-sm font-black">Escrow Status</span>
          </div>
          {job.amount !== undefined && (
            <Badge
              variant={job.amount === BigInt(0) ? "outline" : "default"}
              className={job.amount === BigInt(0) ? "text-green-600 border-green-600" : ""}
            >
              {job.amount === BigInt(0) ? "Released" : "Locked"}
            </Badge>
          )}
        </div>
        
        {job.amount === BigInt(0) ? (
           <p className="text-xs text-green-600/80 font-medium leading-relaxed">
             Funds have been successfully released to the freelancer.
           </p>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Funds will be automatically released to your wallet once both you and
            the client mark the job as completed.
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);
