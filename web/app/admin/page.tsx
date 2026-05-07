"use client";

import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, ROLES, supplyChainAbi } from "@/lib/contract";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const ROLE_OPTIONS = [
  { label: "Manufacturer", value: ROLES.MANUFACTURER },
  { label: "Distributor", value: ROLES.DISTRIBUTOR },
  { label: "Retailer", value: ROLES.RETAILER },
];

export default function AdminPage() {
  const { isConnected } = useAccount();
  const { role } = useRole();
  const [wallet, setWallet] = useState("");
  const [selectedRole, setSelectedRole] = useState<`0x${string}`>(ROLES.MANUFACTURER);
  const { writeContractAsync, isPending } = useWriteContract();

  async function grant() {
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      toast.error("Invalid wallet address");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: supplyChainAbi,
        functionName: "grantRole",
        args: [selectedRole, wallet as `0x${string}`],
      });
      toast.success(`Role granted (tx ${hash.slice(0, 10)}…)`);
      setWallet("");
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Transaction failed");
    }
  }

  return (
    <AppShell title="Admin Dashboard">
      {!isConnected || role !== "admin" ? (
        <div className="card p-8 text-center text-slate-300">
          Admin role required.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold">Grant supply chain role</h2>
            </div>
            <label className="text-xs text-slate-500">Wallet address</label>
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x…"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm font-mono"
            />
            <label className="mt-3 block text-xs text-slate-500">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as `0x${string}`)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={grant}
              disabled={isPending}
              className="mt-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {isPending ? "Granting…" : "Grant role"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
