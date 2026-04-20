"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTimeTrackerStore } from "@/lib/client/store/time-tracker-store";

const links = [
  { href: "/", label: "Tracker" },
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeEntry = useTimeTrackerStore((state) => state.activeEntry);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now());
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeDuration = activeEntry
    ? (() => {
        const diffMs = Math.max(0, nowMs - new Date(activeEntry.startedAt).getTime());
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0",
        )}:${String(seconds).padStart(2, "0")}`;
      })()
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xl font-semibold text-zinc-900">Time Tracker</div>
          {activeEntry && activeDuration ? (
            <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
              Running: {activeEntry.taskName} ({activeDuration})
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-500">
              No active timer
            </div>
          )}
        </div>
        <nav className="flex gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
