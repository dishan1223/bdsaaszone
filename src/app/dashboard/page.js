"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut, Plus, Trash2, ExternalLink, Heart,
  ArrowLeft, Pencil, X, ChevronDown
} from "lucide-react";
import axios from "axios";
import { authClient } from "@/lib/auth-client";
import { TechIcon } from "@/lib/techIcons";

const CATEGORY_LABELS = {
  ai: "AI", productivity: "Productivity", marketing: "Marketing", finance: "Finance",
  hr: "HR & Recruitment", ecommerce: "E-Commerce", education: "Education",
  healthcare: "Healthcare", "developer-tools": "Developer Tools", analytics: "Analytics",
  communication: "Communication", design: "Design", security: "Security", other: "Other",
};

const PRODUCT_TYPE_LABELS = {
  free: "Free",
  subscription: "Subscription",
  one_time: "One-time",
};

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

function LogoSquare({ src, name, size = 40 }) {
  const style = { width: size, height: size, flexShrink: 0 };
  if (src)
    return <img src={src} alt={name} style={style} className="rounded-xl object-cover border border-slate-200" />;
  return (
    <div style={style} className="rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const styles = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    green: "bg-green-50 text-green-600 border border-green-100",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[color]}`}>
      {children}
    </span>
  );
}

function DeleteModal({ startup, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-slate-800">Delete startup?</h3>
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{startup.name}</span> will be permanently removed.
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 mt-0.5">
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

function StartupCard({ startup, onDeleteClick }) {
  const slug = toSlug(startup.name);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <LogoSquare src={startup.logoUrl} name={startup.name} size={44} />
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
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge>{CATEGORY_LABELS[startup.category] ?? startup.category}</Badge>
        <Badge>{PRODUCT_TYPE_LABELS[startup.productType] ?? startup.productType}</Badge>
        <div className="flex items-center gap-1 text-slate-400 ml-auto">
          <Heart size={12} />
          <span className="text-xs tabular-nums">{startup.likes ?? 0}</span>
        </div>
      </div>

      {/* Tech stack */}
      {startup.techStack?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {startup.techStack.slice(0, 5).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
              <TechIcon name={t} size={13} />
              {t}
            </span>
          ))}
          {startup.techStack.length > 5 && (
            <span className="text-xs text-slate-400 self-center">+{startup.techStack.length - 5} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <a href={startup.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
          <ExternalLink size={12} /> Visit
        </a>
        <Link href={`/startups/${slug}`}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
          View page
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <Link href={`/startups/${slug}/edit`}
            className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all px-3 py-1.5 rounded-lg">
            <Pencil size={12} /> Edit
          </Link>
          <button onClick={() => onDeleteClick(startup)}
            className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all px-3 py-1.5 rounded-lg">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 mb-8">
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
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="logo" width={13} height={13} />
              <span className="text-xs text-slate-400">BD SaaS Zone</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5 truncate">{user.name}</h1>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-all px-3.5 py-2 rounded-lg shrink-0 disabled:opacity-60"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>

        {/* Startups section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-700">My Startups</h2>
              {!loadingStartups && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{startups.length}</span>
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

          {loadingStartups && (
            <div className="flex justify-center py-16 text-slate-400 text-sm">Loading...</div>
          )}

          {!loadingStartups && startups.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <span className="text-3xl">🚀</span>
              <span className="text-sm">You haven't added any startups yet.</span>
              <Link href="/new">
                <button className="flex items-center gap-1.5 text-sm bg-slate-900 text-slate-50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors mt-1">
                  <Plus size={14} /> Add your first startup
                </button>
              </Link>
            </div>
          )}

          {!loadingStartups && startups.length > 0 && filteredStartups.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <span className="text-2xl">🔍</span>
              <span className="text-sm">No startups match this filter.</span>
            </div>
          )}

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