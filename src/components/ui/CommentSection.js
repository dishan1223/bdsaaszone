"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Send, ChevronDown, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

const COMMENTS_PER_PAGE = 10;

function Avatar({ src, name, size = 32 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const style = { width: size, height: size, flexShrink: 0 };
  if (src)
    return <img src={src} alt={name} style={style} className="rounded-full object-cover ring-1 ring-slate-200" />;
  return (
    <div style={style} className="rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 ring-1 ring-slate-300">
      {initials}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CommentSection({ startupId }) {
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;

  const [comments, setComments]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [text, setText]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch comments ───────────────────────────────────────────────────────────
  const fetchComments = async (pageNum, append = false) => {
    try {
      const res = await axios.get(`/api/startups/comments/${startupId}`, {
        params: { page: pageNum, limit: COMMENTS_PER_PAGE },
      });
      const incoming = res.data.comments ?? [];
      setTotal(res.data.total ?? 0);
      setComments((prev) => append ? [...prev, ...incoming] : incoming);
    } catch {
      // fail silently — non-critical
    }
  };

  useEffect(() => {
    fetchComments(1).finally(() => setInitialLoading(false));
  }, [startupId]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    await fetchComments(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/startups/comments/${startupId}`, { text: text.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setTotal((t) => t + 1);
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/api/startups/comments/delete/${startupId}/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      // fail silently
    } finally {
      setDeleteTarget(null);
    }
  };

  const hasMore = comments.length < total;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Comments</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
      </div>

      {/* Compose box */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <Avatar src={user.image} name={user.name} size={34} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus-within:border-slate-500 transition-colors">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
                placeholder="Write a comment..."
                rows={2}
                className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-0.5"
              >
                <Send size={13} />
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-slate-400">Press Enter to post · Shift+Enter for new line</p>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
          <MessageSquare size={15} className="text-slate-400 shrink-0" />
          <span className="text-sm text-slate-500">
            <a href="/login" className="text-slate-700 font-medium hover:underline">Sign in</a> to leave a comment.
          </span>
        </div>
      )}

      {/* Comments list */}
      {initialLoading && (
        <div className="flex justify-center py-8 text-slate-400 text-sm">Loading comments...</div>
      )}

      {!initialLoading && comments.length === 0 && (
        <div className="flex flex-col items-center py-10 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-xl">
          <MessageSquare size={20} className="text-slate-300" />
          <span className="text-sm">No comments yet. Be the first!</span>
        </div>
      )}

      {!initialLoading && comments.length > 0 && (
        <div className="flex flex-col divide-y divide-slate-100">
          {comments.map((c) => {
            const isOwn = user && c.userId === user.id;
            const isDeleting = deleteTarget === c._id;
            return (
              <div key={c._id} className="flex gap-3 py-4 group">
                <Avatar src={c.author?.image} name={c.author?.name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{c.author?.name ?? "Anonymous"}</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  {isDeleting ? (
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-xs text-slate-500">Delete this comment?</span>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setDeleteTarget(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
                  )}
                </div>
                {isOwn && !isDeleting && (
                  <button
                    onClick={() => setDeleteTarget(c._id)}
                    className="shrink-0 text-slate-800 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : `Show more comments`}
            {!loadingMore && <ChevronDown size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}