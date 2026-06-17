import { IUser, UserRole } from "@/types/user.types";

// Static data used by the "Mock UI" dev tool to populate the UI without any
// wallet connection, on-chain reads, or IPFS fetches. It covers the listing
// screens (dashboard, explore) as well as the per-job detail, track, and
// deliver screens for both the Client and Freelancer entities.

export const MOCK_CLIENT_ADDRESS =
  "0xC1100000000000000000000000000000000C11e7";
export const MOCK_FREELANCER_ADDRESS =
  "0xF7ee000000000000000000000000000000F7ee71";

export const mockClientProfile: IUser = {
  username: "DevClient_Mock",
  userAddress: MOCK_CLIENT_ADDRESS,
  role: UserRole.Client,
};

export const mockFreelancerProfile: IUser = {
  username: "DevFreelancer_Mock",
  userAddress: MOCK_FREELANCER_ADDRESS,
  role: UserRole.Freelancer,
};

export const getMockProfile = (role: UserRole): IUser =>
  role === UserRole.Freelancer ? mockFreelancerProfile : mockClientProfile;

export const getMockAddress = (role: UserRole): string =>
  role === UserRole.Freelancer ? MOCK_FREELANCER_ADDRESS : MOCK_CLIENT_ADDRESS;

const inDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Shape covers everything dashboard, explore, JobCard, and the per-job detail
// / track / deliver screens read off a job.
export const mockJobs = [
  {
    jobID: "1",
    cid: "mock-job-1",
    clientAddress: MOCK_CLIENT_ADDRESS,
    client: MOCK_CLIENT_ADDRESS,
    freelancer: MOCK_FREELANCER_ADDRESS,
    freelancerAddress: MOCK_FREELANCER_ADDRESS,
    title: "Build a Decentralized Skill-Sharing Platform",
    description:
      "We need a skilled developer to build a decentralized platform for skill sharing with on-chain escrow.",
    budget: 2.5,
    amount: "2500000000000000000",
    category: "Development",
    skills: ["React", "Solidity", "TypeScript"],
    deliverables:
      "Source code via GitHub, a deployed demo link, and a short walkthrough video.",
    requirements: [
      { label: "GitHub Repo", description: "Link to the public repository" },
      { label: "Live Demo", description: "URL of the deployed application" },
    ],
    deadline: inDays(7),
    completed: false,
    clientApproved: false,
    freelancerApproved: false,
  },
  {
    jobID: "2",
    cid: "mock-job-2",
    clientAddress: MOCK_CLIENT_ADDRESS,
    client: MOCK_CLIENT_ADDRESS,
    freelancer: MOCK_FREELANCER_ADDRESS,
    freelancerAddress: MOCK_FREELANCER_ADDRESS,
    title: "Design a Modern Web3 Landing Page",
    description:
      "Looking for a designer to craft a sleek, conversion-focused landing page for our DApp.",
    budget: 1.2,
    amount: "1200000000000000000",
    category: "Design",
    skills: ["Figma", "UI/UX", "Branding"],
    deliverables: "Figma source file and exported assets for handoff.",
    requirements: [
      { label: "Figma File", description: "Editable design source" },
      { label: "Assets", description: "Exported images and icons" },
    ],
    deadline: inDays(4),
    completed: false,
    clientApproved: false,
    freelancerApproved: true,
  },
  {
    jobID: "3",
    cid: "mock-job-3",
    clientAddress: MOCK_CLIENT_ADDRESS,
    client: MOCK_CLIENT_ADDRESS,
    freelancer: MOCK_FREELANCER_ADDRESS,
    freelancerAddress: MOCK_FREELANCER_ADDRESS,
    title: "Write Technical Documentation for Smart Contracts",
    description:
      "Produce clear developer docs covering our contract interfaces, events, and integration guide.",
    budget: 0.8,
    amount: "800000000000000000",
    category: "Writing",
    skills: ["Technical Writing", "Solidity"],
    deliverables: "A published docs site and a markdown source bundle.",
    requirements: [
      { label: "Docs Site", description: "Deployed documentation URL" },
    ],
    deadline: daysAgo(2),
    completed: true,
    clientApproved: true,
    freelancerApproved: true,
  },
  {
    jobID: "4",
    cid: "mock-job-4",
    clientAddress: MOCK_CLIENT_ADDRESS,
    client: MOCK_CLIENT_ADDRESS,
    freelancer: MOCK_FREELANCER_ADDRESS,
    freelancerAddress: MOCK_FREELANCER_ADDRESS,
    title: "Run a Token Launch Marketing Campaign",
    description:
      "Drive awareness for our upcoming token launch across Web3 social channels and communities.",
    budget: 3.0,
    amount: "3000000000000000000",
    category: "Marketing",
    skills: ["Growth", "Community", "Content"],
    deliverables: "A campaign report with reach and engagement metrics.",
    requirements: [
      { label: "Campaign Report", description: "Summary of results" },
    ],
    deadline: inDays(14),
    completed: false,
    clientApproved: false,
    freelancerApproved: false,
  },
];

export const getMockJobById = (id?: string | string[]) => {
  const jobId = Array.isArray(id) ? id[0] : id;
  return mockJobs.find((j) => j.jobID === jobId) ?? mockJobs[0];
};

// Shape covers everything the dashboard freelancer view reads off a proposal.
export const mockProposals = [
  {
    proposalID: "1",
    cid: "mock-proposal-1",
    jobID: "1",
    freelancerName: "DevFreelancer_Mock",
    description:
      "Experienced full-stack blockchain developer with 5 years building DApps in React and Solidity. I can deliver this within the deadline with high quality.",
    timestamp: daysAgo(1),
    approved: true,
    budget: 2.5,
  },
  {
    proposalID: "2",
    cid: "mock-proposal-2",
    jobID: "2",
    freelancerName: "DevFreelancer_Mock",
    description:
      "Product designer specializing in Web3 interfaces. Portfolio includes several launched DApps. Happy to share Figma mockups before starting.",
    timestamp: daysAgo(3),
    approved: false,
    budget: 1.2,
  },
];

// Shape matches ProposalWithMetadata used by the client-facing track screen.
export const getMockTrackProposals = (id?: string | string[]) => {
  const jobId = (Array.isArray(id) ? id[0] : id) ?? "1";
  return [
    {
      proposalID: BigInt(1),
      proposalCID: "mock-track-proposal-1",
      jobID: BigInt(jobId),
      approved: true,
      freelancer: MOCK_FREELANCER_ADDRESS,
      metadata: {
        freelancerName: "DevFreelancer_Mock",
        freelancerAddress: MOCK_FREELANCER_ADDRESS,
        description:
          "Experienced full-stack blockchain developer with 5 years building DApps in React and Solidity. I can deliver this within the deadline with high quality.",
        timestamp: daysAgo(1),
      },
    },
    {
      proposalID: BigInt(2),
      proposalCID: "mock-track-proposal-2",
      jobID: BigInt(jobId),
      approved: false,
      freelancer: "0xA11ce00000000000000000000000000000A11ce0",
      metadata: {
        freelancerName: "AliceDev",
        freelancerAddress: "0xA11ce00000000000000000000000000000A11ce0",
        description:
          "Frontend specialist with deep experience in React and wallet integrations. Available to start immediately.",
        timestamp: daysAgo(2),
      },
    },
  ];
};

export const mockDeliverables: Record<string, string> = {
  "GitHub Repo": "https://github.com/skillchain/decentralized-platform",
  "Live Demo": "https://skillchain-demo.vercel.app",
};
