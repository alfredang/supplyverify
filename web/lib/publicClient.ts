import { createPublicClient, http } from "viem";
import { sepolia, hardhat } from "viem/chains";
import { CHAIN_ID } from "./contract";

const chain = CHAIN_ID === 31337 ? hardhat : sepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
});
