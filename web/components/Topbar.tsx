import { WalletButton } from "./WalletButton";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
      <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
      <WalletButton />
    </header>
  );
}
