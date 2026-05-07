"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShieldCheck,
  QrCode,
  Truck,
  Users,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Admin", icon: Users },
  { href: "/manufacturer", label: "Manufacturer", icon: LayoutDashboard },
  { href: "/products/new", label: "Register", icon: PlusCircle },
  { href: "/scan", label: "Scan QR", icon: QrCode },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-60 flex-col bg-slate-900 text-slate-100 min-h-screen p-4 border-r border-slate-800">
      <Link href="/" className="flex items-center gap-2 mb-8 px-2">
        <Link2 className="h-6 w-6 text-brand-500" />
        <span className="font-semibold">Supply Verify</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-xs text-slate-500 px-2">
        <div className="flex items-center gap-1">
          <Truck className="h-3 w-3" /> v0.1
        </div>
      </div>
    </aside>
  );
}
