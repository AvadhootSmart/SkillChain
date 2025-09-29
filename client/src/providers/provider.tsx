"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { foundry, localhost } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { http } from "viem";

const foundryRpcUrl = "http://127.0.0.1:8545";
const config = getDefaultConfig({
  appName: "SkillChain",
  projectId: "your-project-id",
  // chains: [foundry, sepolia],
  chains: [foundry],
  transports: {
    // [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_URL!),
    [foundry.id]: http(foundryRpcUrl),
    // [localhost.id]: http("http://127.0.0.1:8545"),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
