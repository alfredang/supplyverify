import { publicClient } from "@/lib/publicClient";
import { CONTRACT_ADDRESS, supplyChainAbi, explorerAddrUrl } from "@/lib/contract";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline, type CheckpointDTO } from "@/components/Timeline";
import { ShieldCheck, ShieldAlert, Link2 } from "lucide-react";
import { formatDate, shortAddr } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function fetchProduct(id: `0x${string}`) {
  try {
    const [verifyRes, history] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: supplyChainAbi,
        functionName: "verify",
        args: [id],
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: supplyChainAbi,
        functionName: "getHistory",
        args: [id],
      }),
    ]);
    const [product, exists] = verifyRes as any;
    return { product, exists, history: history as CheckpointDTO[] };
  } catch {
    return { product: null, exists: false, history: [] as CheckpointDTO[] };
  }
}

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const id = params.id as `0x${string}`;
  const { product, exists, history } = await fetchProduct(id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Link2 className="h-5 w-5 text-brand-500" /> Supply Verify
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {!exists ? (
          <div className="card p-8 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto text-red-500" />
            <h1 className="mt-3 text-xl font-semibold">Not authentic</h1>
            <p className="text-slate-300 mt-1 text-sm">
              No product matches this ID on-chain. Treat it as suspicious.
            </p>
            <p className="mt-3 font-mono text-xs break-all text-slate-500">{id}</p>
          </div>
        ) : (
          <>
            <div className={`card p-6 ${product.flagged ? "border-red-300" : ""}`}>
              <div className="flex items-center gap-3">
                {product.flagged ? (
                  <ShieldAlert className="h-8 w-8 text-red-500" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                )}
                <div>
                  <h1 className="text-xl font-semibold">
                    {product.flagged ? "Flagged" : "Authentic product"}
                  </h1>
                  <p className="text-sm text-slate-300">
                    Verified on Ethereum at {formatDate(product.producedAt)}
                  </p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={Number(product.status)} />
                </div>
              </div>

              <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
                <Info label="Product ID" value={<span className="font-mono text-xs break-all">{id}</span>} />
                <Info
                  label="Manufacturer"
                  value={
                    <a
                      className="text-brand-600 hover:underline"
                      href={explorerAddrUrl(product.manufacturer)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddr(product.manufacturer)}
                    </a>
                  }
                />
                <Info
                  label="Current owner"
                  value={
                    <a
                      className="text-brand-600 hover:underline"
                      href={explorerAddrUrl(product.currentOwner)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddr(product.currentOwner)}
                    </a>
                  }
                />
                <Info
                  label="Expires"
                  value={Number(product.expiresAt) ? formatDate(product.expiresAt) : "—"}
                />
                <Info label="Metadata CID" value={<span className="font-mono text-xs break-all">{product.metadataCID}</span>} />
              </dl>
            </div>

            <section className="mt-8">
              <h2 className="font-semibold mb-3">Movement history</h2>
              <Timeline checkpoints={history} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
