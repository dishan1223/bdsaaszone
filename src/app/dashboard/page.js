"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut, Plus, Trash2, ExternalLink, Heart,
  ArrowLeft, Pencil, X, ChevronDown, TrendingUp,
  Globe, Tag, DollarSign, Users, BarChart2,
} from "lucide-react";
import axios from "axios";
import { authClient } from "@/lib/auth-client";
import { TechIcon } from "@/constants/constants.js";
import {CATEGORY_LABELS} from "@/constants/constants.js";


const PRODUCT_TYPE_LABELS = {
  free: "Free", subscription: "Subscription", one_time: "One-time",
};

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

// ── Small helpers ──────────────────────────────────────────────────────────────

function LogoSquare({ src, name, size = 44 }) {
  const style = { width: size, height: size, flexShrink: 0 };
  if (src) return <img src={src} alt={name} style={style} className="rounded-xl object-cover border border-slate-200" />;
  return (
    <div style={style} className="rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const styles = {
    slate: "bg-slate-100 text-slate-500",
    blue:  "bg-blue-50 text-blue-600 border border-blue-100",
    green: "bg-green-50 text-green-600 border border-green-100",
    amber: "bg-amber-50 text-amber-600 border border-amber-100",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${styles[color]}`}>
      {children}
    </span>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────────
function StatsBar({ startups }) {
  const totalLikes    = startups.reduce((acc, s) => acc + (s.likes ?? 0), 0);
  const forSaleCount  = startups.filter((s) => s.forSale).length;
  const cofounderCount = startups.filter((s) => s.seekingCofounder).length;
  const mostLiked     = [...startups].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];

  const stats = [
    { icon: <BarChart2 size={15} className="text-slate-400" />, label: "Total startups", value: startups.length },
    { icon: <Heart size={15} className="text-rose-400" />,      label: "Total likes",    value: totalLikes },
    { icon: <DollarSign size={15} className="text-blue-400" />, label: "Listed for sale", value: forSaleCount },
    { icon: <Users size={15} className="text-green-400" />,     label: "Seeking co-founder", value: cofounderCount },
  ];

  return (
    <div className="flex flex-col gap-3 mb-8">
      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5 p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-1.5">
              {s.icon}
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Most liked callout */}
      {mostLiked && mostLiked.likes > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
          <Heart size={14} className="text-blue-400 shrink-0" />
          <span className="text-xs text-blue-600">
            <span className="font-semibold">{mostLiked.name}</span> is your most liked startup with{" "}
            <span className="font-semibold">{mostLiked.likes}</span> {mostLiked.likes === 1 ? "like" : "likes"}.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Delete modal ───────────────────────────────────────────────────────────────
function DeleteModal({ startup, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-slate-800">Delete startup?</h3>
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{startup.name}</span> will be permanently removed. This cannot be undone.
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 mt-0.5 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Startup card ───────────────────────────────────────────────────────────────
function StartupCard({ startup, onDeleteClick }) {
  const slug = toSlug(startup.name);
  const createdAt = startup.createdAt
    ? new Date(startup.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">

      {/* Top row: logo + name + badges */}
      <div className="flex items-start gap-3">
        <LogoSquare src={startup.logoUrl} name={startup.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 leading-tight">{startup.name}</span>
            {startup.forSale && <Badge color="blue">For Sale</Badge>}
            {startup.seekingCofounder && <Badge color="green">Seeking Co-founder</Badge>}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {startup.description}
          </p>
        </div>
        {/* Likes counter */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 ml-1">
          <Heart size={14} className={startup.likes > 0 ? "text-rose-400" : "text-slate-300"} />
          <span className="text-xs font-semibold tabular-nums text-slate-600">{startup.likes ?? 0}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-slate-400">
          <Tag size={11} />
          <span className="text-xs">{CATEGORY_LABELS[startup.category] ?? startup.category}</span>
        </div>
        <span className="text-slate-200 text-xs">·</span>
        <Badge>{PRODUCT_TYPE_LABELS[startup.productType] ?? startup.productType}</Badge>

        {startup.forSale && startup.askingPrice && (
          <>
            <span className="text-slate-200 text-xs">·</span>
            <div className="flex items-center gap-1 text-blue-500">
              <DollarSign size={11} />
              <span className="text-xs font-medium">{startup.askingPrice}</span>
            </div>
          </>
        )}

        {startup.subscriptions?.filter(s => s.plan).length > 0 && (
          <>
            <span className="text-slate-200 text-xs">·</span>
            <span className="text-xs text-slate-400">
              {startup.subscriptions.filter(s => s.plan).length} plan{startup.subscriptions.filter(s => s.plan).length > 1 ? "s" : ""}
            </span>
          </>
        )}

        {createdAt && (
          <span className="text-xs text-slate-300 ml-auto">{createdAt}</span>
        )}
      </div>

      {/* URL */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <Globe size={11} className="shrink-0" />
        <a href={startup.url} target="_blank" rel="noopener noreferrer"
          className="text-xs truncate hover:text-slate-600 transition-colors">
          {startup.url?.replace(/^https?:\/\//, "")}
        </a>
      </div>

      {/* Tech stack */}
      {startup.techStack?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {startup.techStack.slice(0, 6).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
              <TechIcon name={t} size={12} />
              {t}
            </span>
          ))}
          {startup.techStack.length > 6 && (
            <span className="text-xs text-slate-400 self-center">+{startup.techStack.length - 6} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <a href={startup.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <ExternalLink size={11} /> Visit site
        </a>
        <Link href={`/startups/${slug}`}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <TrendingUp size={11} /> View listing
        </Link>

        <div className="flex items-center gap-2 ml-auto">
          <Link href={`/startups/edit/${slug}`}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all px-3 py-1.5 rounded-lg font-medium">
            <Pencil size={11} /> Edit
          </Link>
          <button onClick={() => onDeleteClick(startup)}
            className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all px-3 py-1.5 rounded-lg font-medium">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [startups, setStartups] = useState([]);
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!sessionLoading && !session?.user) router.push("/");
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (!session?.user) return;
    axios
      .get("/api/startups/mine")
      .then((res) => setStartups(res.data.startups ?? []))
      .catch(console.error)
      .finally(() => setLoadingStartups(false));
  }, [session]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authClient.signOut();
    router.push("/");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/startups/delete/${deleteTarget._id}`);
      setStartups((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredStartups = startups.filter((s) => {
    if (filter === "for-sale") return s.forSale;
    if (filter === "cofounder") return s.seekingCofounder;
    return true;
  });

  const user = session?.user;

  if (sessionLoading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm">Loading...</div>;
  }

  if (!user) return null;

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          startup={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Back */}
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-8 w-fit">
          <ArrowLeft size={15} />
          <span className="text-sm">Back to home</span>
        </Link>

        {/* Profile card */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 mb-6">
          <div className="shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 ring-2 ring-slate-100">
                {user.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Image src="/logo.svg" alt="logo" width={12} height={12} />
              <span className="text-xs text-slate-400">BD SaaS Zone</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 truncate">{user.name}</h1>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all px-3.5 py-2 rounded-lg shrink-0 disabled:opacity-60"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>

        {/* Stats — only show when there's something to show */}
        {!loadingStartups && startups.length > 0 && (
          <StatsBar startups={startups} />
        )}

        {/* Startups section */}
        <div className="flex flex-col gap-4">

          {/* Section header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-700">My Startups</h2>
              {!loadingStartups && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredStartups.length}{filter !== "all" ? ` of ${startups.length}` : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none text-xs text-slate-600 bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-7 py-2 outline-none hover:border-slate-400 focus:border-slate-500 transition-colors cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="for-sale">For Sale</option>
                  <option value="cofounder">Seeking Co-founder</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <Link href="/new">
                <button className="flex items-center gap-1.5 text-sm bg-slate-900 text-slate-50 px-3.5 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  <Plus size={14} /> Add Startup
                </button>
              </Link>
            </div>
          </div>

          {/* Loading */}
          {loadingStartups && (
            <div className="flex justify-center py-16 text-slate-400 text-sm">Loading...</div>
          )}

          {/* Empty — no startups at all */}
          {!loadingStartups && startups.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <span className="text-4xl">🚀</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-slate-600">No startups yet</span>
                <span className="text-xs text-slate-400">List your first product for the community to discover.</span>
              </div>
              <Link href="/new">
                <button className="flex items-center gap-1.5 text-sm bg-slate-900 text-slate-50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors mt-1">
                  <Plus size={14} /> Add your first startup
                </button>
              </Link>
            </div>
          )}

          {/* Empty — filter returned nothing */}
          {!loadingStartups && startups.length > 0 && filteredStartups.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <span className="text-2xl">🔍</span>
              <span className="text-sm">No startups match this filter.</span>
            </div>
          )}

          {/* Cards */}
          {!loadingStartups && filteredStartups.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredStartups.map((startup) => (
                <StartupCard key={startup._id} startup={startup} onDeleteClick={setDeleteTarget} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}