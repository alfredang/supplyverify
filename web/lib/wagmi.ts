import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, hardhat } from "wagmi/chains";
import { http } from "viem";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

export const wagmiConfig = getDefaultConfig({
  appName: "Supply Chain Verify",
  projectId,
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
