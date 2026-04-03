"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Heart, MessageSquare, X, Trash2, CornerDownRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { usePushNotifications } from "@/hooks/usePushNotifications";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function NotificationIcon({ type }) {
  if (type === "like")
    return <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0"><Heart size={13} className="text-rose-400 fill-rose-400" /></div>;
  if (type === "reply")
    return <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"><CornerDownRight size={13} className="text-slate-400" /></div>;
  return <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"><MessageSquare size={13} className="text-blue-400" /></div>;
}

function NotificationItem({ n, onDelete, onNavigate }) {
  const label =
    n.type === "like"    ? "liked your startup" :
    n.type === "reply"   ? "replied to a comment on" :
                           "commented on";

  return (
    <Link
      href={`/startups/${n.startupSlug}`}
      onClick={onNavigate}
      className={`group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.seen ? "bg-blue-50/40" : ""}`}
    >
      {/* Actor avatar */}
      <div className="shrink-0 mt-0.5">
        {n.actorImage ? (
          <img src={n.actorImage} alt={n.actorName} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
            {n.actorName?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold">{n.actorName}</span>
          {" "}{label}{" "}
          <span className="font-semibold">{n.startupName}</span>
        </p>
        {n.preview && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            "{n.preview}{n.preview.length >= 80 ? "…" : ""}"
          </p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-1">
        <NotificationIcon type={n.type} />
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(n._id); }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </Link>
  );
}

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const modalRef                          = useRef(null);

  const { supported, permission, subscribed, loading: pushLoading, subscribe, unsubscribe } =
    usePushNotifications();

  // ── Fetch notifications lazily after page load ────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const t = setTimeout(() => {
      axios.get("/api/notifications")
        .then((res) => {
          setNotifications(res.data.notifications ?? []);
          setUnread(res.data.unread ?? 0);
        })
        .catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [userId]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (open && modalRef.current && !modalRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      axios.patch("/api/notifications").catch(() => {});
    }
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    axios.delete(`/api/notifications/${id}`).catch(() => {});
  };

  const handlePushToggle = () => {
    if (subscribed) unsubscribe();
    else subscribe();
  };

  const pushBlocked = permission === "denied";

  return (
    <div ref={modalRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
      >
        <Bell size={16} className="text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[9px] font-bold tabular-nums leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-11 left-0 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {notifications.length > 0 && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Push toggle */}
              {supported && !pushBlocked && (
                <button
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                  title={subscribed ? "Turn off push notifications" : "Enable push notifications"}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 ${
                    subscribed
                      ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {subscribed ? <Bell size={11} /> : <BellOff size={11} />}
                  {pushLoading ? "..." : subscribed ? "On" : "Off"}
                </button>
              )}
              {pushBlocked && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <BellOff size={11} /> Blocked
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Bell size={22} className="text-slate-300" />
                <span className="text-sm">No notifications yet</span>
                {supported && !subscribed && !pushBlocked && (
                  <button
                    onClick={handlePushToggle}
                    disabled={pushLoading}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-600 transition-colors underline"
                  >
                    Enable push notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n._id}
                    n={n}
                    onDelete={handleDelete}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">Auto-removed after 30 days</p>
            {supported && !pushBlocked && (
              <p className="text-xs text-slate-400">
                Push: <span className={subscribed ? "text-blue-500" : "text-slate-400"}>
                  {subscribed ? "enabled" : "disabled"}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}