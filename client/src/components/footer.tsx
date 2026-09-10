"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DevTestingButtons } from "./dev-testing-buttons";
import { Terminal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const [showDevTools, setShowDevTools] = useState(false);

  return (
    <footer className="border-t border-primary/10 mt-20 bg-background/40">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
              SkillChain
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Trustless freelancing on-chain. Hire, work, and get paid through
              smart contract escrow.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Platform
              </span>
              <Link href="/explore" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-500 transition-colors">
                Explore Jobs
              </Link>
              <Link href="/dashboard" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-500 transition-colors">
                Dashboard
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Company
              </span>
              <Link href="/about" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} SkillChain. All rights reserved.
          </p>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-primary/20 text-xs"
              onClick={() => setShowDevTools((v) => !v)}
            >
              <Terminal className="size-3.5 text-purple-500" />
              {showDevTools ? "Hide Dev Tools" : "Show Dev Tools"}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  showDevTools && "rotate-180"
                )}
              />
            </Button>
            {showDevTools && <DevTestingButtons />}
          </div>
        </div>
      </div>
    </footer>
  );
}
