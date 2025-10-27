import { HashConnect } from "hashconnect";



export default async function connectToWallet() {
  const hc = new HashConnect();

  const app = {
    name: "Agent Hive",
    description: "Agent Hive Dapp",
    icon: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
    url: typeof window !== "undefined" ? window.location.origin : "http://localhost",
  };

  try {
    const initData = await hc.init(app, "testnet");
    console.log("Initialized:", initData);

    const state = await hc.connect();
    console.log("Connected state:", state);

    const pairingString = hc.generatePairingString(state, "testnet", false);
    console.log("Pairing string:", pairingString);

    hc.findLocalWallets();

    return { 
      success: true, 
      pairingString,
      state 
    };
  } catch (error: any) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
}