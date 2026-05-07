import { explorerAddrUrl } from "@/lib/contract";
import { formatDate, shortAddr } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { MapPin } from "lucide-react";

export type CheckpointDTO = {
  actor: string;
  timestamp: bigint | number;
  status: number;
  location: string;
  note: string;
};

export function Timeline({ checkpoints }: { checkpoints: CheckpointDTO[] }) {
  if (!checkpoints.length) {
    return <p className="text-sm text-slate-500">No checkpoints yet.</p>;
  }
  return (
    <ol className="relative border-l border-slate-800 ml-3">
      {checkpoints.map((c, i) => (
        <li key={i} className="ml-6 mb-6">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-slate-950" />
          <div className="card p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <StatusBadge status={c.status} />
              <time className="text-xs text-slate-500">{formatDate(c.timestamp)}</time>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="font-medium">{c.location || "—"}</span>
            </div>
            {c.note && <p className="mt-1 text-sm text-slate-300">{c.note}</p>}
            <div className="mt-2 text-xs text-slate-500">
              Actor:{" "}
              <a
                href={explorerAddrUrl(c.actor)}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline"
              >
                {shortAddr(c.actor)}
              </a>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
