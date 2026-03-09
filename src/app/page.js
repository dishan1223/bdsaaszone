"use client";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, TrendingUp, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const CATEGORY_LABELS = {
  ai: "AI", productivity: "Productivity", marketing: "Marketing", finance: "Finance",
  hr: "HR & Recruitment", ecommerce: "E-Commerce", education: "Education",
  healthcare: "Healthcare", "developer-tools": "Developer Tools", analytics: "Analytics",
  communication: "Communication", design: "Design", security: "Security", other: "Other",
};

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

function Avatar({ src, name, size = 28 }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const style = { width: size, height: size, flexShrink: 0 };
  if (src) return <img src={src} alt={name} style={style} className="rounded-full object-cover ring-1 ring-slate-200" />;
  return <div style={style} className="rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 ring-1 ring-slate-300">{initials}</div>;
}

function ForSaleBadge() {
  return (
    <span style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}
      className="text-xs font-medium px-2 py-0.5 rounded-full w-fit">
      For Sale
    </span>
  );
}

function LogoSquare({ src, name }) {
  const style = { width: 32, height: 32, flexShrink: 0 };
  if (src) return <img src={src} alt={name} style={style} className="rounded-lg object-cover border border-slate-200" />;
  return (
    <div style={style} className="rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

function SaleCard({ startup }) {
  return (
    <Link href={`/startups/${toSlug(startup.name)}`} className="flex-shrink-0">
      <div className="w-40 sm:w-44 p-3 rounded-xl bg-white border border-slate-300 hover:border-blue-200 hover:shadow-sm transition-all flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <LogoSquare src={startup.logoUrl} name={startup.name} />
          <span className="text-sm font-semibold text-slate-800 truncate leading-tight">{startup.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-400">
            <Heart size={11} />
            <span className="text-xs">{startup.likes ?? 0}</span>
          </div>
          <span className="text-xs text-slate-400 truncate max-w-[80px]">
            {startup.founder?.name?.split(" ")[0] ?? "Unknown"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StartupMobileCard({ startup, idx }) {
  return (
    <Link href={`/startups/${toSlug(startup.name)}`} className="block">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
        <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{idx + 1}</span>
        <LogoSquare src={startup.logoUrl} name={startup.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 truncate">{startup.name}</span>
            {startup.forSale && <ForSaleBadge />}
          </div>
          {startup.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {startup.description.length > 37
                ? startup.description.slice(0, 37) + "..."
                : startup.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-400">{CATEGORY_LABELS[startup.category] ?? startup.category}</span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-xs text-slate-400">{startup.founder?.name?.split(" ")[0] ?? "Unknown"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <Heart size={12} />
          <span className="text-xs tabular-nums">{startup.likes ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

const PAGE_SIZE = 50;

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    axios
      .get("/api/startups")
      .then((res) => setStartups(res.data.startups ?? []))
      .catch(() => setError("Failed to load startups."))
      .finally(() => setLoading(false));
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const filtered = startups.filter((s) => {
    const matchesQuery = s.name?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || s.category === category;
    return matchesQuery && matchesCategory;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const forSale = startups.filter((s) => s.forSale);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center mt-12 sm:mt-20 gap-4">
        <div className="flex gap-2 text-slate-600 text-base sm:text-2xl font-md">
          <Image src="/logo.svg" alt="logo" width={20} height={20} />
          BD SaaS Zone
        </div>
        <div className="text-slate-800 font-bold text-3xl sm:text-5xl text-center leading-tight">
          A Database of SaaS products
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          from Bangladesh
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex items-center flex-1 sm:flex-none sm:w-80 p-2 rounded-lg bg-slate-50 border border-slate-300">
            <div className="pl-1 shrink-0">
              <Search size={18} color="#7C7D7E" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search Startups"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 outline-none text-sm"
            />
          </div>
          <Link href="/new" className="w-full sm:w-auto">
            <button className="btn border-none w-full sm:w-auto bg-slate-900 rounded-lg text-slate-50">
              + Add Startup
            </button>
          </Link>
        </div>
      </div>

      {/* ── For Sale ─────────────────────────────────────────────────────── */}
      {!loading && forSale.length > 0 && (
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">For Sale</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{forSale.length}</span>
            </div>
            <Link href="/for-sale" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {forSale.map((s) => <SaleCard key={s._id} startup={s} />)}
          </div>
        </div>
      )}

      {/* ── All Startups ─────────────────────────────────────────────────── */}
      <div className="mt-10 sm:mt-12 mb-16">

        {/* Section header + category filter */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">All Startups</span>
            {!loading && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none text-xs text-slate-600 bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 outline-none hover:border-slate-400 focus:border-slate-500 transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {loading && <div className="flex justify-center py-16 text-slate-400 text-sm">Loading...</div>}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-2 text-slate-400">
            <span className="text-3xl">🔍</span>
            <span className="text-sm">No startups found.</span>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-300">
              <table className="table w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-200">
                    <th className="w-10 font-medium py-3 pl-4 bg-transparent">#</th>
                    <th className="font-medium py-3 bg-transparent">Startup</th>
                    <th className="font-medium py-3 bg-transparent">Founder</th>
                    <th className="font-medium py-3 bg-transparent">Category</th>
                    <th className="font-medium py-3 pr-4 bg-transparent text-right">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((startup, idx) => (
                    <tr
                      key={startup._id}
                      onClick={() => window.location.href = `/startups/${toSlug(startup.name)}`}
                      className="border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <td className="pl-4 py-3 text-sm text-slate-400 font-mono w-10 align-top pt-4">{idx + 1}</td>
                      <td className="py-3">
                        <div className="flex items-start gap-3">
                          <LogoSquare src={startup.logoUrl} name={startup.name} />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800 leading-tight">{startup.name}</span>
                              {startup.forSale && <ForSaleBadge />}
                            </div>
                            {startup.description && (
                              <span className="text-xs text-slate-400 leading-relaxed">
                                {startup.description.length > 37
                                  ? startup.description.slice(0, 37) + "..."
                                  : startup.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 align-top pt-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={startup.founder?.image} name={startup.founder?.name} size={28} />
                          <span className="text-sm text-slate-600">{startup.founder?.name ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 align-top pt-4">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {CATEGORY_LABELS[startup.category] ?? startup.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right align-top pt-4">
                        <div className="flex items-center justify-end gap-1.5 text-slate-500">
                          <Heart size={13} className="text-slate-400" />
                          <span className="text-sm tabular-nums">{startup.likes ?? 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2 sm:hidden">
              {visible.map((startup, idx) => (
                <StartupMobileCard key={startup._id} startup={startup} idx={idx} />
              ))}
            </div>

            {/* Show more button */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors px-5 py-2.5 rounded-lg"
                >
                  Show {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}