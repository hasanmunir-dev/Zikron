"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import {
  Lock,
  Globe,
  AlertTriangle,
  Eye,
  EyeOff,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { MarkdownViewer } from "@/components/editor/markdown-viewer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShareStatus =
  | "loading"
  | "ok"
  | "password_required"
  | "denied"
  | "expired"
  | "revoked"
  | "not_found"
  | "password_failed";

interface RecipientShareResponse {
  status: ShareStatus;
  share_type?: string;
  item_type?: string;
  allow_download?: boolean;
  content?: Record<string, unknown>;
  suspicious?: boolean;
}

// ─── Content renderers (same as public share page) ────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <MarkdownViewer content={content} />
    </div>
  );
}

function ContentRenderer({
  itemType,
  content,
}: {
  itemType: string;
  content: Record<string, unknown>;
}) {
  const url = typeof content.url === "string" ? content.url : "";
  const body = typeof content.content === "string" ? content.content : "";
  const desc =
    typeof content.description === "string" ? content.description : "";

  switch (itemType) {
    case "note":
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {content.title as string}
          </h1>
          {content.content ? (
            <MarkdownContent content={content.content as string} />
          ) : (
            <p className="text-muted-foreground italic">No content.</p>
          )}
          {Array.isArray(content.tags) &&
            (content.tags as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                {(content.tags as string[]).map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
        </div>
      );
    case "inbox":
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {content.title as string}
          </h1>
          {url && (
            <a
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline break-all"
            >
              {content.url as string}
            </a>
          )}
          {body && <MarkdownContent content={body as string} />}
        </div>
      );
    case "list": {
      const columns =
        (content.columns as Array<{ id: string; name: string }>) ?? [];
      const rows = (content.rows as Array<{ id: string }>) ?? [];
      const cells =
        (content.cells as Array<{
          row_id: string;
          column_id: string;
          value: string;
        }>) ?? [];
      const cellVal = (rowId: string, colId: string) =>
        cells.find((c) => c.row_id === rowId && c.column_id === colId)?.value ??
        "";
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {content.title as string}
          </h1>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {columns.map((c) => (
                    <th
                      key={c.id}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground"
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border last:border-0 ${i % 2 ? "bg-muted/20" : ""}`}
                  >
                    {columns.map((c) => (
                      <td key={c.id} className="px-3 py-2 text-foreground">
                        {cellVal(row.id, c.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No rows.
              </p>
            )}
          </div>
        </div>
      );
    }
    case "collection":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{(content.icon as string) ?? "📁"}</span>
            <h1 className="text-2xl font-bold text-foreground">
              {content.title as string}
            </h1>
          </div>
          {desc && <MarkdownContent content={desc as string} />}
        </div>
      );
    case "reminder":
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {content.title as string}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={13} />
            {content.due_at
              ? `Due ${new Date(content.due_at as string).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`
              : "No due date"}
          </div>
          {desc && <MarkdownContent content={desc as string} />}
        </div>
      );
    default:
      return (
        <pre className="text-xs text-muted-foreground">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
  }
}

// ─── Password form ────────────────────────────────────────────────────────────

function PasswordForm({
  individualToken,
  onSuccess,
}: {
  individualToken: string;
  onSuccess: (data: RecipientShareResponse) => void;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `${API_URL}/api/public/share/r/${individualToken}/verify-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );
      const data = (await res.json()) as RecipientShareResponse;
      if (data.status === "ok") {
        onSuccess(data);
      } else if (data.status === "password_failed") {
        setErr("Incorrect password. Please try again.");
      } else {
        setErr("This link is no longer accessible.");
      }
    } catch {
      setErr("Unable to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock size={16} className="text-amber-500" />
        <p className="text-sm font-medium text-foreground">
          This link is password protected
        </p>
      </div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Verifying…" : "Access content"}
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecipientSharePage({
  params,
}: {
  params: Promise<{ individualToken: string }>;
}) {
  const { individualToken } = use(params);
  const [shareData, setShareData] = useState<RecipientShareResponse | null>(
    null,
  );
  const [status, setStatus] = useState<ShareStatus>("loading");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/public/share/r/${individualToken}`,
        );
        const data = (await res.json()) as RecipientShareResponse;
        setShareData(data);
        setStatus(data.status as ShareStatus);
      } catch {
        setStatus("not_found");
      }
    }
    load();
  }, [individualToken]);

  const errorConfigs: Record<
    string,
    { title: string; message: string; icon: React.ElementType; color: string }
  > = {
    not_found: {
      title: "Link not found",
      message: "This share link does not exist or has been removed.",
      icon: XCircle,
      color: "text-red-500",
    },
    revoked: {
      title: "Link revoked",
      message: "Access to this link has been revoked.",
      icon: XCircle,
      color: "text-red-500",
    },
    expired: {
      title: "Link expired",
      message: "This share link has expired or reached its view limit.",
      icon: Clock,
      color: "text-amber-500",
    },
    denied: {
      title: "Access denied",
      message: "You are not authorized to view this content.",
      icon: AlertTriangle,
      color: "text-red-500",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Zikron
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe size={12} />
            Shared content
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {/* Suspicious access banner */}
        {shareData?.suspicious && status === "ok" && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
            <AlertTriangle
              size={15}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Suspicious access detected
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                New device or location detected. If this is unexpected, contact
                the person who shared this with you.
              </p>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-2/3 bg-muted rounded-lg" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
          </div>
        )}

        {status === "password_required" && (
          <div className="max-w-sm mx-auto bg-card border border-border rounded-2xl p-6 shadow-sm">
            <PasswordForm
              individualToken={individualToken}
              onSuccess={(data) => {
                setShareData(data);
                setStatus("ok");
              }}
            />
          </div>
        )}

        {status === "ok" && shareData?.content && shareData.item_type && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <ContentRenderer
              itemType={shareData.item_type}
              content={shareData.content}
            />
          </div>
        )}

        {["not_found", "revoked", "expired", "denied"].includes(status) &&
          (() => {
            const cfg = errorConfigs[status];
            const Icon = cfg.icon;
            return (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className={cfg.color} />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {cfg.title}
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {cfg.message}
                </p>
              </div>
            );
          })()}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border mt-8">
        Shared via{" "}
        <Link href="/" className="hover:text-foreground transition-colors">
          Zikron
        </Link>
      </footer>
    </div>
  );
}
