"use client";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, TrendingUp, ChevronRight, ChevronDown, LayoutDashboard, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { CATEGORY_LABELS } from "@/constants/constants.js";
import Avatar from "@/components/ui/Avatar";
import Footer from "@/components/ui/Footer";
import NotificationBell from "@/components/ui/NotificationBell";
import { RankBadgeSmall } from "@/components/ui/RankBadge";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

function ForSaleBadge() {
  return (
    <span style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}
      className="text-xs font-medium px-2 py-0.5 rounded-full w-fit">For Sale</span>
  );
}

function LogoSquare({ src, name, size = 32 }) {
  const style = { width: size, height: size, flexShrink: 0 };
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

function SaleCardSkeleton() {
  return (
    <div className="w-40 sm:w-44 p-3 rounded-xl bg-white border border-slate-300 flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-4 animate-pulse"></div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
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
            {startup.currentRank && <RankBadgeSmall rank={startup.currentRank} />}
            {startup.forSale && <ForSaleBadge />}
          </div>
          {startup.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {startup.description.length > 37 ? startup.description.slice(0, 37) + "..." : startup.description}
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

function StartupMobileCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
      <div className="w-5 h-4 bg-slate-200 rounded animate-pulse"></div>
      <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-full mb-1 animate-pulse"></div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-1 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-4 animate-pulse"></div>
      </div>
    </div>
  );
}

function DashboardButton({ user }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href="/dashboard">
      <div
        className="fixed top-4 right-4 z-50 flex items-center gap-2.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="flex flex-col items-end overflow-hidden transition-all duration-200 ease-out"
          style={{ maxWidth: hovered ? "160px" : "0px", opacity: hovered ? 1 : 0 }}
        >
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap pr-1">My Dashboard</span>
          <span className="text-xs text-slate-400 whitespace-nowrap pr-1 truncate max-w-[140px]">
            {user?.name ?? user?.email ?? ""}
          </span>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          {user?.image ? (
            <img src={user.image} alt={user.name ?? "User"} className="w-full h-full rounded-full object-cover" />
          ) : (
            <LayoutDashboard size={16} className="text-slate-600" />
          )}
        </div>
      </div>
    </Link>
  );
}

function SearchDropdown({ query, startups, onClose }) {
  const q = query.toLowerCase().trim();
  const matchedStartups = startups
    .filter((s) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q))
    .slice(0, 4);
  const founderMap = {};
  for (const s of startups) {
    if (!s.founder || !s.userId) continue;
    if (!founderMap[s.userId]) founderMap[s.userId] = { ...s.founder, userId: s.userId, startupCount: 0 };
    founderMap[s.userId].startupCount += 1;
  }
  const matchedFounders = Object.values(founderMap)
    .filter((f) => f.name?.toLowerCase().includes(q))
    .slice(0, 3);
  const hasResults = matchedStartups.length > 0 || matchedFounders.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
      {!hasResults && <div className="px-4 py-6 text-center text-sm text-slate-400">No results for "{query}"</div>}
      {matchedStartups.length > 0 && (
        <div>
          <div className="px-3 pt-3 pb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Startups</span>
          </div>
          {matchedStartups.map((s) => (
            <Link key={s._id} href={`/startups/${toSlug(s.name)}`} onClick={onClose}>
              <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                <LogoSquare src={s.logoUrl} name={s.name} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">{s.name}</span>
                    {s.currentRank && <RankBadgeSmall rank={s.currentRank} />}
                    {s.forSale && <ForSaleBadge />}
                  </div>
                  <span className="text-xs text-slate-400 truncate block">{CATEGORY_LABELS[s.category] ?? s.category}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <Heart size={11} />
                  <span className="text-xs tabular-nums">{s.likes ?? 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {matchedFounders.length > 0 && (
        <div className={matchedStartups.length > 0 ? "border-t border-slate-100" : ""}>
          <div className="px-3 pt-3 pb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Founders</span>
          </div>
          {matchedFounders.map((f) => (
            <Link key={f.userId} href={`/founder/${f.userId}`} onClick={onClose}>
              <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                <Avatar src={f.image} name={f.name} size={30} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-800 block truncate">{f.name}</span>
                  <span className="text-xs text-slate-400">{f.startupCount} {f.startupCount === 1 ? "startup" : "startups"}</span>
                </div>
                <span className="text-xs text-slate-400 shrink-0">View profile →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
        <span className="text-xs text-slate-400">Press Enter to search all results</span>
      </div>
    </div>
  );
}

const PAGE_SIZE = 50;

export default function Home() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchFocused, setSearchFocused] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    axios.get("/api/startups")
      .then((res) => setStartups(res.data.startups ?? []))
      .catch(() => setError("Failed to load startups."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [submittedQuery, category]);

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setSearchFocused(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") { setSubmittedQuery(query); setSearchFocused(false); }
    if (e.key === "Escape") setSearchFocused(false);
  };

  const clearSearch = () => { setQuery(""); setSubmittedQuery(""); setSearchFocused(false); };

  const activeQuery = submittedQuery || "";
  const filtered = startups.filter((s) => {
    const q = activeQuery.toLowerCase();
    const matchesQuery = !q || s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.founder?.name?.toLowerCase().includes(q);
    return matchesQuery && (category === "all" || s.category === category);
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const forSale = startups.filter((s) => s.forSale);
  const showDropdown = searchFocused && query.trim().length >= 1;
  const skeletonCount = 5;

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {isLoggedIn && <DashboardButton user={session?.user} />}
        {isLoggedIn && <NotificationBell userId={session?.user?.id} />}

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
            <div ref={searchRef} className="relative flex-1 sm:flex-none sm:w-96">
              <div className="flex items-center p-2 rounded-lg bg-slate-50 border border-slate-300 focus-within:border-slate-500 transition-colors">
                <div className="pl-1 shrink-0"><Search size={18} color="#7C7D7E" strokeWidth={2.5} /></div>
                <input type="text" placeholder="Search startups & founders..." value={query}
                  onChange={(e) => { setQuery(e.target.value); setSearchFocused(true); }}
                  onFocus={() => setSearchFocused(true)} onKeyDown={handleSearchKeyDown}
                  className="flex-1 bg-transparent px-3 outline-none text-sm" />
                {query && (
                  <button onClick={clearSearch} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors pr-1">
                    <X size={15} />
                  </button>
                )}
              </div>
              {showDropdown && <SearchDropdown query={query} startups={startups} onClose={() => { setSearchFocused(false); setSubmittedQuery(query); }} />}
            </div>
            <Link href="/new" className="w-full sm:w-auto">
              <button className="btn border-none w-full sm:w-auto bg-slate-900 rounded-lg text-slate-50">+ Add Startup</button>
            </Link>
          </div>
          {activeQuery && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Results for <span className="font-medium text-slate-700">"{activeQuery}"</span></span>
              <button onClick={clearSearch} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 rounded-full px-2 py-0.5">
                <X size={11} /> Clear
              </button>
            </div>
          )}
        </div>

        {/* For Sale */}
        {loading ? (
          <div className="mt-10 sm:mt-14">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                <div className="h-5 bg-slate-200 rounded-full w-8 animate-pulse"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {Array.from({ length: 4 }).map((_, i) => <SaleCardSkeleton key={i} />)}
            </div>
          </div>
        ) : forSale.length > 0 && !activeQuery && (
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

        {/* All Startups */}
        <div className="mt-10 sm:mt-12 mb-16">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">{activeQuery ? "Search Results" : "All Startups"}</span>
              {!loading && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filtered.length}</span>}
              {loading && <div className="h-5 bg-slate-200 rounded-full w-8 animate-pulse"></div>}
            </div>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="appearance-none text-xs text-slate-600 bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 outline-none hover:border-slate-400 focus:border-slate-500 transition-colors cursor-pointer">
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {loading && (
            <>
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
                    {Array.from({ length: skeletonCount }).map((_, idx) => (
                      <tr key={idx} className="border-b border-slate-100 bg-slate-50">
                        <td className="pl-4 py-3 w-10 align-top pt-4 text-slate-400 text-sm font-mono">{idx + 1}</td>
                        <td className="py-3"><div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div><div className="flex flex-col gap-1"><div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div><div className="h-3 bg-slate-200 rounded w-48 animate-pulse"></div></div></div></td>
                        <td className="py-3 align-top pt-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div></div></td>
                        <td className="py-3 align-top pt-4"><div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse"></div></td>
                        <td className="py-3 pr-4 text-right align-top pt-4"><div className="flex items-center justify-end gap-1.5"><div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div><div className="h-4 bg-slate-200 rounded w-4 animate-pulse"></div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 sm:hidden">
                {Array.from({ length: skeletonCount }).map((_, idx) => <StartupMobileCardSkeleton key={idx} />)}
              </div>
            </>
          )}

          {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-2 text-slate-400">
              <span className="text-3xl">🔍</span>
              <span className="text-sm">No startups found{activeQuery ? ` for "${activeQuery}"` : ""}.</span>
              {activeQuery && <button onClick={clearSearch} className="text-xs text-slate-500 hover:text-slate-700 underline mt-1">Clear search</button>}
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
                      <tr key={startup._id} onClick={() => window.location.href = `/startups/${toSlug(startup.name)}`}
                        className="border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <td className="pl-4 py-3 text-sm text-slate-400 font-mono w-10 align-top pt-4">{idx + 1}</td>
                        <td className="py-3">
                          <div className="flex items-start gap-3">
                            <LogoSquare src={startup.logoUrl} name={startup.name} />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-slate-800 leading-tight">{startup.name}</span>
                                {/* ── Rank badge injected here ── */}
                                {startup.currentRank && <RankBadgeSmall rank={startup.currentRank} />}
                                {startup.forSale && <ForSaleBadge />}
                              </div>
                              {startup.description && (
                                <span className="text-xs text-slate-400 leading-relaxed">
                                  {startup.description.length > 37 ? startup.description.slice(0, 37) + "..." : startup.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 align-top pt-4">
                          <div className="flex items-center gap-2 w-fit" onClick={(e) => { e.stopPropagation(); window.location.href = `/founder/${startup.userId}`; }}>
                            <Avatar src={startup.founder?.image} name={startup.founder?.name} size={28} />
                            <span className="text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors cursor-pointer">{startup.founder?.name ?? "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-3 align-top pt-4">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{CATEGORY_LABELS[startup.category] ?? startup.category}</span>
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
                {visible.map((startup, idx) => <StartupMobileCard key={startup._id} startup={startup} idx={idx} />)}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-colors px-5 py-2.5 rounded-lg">
                    Show {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}