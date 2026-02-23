export interface IRequirement {
  label: string;
  description?: string;
}

export interface IJob {
  title: string;
  description: string;
  category: string;
  budget: bigint;
  requirements?: IRequirement[];
  freelancerAddress: string;
  clientAddress: string;
  completed: boolean;
  freelancerApproved: boolean;
  clientApproved: boolean;
  amount?: bigint;
}
