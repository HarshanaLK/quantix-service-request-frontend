"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "./auth-provider";
import { initials, ROLE_LABELS } from "@/lib/config";
import { Loading } from "./ui";

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3"
      aria-label="Quantix dashboard"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-extrabold text-white shadow-lg shadow-indigo-900/30">
        Q
      </div>
      <div>
        <div className="text-lg font-extrabold tracking-tight text-white">
          quantix<span className="text-indigo-400">.</span>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-400">
          Service desk
        </div>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Checking your session..." />
      </div>
    );
  if (!user) {
    return (
      <div className="min-h-screen">
        <Loading label="Redirecting to login..." />
      </div>
    );
  }
  const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/requests", label: "All requests", icon: ClipboardList },
    ...(user.role === "employee"
      ? [{ href: "/requests/new", label: "New request", icon: Plus }]
      : []),
  ];
  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-7 pb-8 pt-8">
        <Brand />
      </div>
      <div className="px-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
          Workspace
        </p>
        <nav className="space-y-1.5" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : href === "/requests"
                  ? pathname === href || /^\/requests\/\d+/.test(pathname)
                  : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon
                  className={clsx(
                    "h-[18px] w-[18px]",
                    active
                      ? "text-indigo-400"
                      : "text-slate-500 group-hover:text-indigo-300",
                  )}
                />
                {label}
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-4 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15">
            <ShieldCheck className="h-5 w-5 text-indigo-300" />
          </div>
          <p className="text-sm font-semibold text-white">
            Built for your workflow
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Secure, role-based service request management.
          </p>
          <Link
            href="/requests"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-indigo-200"
          >
            View requests <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user.name}</p>
            <p className="text-[11px] text-slate-400">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <button
            title="Sign out"
            aria-label="Sign out"
            disabled={logoutBusy}
            onClick={async () => {
              setLogoutBusy(true);
              try {
                await logout();
              } finally {
                setLogoutBusy(false);
              }
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#111D33] lg:block">
        {sidebar}
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#111D33] transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          aria-label="Close menu"
          className="absolute right-3 top-7 text-slate-400"
          onClick={() => setMobileOpen(false)}
        >
          <X />
        </button>
        {sidebar}
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden text-sm font-medium text-slate-500 sm:block">
              Workspace <span className="mx-2 text-slate-300">/</span>{" "}
              <span className="font-semibold text-slate-800">
                {pathname.startsWith("/dashboard")
                  ? "Dashboard"
                  : pathname.endsWith("/new")
                    ? "Create request"
                    : pathname.endsWith("/edit")
                      ? "Edit request"
                      : pathname.match(/^\/requests\/\d+$/)
                        ? "Request details"
                        : "Requests"}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-800 sm:hidden">
              Quantix Service Desk
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
              {ROLE_LABELS[user.role]} access
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials(user.name)}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1460px] px-5 pb-14 pt-8 md:px-9 md:pt-10">
          {children}
        </main>
        <footer className="mx-auto flex max-w-[1460px] flex-wrap justify-between gap-2 px-5 pb-7 text-xs text-slate-400 md:px-9">
          <span>© {new Date().getFullYear()} Quantix Service Desk</span>
          <span>Powered by Next.js + Laravel</span>
        </footer>
      </div>
    </div>
  );
}
