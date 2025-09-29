
# **Decentralized Freelance Platform – Development Roadmap**

---

## **Phase 0: Preparation & Planning**

**Goals:**

* Finalize feature set and architecture.
* Set up dev tools and repo structure.

**Tasks:**

1. Define smart contract data models:

   * Users (wallet → profile CID)
   * Jobs (jobID → job CID, client address)
   * Proposals (proposalID → proposal CID, freelancer address)
   * Escrow/payment logic
2. Set up repo:

   * `frontend/` → Next.js
   * `contracts/` → Solidity + Foundry
   * `utils/` → IPFS upload helpers
3. Configure environment variables:

   * Pinata JWT
   * Ethereum testnet RPC URL
4. Decide on test network: Goerli / Sepolia.

---

## **Phase 1: Wallet Authentication & Profile Management**

**Goals:**

* Users can connect wallet.
* Users can create and update their profiles.

**Frontend Tasks:**

* Integrate RainbowKit + Wagmi.
* Use `useAccount()` and `useConnect()` hooks.
* Build **Profile Creation / Edit Form**.

**Smart Contract Tasks:**

* Implement **Profile Registry**:

```solidity
mapping(address => string) public userProfileCIDs;
function updateProfile(string memory _cid) external;
```

**IPFS Integration:**

* Upload JSON to Pinata → return CID.
* Store CID on-chain via contract call.

**Testing:**

* Verify wallet connection, profile creation, and IPFS + contract linkage.

---

## **Phase 2: Job Creation (Client)**

**Goals:**

* Clients can create jobs.
* Jobs are stored off-chain (IPFS) and referenced on-chain.

**Frontend Tasks:**

* Job creation form → uploads JSON to IPFS.
* Call smart contract to register job CID.

**Smart Contract Tasks:**

* Implement **Job Registry**:

```solidity
struct Job { address client; string cid; bool isOpen; }
mapping(uint256 => Job) public jobs;
function createJob(string memory _cid) external;
```

**Testing:**

* Create job → fetch job CID from contract → fetch JSON from IPFS.

---

## **Phase 3: Proposal Submission (Freelancer)**

**Goals:**

* Freelancers can view jobs.
* Submit proposals linked to jobs.

**Frontend Tasks:**

* Display list of jobs → fetch CIDs from smart contract → fetch JSON from IPFS.
* Proposal form → upload proposal JSON to IPFS → call contract.

**Smart Contract Tasks:**

* Implement **Proposal Registry**:

```solidity
struct Proposal { address freelancer; string cid; bool accepted; }
mapping(uint256 => Proposal[]) public jobProposals;
function submitProposal(uint256 jobId, string memory _cid) external;
```

**Testing:**

* Submit proposal → verify contract stores CID → fetch and display proposal.

---

## **Phase 4: Freelancer Selection & Escrow Setup**

**Goals:**

* Client selects freelancer.
* Escrow funds are deposited.

**Smart Contract Tasks:**

* Implement **Escrow logic**:

```solidity
mapping(uint256 => uint256) public escrowBalances;
function depositEscrow(uint256 jobId) external payable;
function acceptProposal(uint256 jobId, uint256 proposalIndex) external;
```

**Frontend Tasks:**

* Client views proposals → selects freelancer.
* Deposit ETH/ERC20 into escrow via contract.

**Testing:**

* Deposit funds → verify contract balance.
* Selected freelancer marked in contract.

---

## **Phase 5: Job Completion & Payment Release**

**Goals:**

* Freelancer marks job as completed.
* Client confirms completion → payment released.

**Smart Contract Tasks:**

* Implement **completion confirmation**:

```solidity
mapping(uint256 => bool) public clientConfirmed;
mapping(uint256 => bool) public freelancerConfirmed;

function markCompleteByFreelancer(uint256 jobId) external;
function markCompleteByClient(uint256 jobId) external;
function releasePayment(uint256 jobId) internal;
```

**Frontend Tasks:**

* Buttons for freelancer/client to confirm.
* Display escrow status → payment released.

**Testing:**

* Verify mutual confirmation triggers payment release automatically.

---

## **Phase 6: UI/UX Enhancements**

**Goals:**

* Make the platform user-friendly.

**Tasks:**

* Responsive Next.js design for dashboards:

  * Jobs list
  * Proposals
  * Profile page
* Show **real-time updates** using polling or event subscriptions (`Viem` + `ethers.js` events).
* Add **notifications** (optional: Push Protocol/XMTP).

---

## **Phase 7: Optional Enhancements**

**Goals:**

* Improve platform features and scalability.

**Ideas:**

* **Versioned profiles and jobs** (store history of CIDs).
* **Off-chain indexing with The Graph** for faster querying.
* **Reputation system** for freelancers/clients.
* **Filters/search** for jobs.
* **Support ERC20 payments**.
* **IPFS media uploads** (images, PDFs) for portfolio or job attachments.

---

## **Phase 8: Testing & Deployment**

**Goals:**

* Ensure security and usability.

**Tasks:**

* Unit & integration tests for smart contracts (Foundry).
* Frontend testing with Wagmi + Viem hooks.
* Deploy contracts to **testnet** → test full end-to-end flow.
* Deploy frontend → Netlify, Vercel, or decentralized hosting (IPFS, Fleek).

---

## ✅ **Recommended Development Sequence**

1. Wallet auth + profile (Phase 1)
2. Job creation (Phase 2)
3. Proposal submission (Phase 3)
4. Freelancer selection + escrow (Phase 4)
5. Job completion & payment release (Phase 5)
6. Frontend polish & UX improvements (Phase 6)
7. Optional features (Phase 7)
8. Testing & deployment (Phase 8)

