"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Send, ChevronDown, Trash2, Heart, CornerDownRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import AuthModal from "@/components/ui/AuthModal";
import Avatar from "@/components/ui/Avatar"

const COMMENTS_PER_PAGE = 10;


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

function ComposeBox({ user, onSubmit, placeholder = "Write a comment...", autoFocus = false, onCancel }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2.5">
      {!onCancel && <Avatar src={user?.image} name={user?.name} size={34} />}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus-within:border-slate-500 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus={autoFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              if (e.key === "Escape" && onCancel) onCancel();
            }}
            placeholder={placeholder}
            rows={2}
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-0.5"
          >
            <Send size={12} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Enter to post · Shift+Enter for new line</p>
          {onCancel && (
            <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function CommentLikeButton({ commentId, startupId, initialLikes, initialLiked, user, onAuthRequired }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user) { onAuthRequired(); return; }
    if (loading) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((n) => wasLiked ? n - 1 : n + 1);
    setLoading(true);
    try {
      const res = await axios.post(`/api/startups/comments/${startupId}/${commentId}/like`);
      setLiked(res.data.liked);
      setLikes(res.data.likes);
    } catch {
      setLiked(wasLiked);
      setLikes((n) => wasLiked ? n + 1 : n - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"}`}
    >
      <Heart size={12} className={liked ? "fill-rose-500" : ""} />
      {likes > 0 && <span className="tabular-nums">{likes}</span>}
    </button>
  );
}

function Reply({ reply, startupId, user, onDelete, onAuthRequired }) {
  const isOwn = user && reply.userId === user.id;
  const [deleteTarget, setDeleteTarget] = useState(false);

  return (
    <div className="flex gap-2 group">
      <Avatar src={reply.author?.image} name={reply.author?.name} size={26} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-800">{reply.author?.name ?? "Anonymous"}</span>
          <span className="text-xs text-slate-400">{timeAgo(reply.createdAt)}</span>
        </div>
        {deleteTarget ? (
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-xs text-slate-500">Delete?</span>
            <button onClick={() => onDelete(reply._id)} className="text-xs text-red-500 font-medium">Yes</button>
            <button onClick={() => setDeleteTarget(false)} className="text-xs text-slate-400">Cancel</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{reply.text}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <CommentLikeButton
                commentId={reply._id}
                startupId={startupId}
                initialLikes={reply.likes ?? 0}
                initialLiked={reply.likedBy?.includes(user?.id) ?? false}
                user={user}
                onAuthRequired={onAuthRequired}
              />
            </div>
          </>
        )}
      </div>
      {isOwn && !deleteTarget && (
        <button
          onClick={() => setDeleteTarget(true)}
          className="shrink-0 text-slate-800 hover:text-red-400 transition-colors md:opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

function Comment({ comment, startupId, user, onDelete, onAuthRequired, onReplyAdded }) {
  const isOwn = user && comment.userId === user.id;
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleReplySubmit = async (text) => {
    const res = await axios.post(`/api/startups/comments/${startupId}/${comment._id}/reply`, { text });
    onReplyAdded(comment._id, res.data.reply);
    setShowReply(false);
    setShowReplies(true);
  };

  const handleDeleteReply = async (replyId) => {
    await axios.delete(`/api/startups/comments/${startupId}/${replyId}`);
    // Optimistically update the UI - remove the reply from the comment
    onReplyAdded(comment._id, {
      ...comment,
      replies: comment.replies.filter(r => r._id !== replyId)
    });
  };

  const handleReplyClick = () => {
    if (!user) { onAuthRequired(); return; }
    setShowReply((v) => !v);
  };

  return (
    <div className="flex gap-3 py-4 group">
      <Avatar src={comment.author?.image} name={comment.author?.name} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">{comment.author?.name ?? "Anonymous"}</span>
          <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
        </div>

        {deleteTarget ? (
          <div className="flex items-center gap-3 py-1">
            <span className="text-xs text-slate-500">Delete this comment?</span>
            <button onClick={() => onDelete(comment._id)} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">Yes, delete</button>
            <button onClick={() => setDeleteTarget(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
            <div className="flex items-center gap-4 mt-2">
              <CommentLikeButton
                commentId={comment._id}
                startupId={startupId}
                initialLikes={comment.likes ?? 0}
                initialLiked={comment.likedBy?.includes(user?.id) ?? false}
                user={user}
                onAuthRequired={onAuthRequired}
              />
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <CornerDownRight size={12} />
                Reply
              </button>
              {comment.replies?.length > 0 && (
                <button
                  onClick={() => setShowReplies((v) => !v)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MessageSquare size={11} />
                  {showReplies ? "Hide replies" : `${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
                </button>
              )}
            </div>
          </>
        )}

        {showReply && user && (
          <div className="mt-3">
            <ComposeBox
              user={user}
              onSubmit={handleReplySubmit}
              placeholder={`Reply to ${comment.author?.name?.split(" ")[0] ?? "comment"}...`}
              autoFocus
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}

        {showReplies && comment.replies?.length > 0 && (
          <div className="mt-3 pl-3 border-l-2 border-slate-100 flex flex-col gap-3">
            {comment.replies.map((r) => (
              <Reply
                key={r._id}
                reply={r}
                startupId={startupId}
                user={user}
                onDelete={handleDeleteReply}
                onAuthRequired={onAuthRequired}
              />
            ))}
          </div>
        )}
      </div>

      {isOwn && !deleteTarget && (
        <button
          onClick={() => setDeleteTarget(true)}
          className="shrink-0 text-slate-800 hover:text-red-400 transition-colors md:opacity-0 group-hover:opacity-100 mt-0.5"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

export default function CommentSection({ startupId }) {
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;

  const [comments, setComments]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchComments = async (pageNum, append = false) => {
    try {
      const res = await axios.get(`/api/startups/comments/${startupId}`, {
        params: { page: pageNum, limit: COMMENTS_PER_PAGE },
      });
      setTotal(res.data.total ?? 0);
      setComments((prev) => append ? [...prev, ...(res.data.comments ?? [])] : (res.data.comments ?? []));
    } catch {}
  };

  useEffect(() => {
    fetchComments(1).finally(() => setInitialLoading(false));
  }, [startupId]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    await fetchComments(next, true);
    setPage(next);
    setLoadingMore(false);
  };

  const handleCommentSubmit = async (text) => {
    const res = await axios.post(`/api/startups/comments/${startupId}`, { text });
    setComments((prev) => [res.data.comment, ...prev]);
    setTotal((t) => t + 1);
  };

  const handleDeleteComment = async (commentId) => {
    await axios.delete(`/api/startups/comments/${startupId}/${commentId}`);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setTotal((t) => Math.max(0, t - 1));
  };

  const handleReplyAdded = async (parentCommentId, replyData) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment._id === parentCommentId
          ? {...comment, replies: [...(comment.replies || []), replyData]}
          : comment
      )
    );
  };

  const hasMore = comments.length < total;

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Comments</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total}</span>
        </div>

        {/* Compose — real if logged in, fake clickable if not */}
        <div className="mb-6">
          {user ? (
            <ComposeBox user={user} onSubmit={handleCommentSubmit} />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:border-slate-300 transition-colors"
            >
              <Avatar src={null} name={null} size={32} />
              <span className="text-sm text-slate-400">Write a comment...</span>
            </button>
          )}
        </div>

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
{comments.map((c) => (
  <Comment
    key={c._id}
    comment={c}
    startupId={startupId}
    user={user}
    onDelete={handleDeleteComment}
    onAuthRequired={() => setShowAuthModal(true)}
    onReplyAdded={handleReplyAdded}
  />
))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : "Show more comments"}
              {!loadingMore && <ChevronDown size={14} />}
            </button>
          </div>
        )}
      </div>
    </>
  );
}