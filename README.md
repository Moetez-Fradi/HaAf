# Decentralized AI Agents Platform

DePIN + AI agents platform

⸻

## Project goal

Build a decentralized AI-agent marketplace where developers publish Dockerized AI tools, users assemble workflows (drag & drop), and node hosts execute containers and get paid in HBAR via Hedera Testnet.

## Scope
	1.	Wallet linking (HashConnect / HashPack) & Hedera testnet micropayments.
	2.	Tool registry: developers register tools with a public Docker image URL and metadata is stored in Supabase.
	3.	Decentralized execution: simple node client that pulls and runs specified Docker images and returns signed results; backend verifies & pays nodes and tool owners.

⸻

## Architecture

    User Browser / Next.js UI
    ├─ Wallet connect (HashConnect)
    ├─ Build workflows (React Flow)
    └─ Trigger run -> POST /api/run

    NestJS Backend
    ├─ Auth + Supabase (tools, users, workflows, reviews)     
    ├─ Hedera SDK (collect escrow, payouts)                   
    ├─ Task dispatcher (Redis queue or WebSocket)             
    └─ Node registry + verifier
                                                    
    Node Client(s) — Docker Engine on participant machines]     
    ├─ Pull docker image (public URL)                         
    ├─ Run container with standardized REST interface (/run)   
    ├─ Compute, produce result, sign result with local key     
    └─ Return result + signature -> backend                    
                                                           
    Backend: verify signature -> record in Supabase -> Hedera payout

    Supabase: metadata, logs, reviews, workflow JSON)

### Notes:
- FastAPI (centralized AI) exists as fallback: when no nodes, backend calls FastAPI to run the containers.
- Docker images are hosted by developers in public registries, URLs get stored in Supabase.


⸻

## Folder structure

    /frontend            # Next.js (React) + HashConnect + React Flow
    /backend             # NestJS orchestration + Hedera SDK + Prisma (Supabase)
    /decentralizer       # FastAPI and Dockerfiles for fallback tool execution
    /node-client         # Node.js worker to pull images, run container, sign results
    README.md

⸻

## Supabase Schmea

User { id, displayName, walletAccountId, createdAt }
Tool { id, name, description, dockerImageUrl, ownerWallet, pricePerCall, rating, usageCount }
Node { id, ownerUserId, nodeWalletId, publicKey, status, capabilities }
Workflow { id, ownerUserId, graphJson }
Task { id, workflowId, toolId, nodeId, status, resultHash, txHash }
Payment { id, taskId, payer, amount, status, txHash }
Review { id, toolId, userId, stars, comment }

⸻

## Hedera specifics
	•	Hedera Testnet and @hashgraph/sdk (JS) in backend. Keep operator keys in backend .env
	•	Flow: user transfers HBAR -> platform escrow account (platform operator gets TX ID) -> backend verifies receipt -> dispatches task -> on successful signed result from node, backend pays node & tool owner with TransferTransaction.
	•	Choose ED25519 keys for node signing to avoid ECDSA alias issues.

⸻

## Node client execution contract
	•	Container must expose POST /run accepting JSON input: { input: {...} } and return { result: {...} }. The formats could be desceibed in the metadata.
	•	Node client runs container, sends input, computes sha256(result) and signs it with local private key; returns { taskId, result, resultHash, signature }.
	•	Backend verifies signature using stored public key before payout.

⸻

## Criteria

	•	Wallet connected in UI (HashConnect). Show accountId and balance.
	•	Developer can register a tool by providing public Docker image URL + metadata.
	•	User builds a 2-block workflow and runs it.
	•	Two node clients (can be local) pull the Docker image, execute tasks, return signed results.
	•	Backend verifies results and performs Hedera payouts (tx links visible). Logs in Supabase.
	•	3-minute demo video + repo with README.md and reproducible docker-compose script.