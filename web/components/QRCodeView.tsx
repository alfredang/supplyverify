"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QRCodeView({ value, size = 200 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1 }).catch(() => {});
    }
  }, [value, size]);
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <canvas ref={ref} className="rounded-lg border border-slate-200 bg-white p-2" />
      <a className="text-xs text-brand-600 hover:underline" href={value} target="_blank" rel="noreferrer">
        Open verify URL
      </a>
    </div>
  );
}
