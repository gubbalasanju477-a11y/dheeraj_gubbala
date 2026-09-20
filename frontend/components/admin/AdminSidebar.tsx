"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Tags,
  PrinterIcon,
  Users,
  BarChart3,
  Settings,
  Printer,
  Menu,
  X,
  Database,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { clearAuth, getStoredUser } from "@/lib/adminAuth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Print Jobs", icon: ListChecks },
  { href: "/admin/pricing", label: "Pricing", icon: Tags },
  { href: "/admin/printers", label: "Printers", icon: PrinterIcon },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/database", label: "Database", icon: Database },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-bg hover:text-ink"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();

  function handleLogout() {
    clearAuth();
    router.push("/admin-login");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Printer className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-base font-semibold text-ink">PrintEase Admin</span>
        </Link>
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-bg"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface py-4 animate-fade-up">
            <div className="mb-2 flex items-center justify-between px-4">
              <span className="font-display text-base font-semibold text-ink">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-bg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface py-5 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Printer className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-base font-semibold text-ink">PrintEase</span>
          <span className="rounded-md bg-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-faint">
            Admin
          </span>
        </Link>
        <NavLinks pathname={pathname} />
        <div className="mx-3 mt-auto space-y-2">
          <div className="rounded-xl bg-bg p-3.5">
            <p className="truncate text-xs font-medium text-ink">{user?.name ?? "Admin"}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-bg hover:text-ink"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
