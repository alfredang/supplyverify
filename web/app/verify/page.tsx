"use client";

import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { productIdFrom } from "@/lib/contract";
import { ShieldCheck } from "lucide-react";

export default function VerifyIndex() {
  const router = useRouter();
  const [serial, setSerial] = useState("");
  const [batch, setBatch] = useState("");
  const [rawId, setRawId] = useState("");

  return (
    <AppShell title="Verify Product">
      <div className="grid md:grid-cols-2 gap-4">
        <form
          className="card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!serial || !batch) return;
            router.push(`/verify/${productIdFrom(serial, batch)}`);
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold">Look up by serial + batch</h2>
          </div>
          <input
            placeholder="Serial number"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="w-full mb-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
          />
          <input
            placeholder="Batch number"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full mb-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
          />
          <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">Verify</button>
        </form>

        <form
          className="card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^0x[a-fA-F0-9]{64}$/.test(rawId)) return;
            router.push(`/verify/${rawId}`);
          }}
        >
          <h2 className="font-semibold mb-3">Look up by product ID</h2>
          <input
            placeholder="0x… (32-byte product ID)"
            value={rawId}
            onChange={(e) => setRawId(e.target.value)}
            className="w-full mb-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm font-mono"
          />
          <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">Verify</button>
        </form>
      </div>
    </AppShell>
  );
}
