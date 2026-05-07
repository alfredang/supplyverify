import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-6 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
