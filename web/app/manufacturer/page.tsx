"use client";

import { AppShell } from "@/components/AppShell";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, supplyChainAbi } from "@/lib/contract";
import { useRole } from "@/hooks/useRole";
import Link from "next/link";
import { PlusCircle, Package } from "lucide-react";
import { shortAddr } from "@/lib/utils";

export default function ManufacturerDashboard() {
  const { address, isConnected } = useAccount();
  const { role } = useRole();
  const { data: total } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: supplyChainAbi,
    functionName: "totalProducts",
  });

  return (
    <AppShell title="Manufacturer Dashboard">
      {!isConnected ? (
        <div className="card p-8 text-center">
          <p className="text-slate-300">Connect your wallet to continue.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-xs text-slate-500">Connected as</p>
            <p className="font-mono text-sm">{shortAddr(address)}</p>
            <p className="mt-2 text-xs text-slate-500">Role</p>
            <p className="font-medium capitalize">{role}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-slate-500">Total products on-chain</p>
            <p className="text-2xl font-semibold">{total?.toString() ?? "—"}</p>
          </div>
          <Link href="/products/new" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
            <PlusCircle className="h-6 w-6 text-brand-600" />
            <div>
              <p className="font-medium">Register product</p>
              <p className="text-xs text-slate-500">Mint a new supply chain entry.</p>
            </div>
          </Link>
          <Link href="/scan" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3 md:col-span-3">
            <Package className="h-6 w-6 text-brand-600" />
            <div>
              <p className="font-medium">Look up a product</p>
              <p className="text-xs text-slate-500">Scan a QR or paste a product ID to view its history.</p>
            </div>
          </Link>
        </div>
      )}
    </AppShell>
  );
}
