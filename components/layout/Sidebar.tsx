"use client";

import { useState, useEffect, useRef } from "react";
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
  Users,
  Link2,
  Hash,
  Network,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/queries/use-profile";
import { ProfileAvatar } from "@/components/features/profile/ProfileAvatar";

const navItems = [
  { href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/inbox", icon: Inbox, label: "Inbox" },
  { href: "/app/notes", icon: BookOpen, label: "Notes" },
  { href: "/app/lists", icon: Table2, label: "Lists" },
  { href: "/app/self-chat", icon: MessageSquare, label: "Self Chat" },
  { href: "/app/reminders", icon: Bell, label: "Reminders" },
  { href: "/app/collections", icon: FolderOpen, label: "Collections" },
  { href: "/app/contacts", icon: Users, label: "Contacts" },
  { href: "/app/tags", icon: Hash, label: "Tags" },
  { href: "/app/graph", icon: Network, label: "Graph" },
  { href: "/app/shared", icon: Link2, label: "Shared" },
];

type SidebarMode = "collapsed" | "expanded" | "auto";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const { data: profile } = useProfile();
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    asideRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sidebarMode") as SidebarMode) ?? "auto";
    }
    return "auto";
  });

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? null;

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
        ref={asideRef}
        tabIndex={-1}
        className={`
          group fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-border bg-card
          transition-all duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${sidebarWidth}
          lg:static lg:z-auto lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link
            href="/app/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 overflow-hidden"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden">
              <Image
                src="/icon.svg"
                alt="Zikron"
                width={32}
                height={32}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <span className={`text-lg font-bold text-primary ${labelClass}`}>
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
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
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
        <div className="space-y-0.5 border-t border-border px-3 py-3">
          {role === "admin" && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              title="Admin Panel"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                text-muted-foreground hover:bg-muted hover:text-foreground
                ${alignClass}
              `}
            >
              <ShieldCheck size={18} className="shrink-0" />
              <span className={labelClass}>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/app/feedback"
            onClick={onClose}
            title="Feedback"
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${alignClass}
              ${
                pathname === "/app/feedback"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
          >
            <MessageSquarePlus size={18} className="shrink-0" />
            <span className={labelClass}>Feedback</span>
          </Link>

          <Link
            href="/app/settings"
            onClick={onClose}
            title="Settings"
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${alignClass}
              ${
                pathname === "/app/settings"
                  ? "bg-primary/10 text-primary"
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
            <ProfileAvatar
              name={displayName}
              email={user?.email}
              avatarUrl={profile?.avatar_url}
              size="sm"
            />

            <div className={`min-w-0 flex-1 ${labelClass}`}>
              <p className="truncate text-xs font-medium text-foreground">
                {displayName ?? "My Account"}
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
