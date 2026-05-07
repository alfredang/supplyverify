"use client";

import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, productIdFrom, supplyChainAbi } from "@/lib/contract";
import { uploadFile, uploadJson } from "@/lib/ipfs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QRCodeView } from "@/components/QRCodeView";

export default function NewProductPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { writeContractAsync, isPending } = useWriteContract();

  const [form, setForm] = useState({
    name: "",
    serial: "",
    batch: "",
    category: "",
    origin: "",
    manufacturerName: "",
    expiresAt: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [registered, setRegistered] = useState<{ id: string; verifyUrl: string } | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.serial || !form.batch) {
      toast.error("Name, serial, and batch are required");
      return;
    }
    try {
      toast.message("Uploading metadata to IPFS…");
      const imageCid = image ? await uploadFile(image) : null;
      const metadataCid = await uploadJson({
        ...form,
        imageCid,
        registeredAt: new Date().toISOString(),
      });

      const id = productIdFrom(form.serial, form.batch);
      const expiresAt = form.expiresAt
        ? BigInt(Math.floor(new Date(form.expiresAt).getTime() / 1000))
        : 0n;

      toast.message("Confirm transaction in MetaMask…");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: supplyChainAbi,
        functionName: "registerProduct",
        args: [id, expiresAt, metadataCid],
      });
      toast.success(`Registered (tx ${hash.slice(0, 10)}…)`);

      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      setRegistered({ id, verifyUrl: `${site}/verify/${id}` });
    } catch (e: any) {
      toast.error(e?.shortMessage || e?.message || "Registration failed");
    }
  }

  return (
    <AppShell title="Register Product">
      {!isConnected ? (
        <div className="card p-8 text-center text-slate-300">Connect a manufacturer wallet to continue.</div>
      ) : registered ? (
        <div className="card p-6 max-w-xl">
          <h2 className="font-semibold text-lg">Product registered</h2>
          <p className="text-sm text-slate-300 mt-1">
            Share this QR code on packaging — anyone can verify authenticity.
          </p>
          <div className="mt-5 flex flex-col items-center">
            <QRCodeView value={registered.verifyUrl} size={220} />
          </div>
          <p className="mt-4 text-xs font-mono break-all text-slate-500">{registered.id}</p>
          <div className="mt-5 flex gap-2">
            <button
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => router.push(`/products/${registered.id}`)}
            >
              Open detail
            </button>
            <button
              className="border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-4 py-2 rounded-lg text-sm"
              onClick={() => setRegistered(null)}
            >
              Register another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 max-w-2xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Product name" value={form.name} onChange={(v) => set("name", v)} required />
            <Field label="Manufacturer name" value={form.manufacturerName} onChange={(v) => set("manufacturerName", v)} />
            <Field label="Serial number" value={form.serial} onChange={(v) => set("serial", v)} required />
            <Field label="Batch number" value={form.batch} onChange={(v) => set("batch", v)} required />
            <Field label="Category" value={form.category} onChange={(v) => set("category", v)} />
            <Field label="Origin country" value={form.origin} onChange={(v) => set("origin", v)} />
            <Field label="Expiry date" type="date" value={form.expiresAt} onChange={(v) => set("expiresAt", v)} />
            <div>
              <label className="text-xs text-slate-500">Product image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            {isPending ? "Registering…" : "Register on-chain"}
          </button>
        </form>
      )}
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
      />
    </div>
  );
}
