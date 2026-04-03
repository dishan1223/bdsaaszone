"use client";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, TrendingUp, ChevronRight, ChevronDown, LayoutDashboard, X, Sparkles, Quote as QuoteIcon, DollarSign, Users, Rocket } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { CATEGORY_LABELS } from "@/constants/constants.js";
import Avatar from "@/components/ui/Avatar";
import Footer from "@/components/ui/Footer";
import NotificationBell from "@/components/ui/NotificationBell";
import { RankBadgeSmall, RankBadgeMobile } from "@/components/ui/RankBadge";

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

function PromotionScroller({ startups }) {
  if (!startups.length) return (
    <Link href="https://wa.me/8801700000000" className="flex items-center justify-center gap-2 py-1.5 bg-slate-50 border-b border-slate-200">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Promote your SaaS for ৳120/mo</span>
    </Link>
  );

  return (
    <div className="bg-white border-b border-slate-200 h-8 overflow-hidden relative">
      <div className="flex animate-horizontal-scroll w-fit whitespace-nowrap">
        {[...startups, ...startups, ...startups].map((s, i) => (
          <Link key={s._id + i} href={`/startups/${toSlug(s.name)}`} 
            className="flex items-center gap-2 h-8 px-6 shrink-0 border-r border-slate-100 last:border-r-0">
            <img src={s.logoUrl} alt="" className="w-4 h-4 rounded shadow-sm shrink-0" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{s.name}</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter shrink-0 ml-1">Promoted</span>
          </Link>
        ))}
      </div>
      <style jsx>{`
        @keyframes horizontal-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-horizontal-scroll {
          animation: horizontal-scroll ${startups.length * 5}s linear infinite;
        }
        .animate-horizontal-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function PromotionSidebar({ startups, side = "left" }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (startups.length <= 5) return;
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % startups.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [startups]);

  const displayStartups = [];
  if (startups.length > 0) {
    for (let i = 0; i < Math.min(5, startups.length); i++) {
      displayStartups.push(startups[(offset + i) % startups.length]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Promoted</p>
      
      {displayStartups.map((s) => (
        <Link key={s._id} href={`/startups/${toSlug(s.name)}`} className="group block">
          <div className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <LogoSquare src={s.logoUrl} name={s.name} size={20} />
              <h3 className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate">{s.name}</h3>
            </div>
          </div>
        </Link>
      ))}

      {displayStartups.length < 5 && Array.from({ length: 5 - displayStartups.length }).map((_, i) => (
        <Link key={i} href="https://wa.me/8801700000000" className="block p-1.5 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-white transition-all text-center group">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-blue-600 transition-colors">৳120 Slot</p>
        </Link>
      ))}
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
  const startIdx = (startup._index || 0);
  return (
    <Link href={`/startups/${toSlug(startup.name)}`} className="block">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
        <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{startIdx + 1}</span>
        <LogoSquare src={startup.logoUrl} name={startup.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 truncate">{startup.name}</span>
            {startup.currentRank && <RankBadgeMobile rank={startup.currentRank} />}
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
    <div className="fixed top-12 right-4 xl:top-4 z-[70] flex items-center gap-2">
      <Link href="https://wa.me/8801700000000?text=I'm%20interested%20in%20advertising%20my%20SaaS%20on%20BD%20SaaS%20Zone" target="_blank">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-md group">
          <Rocket size={14} className="group-hover:animate-bounce" />
          <span className="text-xs font-bold hidden sm:block">Advertise ৳120</span>
        </div>
      </Link>
      <Link href="/dashboard">
        <div
          className="flex items-center gap-2.5"
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
    </div>
  );
}

function SearchDropdown({ query, startups, onClose }) {
  const q = query.toLowerCase().trim();
  const matchedStartups = startups
    .filter((s) => {
      const categoryLabel = CATEGORY_LABELS[s.category] || "";
      return (
        s.name?.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q) ||
        s.founder?.name?.toLowerCase().includes(q) ||
        categoryLabel.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {matchedStartups.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm font-bold text-slate-800 mb-1">No instant matches</p>
          <p className="text-xs text-slate-400">Press Enter to search all startup bios</p>
        </div>
      )}
      {matchedStartups.length > 0 && (
        <div>
          <div className="px-4 pt-4 pb-2 border-b border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Results</span>
            <Link href="/startups" onClick={onClose} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {matchedStartups.map((s) => (
              <Link key={s._id} href={`/startups/${toSlug(s.name)}`} onClick={onClose}>
                <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <LogoSquare src={s.logoUrl} name={s.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{s.name}</span>
                      {s.currentRank && <RankBadgeSmall rank={s.currentRank} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{CATEGORY_LABELS[s.category] || s.category}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-400 truncate">{s.founder?.name || "Founder"}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 text-center">Press <span className="text-slate-600">Enter</span> for detailed search results</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [startups, setStartups] = useState([]);
  const [forSaleStartups, setForSaleStartups] = useState([]);
  const [newlyAddedStartups, setNewlyAddedStartups] = useState([]);
  const [advertisedStartups, setAdvertisedStartups] = useState([]);
  const [quote, setQuote] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const searchRef = useRef(null);

  // Fetch Advertised Startups
  useEffect(() => {
    axios.get("/api/startups?advertised=true&limit=50")
      .then((res) => setAdvertisedStartups(res.data.startups ?? []))
      .catch(() => {});
  }, []);

  // Fetch "For Sale" Startups
  useEffect(() => {
    axios.get("/api/startups?forSale=true&limit=10")
      .then((res) => setForSaleStartups(res.data.startups ?? []))
      .catch(() => {});
  }, []);

  // Fetch "Newly Added" Startups (last 3 days)
  useEffect(() => {
    setLoadingNew(true);
    axios.get("/api/startups?newlyAdded=true&limit=10")
      .then((res) => setNewlyAddedStartups(res.data.startups ?? []))
      .catch(() => {})
      .finally(() => setLoadingNew(false));
  }, []);

  // Fetch a random quote
  useEffect(() => {
    axios.get("https://dummyjson.com/quotes/random")
      .then((res) => setQuote(res.data))
      .catch(() => {
        setQuote({ quote: "The best way to predict the future is to create it.", author: "Peter Drucker" });
      });
  }, []);

  // Main Fetch Logic
  const fetchStartups = async (pageNum, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.append("page", pageNum);
      if (category !== "all") params.append("category", category);
      if (submittedQuery) params.append("search", submittedQuery);

      const res = await axios.get(`/api/startups?${params.toString()}`);
      const data = res.data;

      setTotalItems(data.totalItems);
      setHasMore(data.hasMore);

      if (reset) setStartups(data.startups);
      else setStartups((prev) => [...prev, ...data.startups]);
      setError("");
    } catch (err) {
      setError("Failed to load startups.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchStartups(1, true);
  }, [category, submittedQuery]);

  useEffect(() => {
    if (page > 1) fetchStartups(page, false);
  }, [page]);

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setSearchFocused(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") { setSubmittedQuery(query); setSearchFocused(false); }
    if (e.key === "Escape") setSearchFocused(false);
  };

  const clearSearch = () => { setQuery(""); setSubmittedQuery(""); };

  const showDropdown = searchFocused && query.trim().length >= 1;

  // Split advertisements for two sides
  const mid = Math.ceil(advertisedStartups.length / 2);
  const leftAds = advertisedStartups.slice(0, mid);
  const rightAds = advertisedStartups.slice(mid);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Top Ad */}
      <div className="xl:hidden sticky top-0 z-[60]">
        <PromotionScroller startups={advertisedStartups} />
      </div>

      <div className="flex-1 relative">
        {/* Desktop Sidebars */}
        <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 w-40">
          <PromotionSidebar startups={leftAds} side="left" />
        </div>

        <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 w-40">
          <PromotionSidebar startups={rightAds} side="right" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 xl:pt-0">
          {isLoggedIn && <DashboardButton user={session?.user} />}
          {isLoggedIn && (
            <div className="fixed top-12 left-4 xl:top-4 xl:left-4 z-[70]">
              <NotificationBell userId={session?.user?.id} />
            </div>
          )}

          <div className="flex flex-col items-center mt-12 sm:mt-24 gap-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[13px] font-semibold tracking-tight shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              The Directory of Bangladeshi Startups
            </div>

            <div className="flex flex-col items-center gap-4 text-center max-w-3xl">
              <h1 className="text-slate-900 font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                Discover the next big thing built in <span className="text-blue-600">Bangladesh</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
                A curated database of SaaS products, mobile apps, and digital tools. Find inspiration, support local founders, or acquire your next venture.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2">
              <div ref={searchRef} className="relative flex-1 sm:flex-none sm:w-96 group">
                <div className="flex items-center p-3 rounded-xl bg-white border border-slate-200 group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-50 transition-all duration-300 shadow-sm">
                  <div className="pl-1 shrink-0"><Search size={18} className="text-slate-400" strokeWidth={2.5} /></div>
                  <input type="text" placeholder="Search startups, categories, founders..." value={query}
                    onChange={(e) => { setQuery(e.target.value); setSearchFocused(true); }}
                    onFocus={() => setSearchFocused(true)} onKeyDown={handleSearchKeyDown}
                    className="flex-1 bg-transparent px-3 outline-none text-[15px] font-medium text-slate-800" />
                  {query && (
                    <button onClick={clearSearch} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors pr-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
                {showDropdown && <SearchDropdown query={query} startups={startups} onClose={() => { setSearchFocused(false); setSubmittedQuery(query); }} />}
              </div>
              <Link href="/new" className="flex-1 sm:flex-none">
                <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 rounded-xl text-white h-[50px] px-8 text-[15px] font-bold transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2">
                  + Add Startup
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <Link href="/startups" className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 shadow-sm">
                <Rocket size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 uppercase tracking-wider">Browse All</span>
              </Link>
              <Link href="/docs/badge" className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 shadow-sm">
                <TrendingUp size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 uppercase tracking-wider">Ranking Badge</span>
              </Link>
              <Link href="/for-sale" className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-200 hover:bg-amber-50 transition-all duration-300 shadow-sm">
                <DollarSign size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-amber-600 uppercase tracking-wider">For Sale</span>
              </Link>
              <Link href="/co-founders" className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 shadow-sm">
                <Users size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 uppercase tracking-wider">Co-Founder</span>
              </Link>
            </div>
          </div>

          {submittedQuery && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-8">
              <span>Results for <span className="font-medium text-slate-700">"{submittedQuery}"</span></span>
              <button onClick={clearSearch} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 rounded-full px-2 py-0.5">
                <X size={11} /> Clear
              </button>
            </div>
          )}

          {forSaleStartups.length > 0 && !submittedQuery && (
            <div className="mt-12 sm:mt-16 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><DollarSign size={16} className="text-blue-500" /></div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight uppercase">Marketplace</span>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">FOR SALE</span>
                </div>
                <Link href="/for-sale" className="group flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-all">
                  View all <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 no-scrollbar" style={{ scrollbarWidth: "none" }}>
                {forSaleStartups.map((s) => <SaleCard key={s._id} startup={s} />)}
              </div>
            </div>
          )}

          {!submittedQuery && (newlyAddedStartups.length > 0 || loadingNew) && (
            <div className="mt-10 sm:mt-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-50 rounded-lg"><Sparkles size={16} className="text-amber-500" /></div>
                <span className="text-sm font-bold text-slate-800 tracking-tight uppercase">Newly Added</span>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">LAST 3 DAYS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loadingNew ? (
                  Array.from({ length: 2 }).map((_, i) => <StartupMobileCardSkeleton key={i} />)
                ) : (
                  newlyAddedStartups.slice(0, 4).map((s) => (
                    <Link key={s._id} href={`/startups/${toSlug(s.name)}`} className="group">
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white group-hover:border-amber-200 group-hover:shadow-sm transition-all duration-300">
                        <LogoSquare src={s.logoUrl} name={s.name} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 truncate">{s.name}</span>
                            {s.forSale && <ForSaleBadge />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.description}</p>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={16} className="text-amber-400" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-16 sm:mt-20 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">{submittedQuery ? "Search Results" : "All Startups"}</span>
                {!loading && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{totalItems}</span>}
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

            {loading && startups.length === 0 && (
               <div className="flex flex-col gap-2 sm:hidden">
                 {Array.from({ length: 5 }).map((_, idx) => <StartupMobileCardSkeleton key={idx} />)}
               </div>
            )}

            {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

            {!loading && !error && startups.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-2 text-slate-400">
                <span className="text-3xl">🔍</span>
                <span className="text-sm">No startups found{submittedQuery ? ` for "${submittedQuery}"` : ""}.</span>
                {submittedQuery && <button onClick={clearSearch} className="text-xs text-slate-500 hover:text-slate-700 underline mt-1">Clear search</button>}
              </div>
            )}

            {startups.length > 0 && (
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
                      {startups.map((startup, idx) => (
                        <tr key={startup._id} onClick={() => window.location.href = `/startups/${toSlug(startup.name)}`}
                          className="border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                          <td className="pl-4 py-3 text-sm text-slate-400 font-mono w-10 align-top pt-4">{idx + 1}</td>
                          <td className="py-3">
                            <div className="flex items-start gap-3">
                              <LogoSquare src={startup.logoUrl} name={startup.name} />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-800 leading-tight">{startup.name}</span>
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
                <div className="flex flex-col gap-2 sm:hidden">
                  {startups.map((startup, idx) => <StartupMobileCard key={startup._id} startup={{...startup, _index: idx}} idx={idx} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => setPage((p) => p + 1)} disabled={loadingMore}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:border-slate-800 hover:text-slate-800 transition-all px-8 py-3 rounded-xl disabled:opacity-50 shadow-sm">
                      {loadingMore ? "Loading..." : "Explore more Startups"}
                      {!loadingMore && <ChevronDown size={16} />}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {quote && (
            <div className="mb-20 py-12 border-t border-slate-300 animate-in fade-in duration-1000">
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto px-4">
                <div className="mb-6 p-3 bg-white rounded-full shadow-sm border border-slate-100">
                  <QuoteIcon size={20} className="text-slate-400" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-700 leading-relaxed italic">"{quote.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px w-8 bg-slate-300"></div>
                  <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">{quote.author}</span>
                  <div className="h-px w-8 bg-slate-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
