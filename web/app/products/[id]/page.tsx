"use client";

import { AppShell } from "@/components/AppShell";
import { useReadContracts, useAccount, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, STATUS_LABELS, supplyChainAbi } from "@/lib/contract";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline, type CheckpointDTO } from "@/components/Timeline";
import { QRCodeView } from "@/components/QRCodeView";
import { shortAddr, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = params.id as `0x${string}`;
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data, refetch } = useReadContracts({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: supplyChainAbi, functionName: "verify", args: [id] },
      { address: CONTRACT_ADDRESS, abi: supplyChainAbi, functionName: "getHistory", args: [id] },
    ],
  });

  const product = data?.[0]?.result?.[0] as any;
  const exists = data?.[0]?.result?.[1] as boolean | undefined;
  const history = (data?.[1]?.result as CheckpointDTO[] | undefined) ?? [];

  const isOwner = address && product && address.toLowerCase() === product.currentOwner.toLowerCase();

  const [newStatus, setNewStatus] = useState(0);
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  async function update() {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: supplyChainAbi,
        functionName: "updateStatus",
        args: [id, newStatus, location, note],
      });
      toast.success(`Updated (tx ${hash.slice(0, 10)}…)`);
      setLocation(""); setNote("");
      refetch();
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Failed");
    }
  }

  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${id}` : "";

  return (
    <AppShell title="Product Detail">
      {!exists ? (
        <div className="card p-8 text-center text-slate-300">Product not found on-chain.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 card p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-slate-500">Product ID</p>
                <p className="font-mono text-xs break-all">{id}</p>
              </div>
              <StatusBadge status={Number(product.status)} />
            </div>
            <dl className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
              <Info label="Current owner" value={shortAddr(product.currentOwner)} />
              <Info label="Manufacturer" value={shortAddr(product.manufacturer)} />
              <Info label="Produced" value={formatDate(product.producedAt)} />
              <Info label="Expires" value={Number(product.expiresAt) ? formatDate(product.expiresAt) : "—"} />
              <Info label="Metadata CID" value={product.metadataCID} />
              <Info label="Flagged" value={product.flagged ? "YES" : "No"} />
            </dl>

            {isOwner && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="font-semibold mb-3">Update status</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(Number(e.target.value))}
                    className="rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
                  >
                    {STATUS_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
                  </select>
                  <input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={update}
                    disabled={isPending}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {isPending ? "Submitting…" : "Submit"}
                  </button>
                  <Link
                    href={`/products/${id}/transfer`}
                    className="border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-4 py-2 rounded-lg text-sm"
                  >
                    Transfer ownership →
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-semibold mb-3">Movement history</h3>
              <Timeline checkpoints={history} />
            </div>
          </div>

          <aside className="card p-6 self-start">
            <h3 className="font-semibold">Public QR</h3>
            <p className="text-xs text-slate-500 mt-1">Scan to verify.</p>
            <div className="mt-4 flex justify-center">
              {verifyUrl && <QRCodeView value={verifyUrl} size={180} />}
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-mono text-xs break-all">{value}</dd>
    </div>
  );
}
