#  How to Run Your Own AgentHive

Easily spin up your own local instance of **AgentHive** , including the backend, frontend, and decentralized components.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Moetez-Fradi/HaAf.git
cd HaAf
```

---

## 2. Prepare Your Environment

Before running any service, make sure you have:

* **Node.js** (v18+ recommended)
* **pnpm** package manager
* Required environment variables set up in a `.env` file
  (see the provided  `.env.local` example for reference)

---

## 3. Start the Backend

Open a terminal and run:

```bash
cd backend
pnpm install
pnpm run start:dev
```

---

## 4. Start the Frontend

In a new terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

> Your app should now be available at [http://localhost:3000](http://localhost:3000).

---

## 5. Start the Centralized Server

In a third terminal:

```bash
cd decentralizer
pnpm install
node server.js
```

---

## 6. Run a Decentralized Node

To join the decentralized network as a node:

```bash
cd renter
pnpm install
node renter-node.js
```

Each node corresponds to one **tool** in your workflow.
If your workflow contains multiple tools, you’ll need to start one node per tool.

---

## 7. Running Multiple Nodes

For each additional node:

1. Generate a new key pair (`node_keys1.json`)
2. Run the node on a different port:

```bash
NODE_FILE=./node_keys1.json NODE_PORT=9001 node renter-node.js
```
## ✅ Done!

That’s it! 🎉
You now have a fully operational **AgentHive** instance running locally — including backend APIs, a web interface, and one or more decentralized execution nodes.
