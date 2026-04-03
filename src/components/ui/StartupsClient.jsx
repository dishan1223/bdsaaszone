"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Heart, Search, SlidersHorizontal, X, 
  ChevronRight, LayoutGrid, List as ListIcon, 
  TrendingUp, Calendar, Filter
} from "lucide-react";
import { CATEGORY_LABELS, PRODUCT_TYPE_LABELS } from "@/constants/constants.js";
import Avatar from "@/components/ui/Avatar";
import { RankBadgeSmall } from "@/components/ui/RankBadge";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

function LogoSquare({ src, name, size = 48 }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-xl object-cover border border-slate-200 shrink-0" />;
  return (
    <div style={{ width: size, height: size }} className="rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-400 shrink-0">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function StartupsClient({ initialStartups }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [productType, setProductType] = useState("all");
  const [sortBy, setSortBy] = useState("likes"); // likes, newest, name
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = initialStartups.filter((s) => {
      const matchesSearch = 
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.founder?.name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = category === "all" || s.category === category;
      const matchesType = productType === "all" || s.productType === productType;
      
      return matchesSearch && matchesCategory && matchesType;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [initialStartups, search, category, productType, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setProductType("all");
    setSortBy("likes");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">The Directory</h1>
              <p className="text-slate-500 font-medium text-lg">Exploring all {initialStartups.length} startups listed in our database.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <ListIcon size={18} />
                </button>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700"
              >
                <Filter size={18} /> Filters
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by startup name, founder, or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-800 shadow-sm"
            />
          </div>
          
          <div className="md:col-span-7 flex flex-wrap items-center gap-3">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 min-w-[140px] px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <select 
              value={productType} 
              onChange={(e) => setProductType(e.target.value)}
              className="flex-1 min-w-[140px] px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {Object.entries(PRODUCT_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 min-w-[140px] px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors shadow-sm appearance-none cursor-pointer"
            >
              <option value="likes">Most Liked</option>
              <option value="newest">Newest First</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filteredAndSorted.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No startups found</h2>
            <p className="text-slate-500 max-w-sm mb-8 font-medium">We couldn't find any startups matching your current filters. Try a different search term or category.</p>
            <button 
              onClick={clearFilters}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-4"
          }>
            {filteredAndSorted.map((startup) => (
              <Link 
                key={startup._id} 
                href={`/startups/${toSlug(startup.name)}`}
                className="group"
              >
                {viewMode === "grid" ? (
                  <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <LogoSquare src={startup.logoUrl} name={startup.name} />
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <Heart size={14} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                        <span className="text-xs font-bold text-slate-600 tabular-nums">{startup.likes || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">{startup.name}</h3>
                        {startup.currentRank && <RankBadgeSmall rank={startup.currentRank} />}
                      </div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{CATEGORY_LABELS[startup.category] || startup.category}</span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed flex-1">
                      {startup.description}
                    </p>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Avatar src={startup.founder?.image} name={startup.founder?.name} size={28} />
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{startup.founder?.name || "Founder"}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-500 hover:shadow-lg transition-all duration-300">
                    <LogoSquare src={startup.logoUrl} name={startup.name} size={56} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors truncate">{startup.name}</h3>
                        {startup.currentRank && <RankBadgeSmall rank={startup.currentRank} />}
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">{CATEGORY_LABELS[startup.category] || startup.category}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{startup.description}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={startup.founder?.image} name={startup.founder?.name} size={32} />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Founder</span>
                          <span className="text-xs font-bold text-slate-700">{startup.founder?.name || "Founder"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-[60px]">
                        <div className="flex items-center gap-1.5 text-red-500 mb-0.5">
                          <Heart size={14} fill="currentColor" />
                          <span className="text-sm font-black tabular-nums">{startup.likes || 0}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Likes</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all pr-2" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
