"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  NotebookTabs,
  Users,
  BookOpen,
  Inbox,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Bell,
  LinkIcon,
  FolderOpen,
  Contact,
  Table2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsRight,
  MessageSquarePlus,
  GitCommit,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const mySpaceItems = [
  {
    href: "/admin/my-dashboard",
    icon: LayoutDashboard,
    label: "My Dashboard",
    placeholder: false,
  },
  {
    href: "/admin/my-notes",
    icon: BookOpen,
    label: "My Notes",
    placeholder: false,
  },
  {
    href: "/admin/my-lists",
    icon: Table2,
    label: "My Lists",
    placeholder: false,
  },
  {
    href: "/admin/my-inbox",
    icon: Inbox,
    label: "My Inbox",
    placeholder: false,
  },
  {
    href: "/admin/my-chat",
    icon: MessageSquare,
    label: "My Chat",
    placeholder: false,
  },
  {
    href: "/admin/my-reminders",
    icon: Bell,
    label: "My Reminders",
    placeholder: false,
  },
  {
    href: "/admin/my-collections",
    icon: FolderOpen,
    label: "My Collections",
    placeholder: false,
  },
];

const systemItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    placeholder: false,
  },
  { href: "/admin/users", icon: Users, label: "Users", placeholder: false },
  { href: "/admin/notes", icon: BookOpen, label: "Notes", placeholder: false },
  { href: "/admin/inbox", icon: Inbox, label: "Inbox", placeholder: false },
  { href: "/admin/lists", icon: Table2, label: "Lists", placeholder: false },
  {
    href: "/admin/self-chat",
    icon: MessageSquare,
    label: "Self Chat",
    placeholder: false,
  },
  {
    href: "/admin/reminders",
    icon: Bell,
    label: "Reminders",
    placeholder: false,
  },
  {
    href: "/admin/feedback",
    icon: MessageSquarePlus,
    label: "Feedback",
    placeholder: false,
  },
  {
    href: "/admin/changelog",
    icon: GitCommit,
    label: "Changelog",
    placeholder: false,
  },
  {
    href: "/admin/contacts",
    icon: Contact,
    label: "Contacts",
    placeholder: false,
  },
  {
    href: "/admin/contact-messages",
    icon: Mail,
    label: "Contact Messages",
    placeholder: false,
  },
  {
    href: "/admin/collections",
    icon: FolderOpen,
    label: "Collections",
    placeholder: false,
  },
  {
    href: "/admin/shared",
    icon: LinkIcon,
    label: "Shared Links",
    placeholder: true,
  },
];

type SidebarMode = "collapsed" | "expanded" | "auto";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("auto");

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "A");

  const isAuto = sidebarMode === "auto";
  const isExpanded = sidebarMode === "expanded";
  const isCollapsed = sidebarMode === "collapsed";

  const sidebarWidth =
    sidebarMode === "expanded"
      ? "lg:w-60"
      : sidebarMode === "collapsed"
        ? "lg:w-[72px]"
        : "lg:w-[72px] lg:hover:w-60";

  const labelClass = `
    whitespace-nowrap transition-all duration-200 lg:overflow-hidden
    ${
      isExpanded
        ? "lg:max-w-40 lg:opacity-100"
        : isAuto
          ? "lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-40 lg:group-hover:opacity-100"
          : "lg:max-w-0 lg:opacity-0"
    }
  `;

  const alignClass = isCollapsed ? "lg:justify-center" : "lg:justify-start";

  const toggleSidebarMode = () => {
    setSidebarMode((prev) =>
      prev === "collapsed"
        ? "expanded"
        : prev === "expanded"
          ? "auto"
          : "collapsed",
    );
  };

  function navLink(
    href: string,
    icon: React.ElementType,
    label: string,
    placeholder: boolean,
  ) {
    const Icon = icon;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const collapsedActive = isCollapsed && active;

    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        title={label}
        className={`
          relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
          ${alignClass}
          ${
            collapsedActive
              ? "text-primary"
              : active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground  hover:bg-primary/10 text-primary/10 "
          }
          ${placeholder ? "opacity-50" : ""}
        `}
      >
        {/* {collapsedActive && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
        )} */}

        <Icon
          size={18}
          className={`
            shrink-0 transition-all duration-200
            ${
              collapsedActive
                ? "scale-110 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]"
                : active
                  ? "text-primary"
                  : "text-muted-foreground"
            }
          `}
        />

        <span className={`flex-1 ${labelClass}`}>{label}</span>

        {placeholder && !isCollapsed && (
          <span
            className={`
              rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground
              ${labelClass}
            `}
          >
            Soon
          </span>
        )}
      </Link>
    );
  }

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
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div className="h-7 w-9 shrink-0 overflow-hidden">
              <Image
                src="/icon.svg"
                alt="Zikron"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <span
              className={`text-lg font-bold text-[#4076f5] dark:text-primary ${labelClass}`}
            >
              Zikron
            </span>
          </div>

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

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          <div>
            <p
              className={`mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 ${labelClass}`}
            >
              My Space
            </p>

            <div className="space-y-0.5">
              {mySpaceItems.map(({ href, icon, label, placeholder }) =>
                navLink(href, icon, label, placeholder),
              )}
            </div>
          </div>

          <div>
            <p
              className={`mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 ${labelClass}`}
            >
              System
            </p>

            <div className="space-y-0.5">
              {systemItems.map(({ href, icon, label, placeholder }) =>
                navLink(href, icon, label, placeholder),
              )}
            </div>
          </div>
        </nav>

        <div className="space-y-1 border-t border-border px-3 py-3">
          <Link
            href="/app/dashboard"
            onClick={onClose}
            title="Admin Panel"
            className={`
                          flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors
                          hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40
                          ${alignClass}
                        `}
          >
            <NotebookTabs size={18} className="shrink-0" />
            <span className={labelClass}>App Panel</span>
          </Link>
          {navLink("/admin/settings", Settings, "Settings", false)}

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${alignClass}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>

            <div className={`min-w-0 flex-1 ${labelClass}`}>
              <p className="truncate text-xs font-medium text-foreground">
                {user?.user_metadata?.full_name ?? "Admin"}
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
