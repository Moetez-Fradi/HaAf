import { HashConnect } from "hashconnect";

const STORAGE_KEY = "agenthive_hashconnect_v1";
const NETWORK = "testnet";

function loadSaved() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}
function saveSaved(obj: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export default async function connectToWallet() {
  const hc = new HashConnect();
  const appMetadata = {
    name: "Agent Hive",
    description: "Agent Hive Dapp",
    icon: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
    url: typeof window !== "undefined" ? window.location.origin : "http://localhost",
  };

  const saved = loadSaved();
  let initData: any;

  try {
    if (saved?.privKey) {
      try {
        initData = await (hc as any).init(appMetadata, saved.privKey);
      } catch {
        initData = await hc.init(appMetadata);
      }
    } else {
      initData = await hc.init(appMetadata);
    }

    if (initData?.privKey) {
      saveSaved({ privKey: initData.privKey, topic: initData.topic ?? saved?.topic ?? null });
    }

    // Create a promise to resolve when wallet pairs
    let pairedResolve: (val: any) => void;
    const pairedPromise = new Promise((resolve) => {
      pairedResolve = resolve;
    });

    hc.pairingEvent.on((pairingData: any) => {
      const s = loadSaved() || {};
      if (pairingData.topic) {
        s.topic = pairingData.topic;
        saveSaved(s);
      }

      if (pairingData.accountIds?.length) {
        pairedResolve(pairingData);
      }
    });

    const state = await hc.connect();
    const pairingString = hc.generatePairingString(state, NETWORK, false);
    hc.findLocalWallets();

    return { success: true, hc, state, pairingString, pairedPromise };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}
