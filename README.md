# SkillChain

Decentralized freelance platform: on-chain profiles, jobs, and proposals (Solidity/Foundry) with a Next.js client. Job/profile/proposal content lives on IPFS (Pinata); only CIDs are stored on-chain.

```
contract/   Foundry project (Profile.sol, Jobs.sol, Proposals.sol)
client/     Next.js 16 app (wagmi + RainbowKit, Tailwind)
```

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `anvil`)
- [Bun](https://bun.sh) (the client uses `bun.lock`)
- A [Pinata](https://pinata.cloud) account for JWT + gateway

## 1. Contracts

```bash
cd contract
forge install          # pulls lib/ submodules
forge build
forge test
```

Run a local chain in one terminal:

```bash
anvil
```

Deploy to it in another (any anvil private key works):

```bash
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
  --private-key <anvil-private-key> --broadcast
```

Note the three deployed addresses from the output — `UserProfile`, `JobsContract`, `ProposalsContract`.

## 2. Client

```bash
cd client
bun install
cp env-example .env
```

Fill `.env`:

```
NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS=   # from the deploy output
NEXT_PUBLIC_JOB_CONTRACT_ADDRESS=
NEXT_PUBLIC_PROPOSAL_CONTRACT_ADDRESS=
PINATA_API_KEY=
PINATA_API_SECRET=
NEXT_PUBLIC_PINATA_JWT=
NEXT_PUBLIC_PINATA_GATEWAY=            # e.g. your-gateway.mypinata.cloud
```

```bash
bun run dev     # http://localhost:3000
```

In MetaMask, add the local network `http://127.0.0.1:8545` (chain id `31337`) and import an anvil account.

## Notes

- `client/src/providers/provider.tsx` is wired to the local `foundry` chain and has a placeholder RainbowKit `projectId`; replace it with a [WalletConnect](https://cloud.walletconnect.com) project id if you want WalletConnect wallets. Sepolia config is commented out in the same file.
- ABIs in `client/src/abi/*.json` are copied from `contract/out/`; re-copy them after changing a contract.
