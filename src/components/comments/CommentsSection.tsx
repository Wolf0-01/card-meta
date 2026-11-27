"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";

interface CommentAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
}

interface CommentRecord {
  id: string;
  content: string;
  createdAt: string;
  user: CommentAuthor;
}

interface Props {
  type: "deck" | "tournament";
  targetId: string;
  currentUser: {
    id: string;
    username: string;
    role: string;
  } | null;
}

export default function CommentsSection({
  type,
  targetId,
  currentUser,
}: Props) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const url = "/api/comments?type=" + type + "&targetId=" + encodeURIComponent(targetId);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type, targetId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, targetId, content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not post comment.");
        return;
      }
      setComments((prev) => [data.comment, ...prev]);
      setContent("");
    } catch {
      setError("Network error while posting comment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/comments?id=" + encodeURIComponent(id), {
      method: "DELETE",
    });
    if (res.ok) {
      setComments((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const canModerate =
    currentUser?.role === "ADMIN" || currentUser?.role === "EDITOR";

  return (
    <section
      aria-label="Comments"
      className="mt-8 border-t border-slate-800 pt-6"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-sky-400" />
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">
          Comments
        </h2>
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-300">
          {comments.length}
        </span>
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={600}
            rows={3}
            placeholder="Write a comment..."
            className="w-full rounded-xl border border-slate-700/80 bg-[#0B132B] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400/70 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">
              {content.length}/600
            </span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </form>
      ) : (
        <p className="mt-3 text-xs text-slate-400">
          <Link
            href="/login"
            className="font-bold text-sky-400 hover:text-sky-300 hover:underline"
          >
            Login
          </Link>{" "}
          to join the discussion!
        </p>
      )}

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-xs text-slate-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
            No comments yet. Be the first to join the discussion!
          </p>
        ) : (
          comments.map((item) => {
            const authorName =
              item.user.displayName?.trim() || item.user.username;
            const canDelete =
              Boolean(currentUser) &&
              (currentUser?.id === item.user.id || canModerate);

            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-800/90 bg-[#0B132B]/90 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={"/user/" + item.user.username}
                      className="text-xs font-bold text-sky-400 hover:underline"
                    >
                      {authorName}
                    </Link>
                    {(item.user.role === "ADMIN" ||
                      item.user.role === "EDITOR") && (
                      <span className="rounded border border-sky-400/35 bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-300">
                        TPC
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">
                      · {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete comment"
                      className="text-slate-500 transition-colors hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-200">
                  {item.content}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
