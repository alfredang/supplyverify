"use client";

import { AppShell } from "@/components/AppShell";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";

export default function ScanPage() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: any;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled || !ref.current) return;
        scanner = new Html5Qrcode("qr-reader");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (text: string) => {
            scanner.stop().then(() => {
              try {
                const url = new URL(text);
                router.push(url.pathname + url.search);
              } catch {
                if (text.startsWith("0x") && text.length === 66) {
                  router.push(`/verify/${text}`);
                } else {
                  setError("Unrecognised QR content: " + text);
                }
              }
            });
          },
          () => {}
        );
      } catch (e: any) {
        setError(e?.message || "Camera unavailable");
      }
    })();
    return () => {
      cancelled = true;
      scanner?.stop?.().catch(() => {});
    };
  }, [router]);

  return (
    <AppShell title="Scan QR">
      <div className="card p-6 max-w-xl">
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold">Point camera at product QR</h2>
        </div>
        <div id="qr-reader" ref={ref} className="rounded-lg overflow-hidden bg-black" />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </AppShell>
  );
}
