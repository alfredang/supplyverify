import Link from "next/link";
import { ShieldCheck, QrCode, Link2, Truck, Package, Users } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";

const FEATURES = [
  { icon: Package, title: "On-chain registry", desc: "Manufacturers register every product with a unique, tamper-proof ID." },
  { icon: Truck, title: "End-to-end tracking", desc: "Distributors and retailers append checkpoints as goods move." },
  { icon: ShieldCheck, title: "Authenticity proof", desc: "Customers verify provenance instantly — no login required." },
  { icon: QrCode, title: "QR-first UX", desc: "Every product gets a unique QR linking to a public verify page." },
  { icon: Users, title: "Role-based access", desc: "OpenZeppelin AccessControl gates writes to authorised wallets." },
  { icon: Link2, title: "Etherscan links", desc: "Every action surfaces the underlying transaction hash." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-brand-500" />
            <span className="font-semibold">Supply Verify</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/scan" className="text-sm text-slate-300 hover:text-white">Scan</Link>
            <Link href="/manufacturer" className="text-sm text-slate-300 hover:text-white">Dashboard</Link>
            <WalletButton />
          </div>
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/30 text-xs font-medium mb-6">
          <ShieldCheck className="h-3.5 w-3.5" /> Blockchain-verified provenance
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
          Trustless product authenticity, <br /> from factory to customer.
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
          Register, transfer, and verify physical goods on Ethereum. Anyone with a phone can scan a
          QR code to confirm a product is real — and trace where it has been.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/manufacturer"
            className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-brand-600/30"
          >
            Open dashboard
          </Link>
          <Link
            href="/scan"
            className="border border-slate-700 hover:bg-slate-800 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200"
          >
            Scan a QR
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:border-slate-700 transition-colors">
              <Icon className="h-5 w-5 text-brand-500" />
              <h3 className="mt-3 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-500 flex justify-between">
          <span>Supply Verify · demo</span>
          <span>Sepolia testnet</span>
        </div>
      </footer>
    </div>
  );
}
