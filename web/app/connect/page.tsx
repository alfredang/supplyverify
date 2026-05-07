"use client";

import { WalletButton } from "@/components/WalletButton";
import { useAccount } from "wagmi";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Wallet } from "lucide-react";

export default function ConnectPage() {
  const { isConnected } = useAccount();
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) return;
    const target =
      role === "admin" ? "/admin" :
      role === "manufacturer" ? "/manufacturer" :
      role === "distributor" || role === "retailer" ? "/manufacturer" :
      "/";
    router.push(target);
  }, [isConnected, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-8 max-w-md w-full text-center">
        <Wallet className="h-10 w-10 mx-auto text-brand-600" />
        <h1 className="mt-3 text-xl font-semibold">Connect wallet</h1>
        <p className="mt-1 text-sm text-slate-300">
          MetaMask is required. We&apos;ll detect your role automatically.
        </p>
        <div className="mt-6 flex justify-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
