"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  MessageSquare,
  Bell,
  FolderOpen,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  Table2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsRight,
  MessageSquarePlus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/inbox", icon: Inbox, label: "Inbox" },
  { href: "/app/notes", icon: BookOpen, label: "Notes" },
  { href: "/app/lists", icon: Table2, label: "Lists" },
  { href: "/app/self-chat", icon: MessageSquare, label: "Self Chat" },
  { href: "/app/reminders", icon: Bell, label: "Reminders" },
  { href: "/app/collections", icon: FolderOpen, label: "Collections" },
  { href: "/app/feedback", icon: MessageSquarePlus, label: "Feedback" },
];

type SidebarMode = "collapsed" | "expanded" | "auto";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sidebarMode") as SidebarMode) ?? "auto";
    }
    return "auto";
  });

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "Z");

  const isAuto = sidebarMode === "auto";
  const isExpanded = sidebarMode === "expanded";

  const sidebarWidth =
    sidebarMode === "expanded"
      ? "lg:w-60"
      : sidebarMode === "collapsed"
        ? "lg:w-[72px]"
        : "lg:w-[72px] lg:hover:w-60";

  const toggleSidebarMode = () => {
    setSidebarMode((prev) => {
      const next =
        prev === "collapsed"
          ? "expanded"
          : prev === "expanded"
            ? "auto"
            : "collapsed";
      localStorage.setItem("sidebarMode", next);
      return next;
    });
  };

  const labelClass = `
    whitespace-nowrap transition-all duration-200
    lg:overflow-hidden
    ${
      isExpanded
        ? "lg:max-w-40 lg:opacity-100"
        : isAuto
          ? "lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-40 lg:group-hover:opacity-100"
          : "lg:max-w-0 lg:opacity-0"
    }
  `;

  const alignClass =
    isExpanded || isAuto ? "lg:justify-start" : "lg:justify-center";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          group fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-border bg-card
          transition-all duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${sidebarWidth}
          lg:static lg:z-auto lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link
            href="/app/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
              Z
            </div>

            <span className={`text-lg font-bold text-blue-600 ${labelClass}`}>
              Zikron
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleSidebarMode}
            title={`Sidebar mode: ${sidebarMode}`}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
          >
            {sidebarMode === "collapsed" && <PanelLeftOpen size={16} />}
            {sidebarMode === "expanded" && <PanelLeftClose size={16} />}
            {sidebarMode === "auto" && <ChevronsRight size={16} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            const collapsedActive = sidebarMode === "collapsed" && active;

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                title={label}
                className={`
  flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
  ${alignClass}

  ${
    collapsedActive
      ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
      : active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }
`}
              >
                <Icon
                  size={18}
                  className={`
    shrink-0 transition-all duration-200

    ${
      collapsedActive
        ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
        : active
          ? "text-primary"
          : ""
    }
  `}
                />

                <span className={labelClass}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="space-y-1 border-t border-border px-3 py-3">
          {role === "admin" && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              title="Admin Panel"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors
                hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40
                ${alignClass}
              `}
            >
              <ShieldCheck size={18} className="shrink-0" />
              <span className={labelClass}>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/app/settings"
            onClick={onClose}
            title="Settings"
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${alignClass}
              ${
                pathname === "/app/settings"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
          >
            <Settings size={18} className="shrink-0" />
            <span className={labelClass}>Settings</span>
          </Link>

          <div
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2
              ${alignClass}
            `}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {initials}
            </div>

            <div className={`min-w-0 flex-1 ${labelClass}`}>
              <p className="truncate text-xs font-medium text-foreground">
                {user?.user_metadata?.full_name ?? "My Account"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={signOut}
              className={`
                shrink-0 text-muted-foreground transition-colors hover:text-red-500
                ${
                  isExpanded
                    ? "lg:block"
                    : isAuto
                      ? "lg:hidden lg:group-hover:block"
                      : "lg:hidden"
                }
              `}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
