# Agent Hive
## AI for people, powered by people.
DePIN + AI agents platform for creating automation workflows, renting hardware, developping tools and more!

## Project goal

We build a decentralized AI-agent marketplace where developers publish Dockerized AI tools, users assemble workflows in a drag & drop fashion, and node hosts execute containers and get paid in HBAR via Hedera Testnet.

## Scope
	1.	Wallet linking (HashConnect / HashPack) & Hedera testnet micropayments.
	2.	Tool registry: developers register tools with a public Docker image URL and metadata is stored in Supabase.
	3.  Workflow Creation: users can build automation workflows from tools designed and developped by the communiy for a small fee.
	4.	Decentralized execution: simple node client that pulls and runs specified Docker images and returns signed results; backend verifies & pays nodes and tool owners.

⸻

## Architecture

    User Browser / Next.js UI
    ├─ Wallet connect (HashConnect)
    ├─ browse workflows and tools
	├─ Build amazing workflows (React Flow)
	├─ Test your amazing workflows directly on the UI
    └─ Depoy your workflows and get a url to run them!

    NestJS Backend
    ├─ Auth + Supabase (tools, users, workflows, reviews, payments & reciepts)     
    ├─ Hedera SDK (collect escrow, payouts)                   
    ├─ Task dispatcher (run on decentralized nodes if available or on our backup server)            
    └─ Node registry + verifier
                                                    
    Express Server with Docker Engine     
    ├─ Pull docker image (public URL)                         
    ├─ Run container with standardized REST interface (/run)   
    ├─ Compute, produce result, sign result with local key    
    ├─ Caculate RAM, CPU and power usage to produce fair excution prices for nodes    
    ├─ Compute, produce result, sign result with local key     
    └─ Return result + signature -> backend                    
                                                           

### Notes:
- Express (centralized AI) exists as fallback: when no nodes, backend calls this server to run the containers.
- Docker images are hosted by developers in public registries, URLs get stored in Supabase.
- Environment variables are encrypted in the database.
- One time tokens are provided to prevent nodes from maliciously using env variables.
- the tool creation UI is Awsome !
- An API documentation could be provided by us if needed, we have a messy .txt file where we stored all the requests and responses shapes.


⸻

## Folder structure

    /frontend            # Next.js + HashConnect + React Flow
    /backend             # NestJS + Hedera SDK + Prisma (Supabase)
    /decentralizer       # ExpressJS and Dockerfiles for fallback tool execution
    /renter              # Node.js worker to pull images, run container, sign results
	/sampleTools         # A bunch of exemple tools we created for demo purposes
    README.md

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
