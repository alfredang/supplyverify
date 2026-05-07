"use client";

import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, STATUS_LABELS, supplyChainAbi } from "@/lib/contract";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TransferPage({ params }: { params: { id: string } }) {
  const id = params.id as `0x${string}`;
  const router = useRouter();
  const { writeContractAsync, isPending } = useWriteContract();
  const [to, setTo] = useState("");
  const [status, setStatus] = useState(3);
  const [location, setLocation] = useState("");

  async function transfer() {
    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) return toast.error("Invalid address");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: supplyChainAbi,
        functionName: "transferOwnership",
        args: [id, to as `0x${string}`, status, location],
      });
      toast.success(`Transferred (tx ${hash.slice(0, 10)}…)`);
      router.push(`/products/${id}`);
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Failed");
    }
  }

  return (
    <AppShell title="Transfer Ownership">
      <div className="card p-6 max-w-xl space-y-4">
        <p className="text-xs text-slate-500 break-all">Product: {id}</p>
        <div>
          <label className="text-xs text-slate-500">Recipient wallet</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x…"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">New status</label>
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
          >
            {STATUS_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Location / checkpoint</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={transfer}
          disabled={isPending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
        >
          {isPending ? "Submitting…" : "Transfer ownership"}
        </button>
      </div>
    </AppShell>
  );
}
