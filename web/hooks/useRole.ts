"use client";

import { useReadContracts, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, ROLES, supplyChainAbi } from "@/lib/contract";

export type Role = "admin" | "manufacturer" | "distributor" | "retailer" | "customer";

export function useRole(): { role: Role; loading: boolean; address?: string } {
  const { address } = useAccount();
  const { data, isLoading } = useReadContracts({
    contracts: address
      ? [
          { address: CONTRACT_ADDRESS, abi: supplyChainAbi, functionName: "hasRole", args: [ROLES.ADMIN, address] },
          { address: CONTRACT_ADDRESS, abi: supplyChainAbi, functionName: "hasRole", args: [ROLES.MANUFACTURER, address] },
          { address: CONTRACT_ADDRESS, abi: supplyChainAbi, functionName: "hasRole", args: [ROLES.DISTRIBUTOR, address] },
          { address: CONTRACT_ADDRESS, abi: supplyChainAbi, functionName: "hasRole", args: [ROLES.RETAILER, address] },
        ]
      : [],
    query: { enabled: !!address },
  });

  let role: Role = "customer";
  if (data) {
    if (data[0]?.result) role = "admin";
    else if (data[1]?.result) role = "manufacturer";
    else if (data[2]?.result) role = "distributor";
    else if (data[3]?.result) role = "retailer";
  }
  return { role, loading: isLoading, address };
}
