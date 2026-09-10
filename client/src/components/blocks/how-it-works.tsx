import { cn } from "@/lib/utils";
import {
  IconFilePencil,
  IconUsersGroup,
  IconShieldLock,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";

const steps = [
  {
    title: "Post a Job",
    description:
      "Describe your project, set a budget, and lock the funds on-chain. Your ETH is held safely in the smart contract escrow.",
    icon: <IconFilePencil />,
  },
  {
    title: "Receive Proposals",
    description:
      "Talented freelancers submit proposals. Review their work and hire the best fit directly from your dashboard.",
    icon: <IconUsersGroup />,
  },
  {
    title: "Work in Escrow",
    description:
      "Funds stay locked in the contract while the freelancer delivers. No middleman, no platform holding your money.",
    icon: <IconShieldLock />,
  },
  {
    title: "Release on Approval",
    description:
      "Once both sides approve the deliverable, the smart contract instantly releases payment to the freelancer.",
    icon: <IconRosetteDiscountCheck />,
  },
];

export function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
          How SkillChain Works
        </h2>
        <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
          Trustless freelancing powered by smart contracts. No escrow agents, no
          chargebacks — just code that pays out when the work is done.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              "group relative flex flex-col rounded-2xl border border-primary/15 bg-background/50 p-6 transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                {step.icon}
              </div>
              <span className="text-4xl font-bold text-neutral-200 dark:text-neutral-800 group-hover:text-blue-500/30 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-bold text-neutral-800 dark:text-neutral-100">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
