"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Users, SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { CATEGORY_LABELS } from "@/constants/constants.js";
import Avatar from "@/components/ui/Avatar";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

function LogoSquare({ src, name }) {
  if (src) return <img src={src} alt={name} style={{ width: 40, height: 40, flexShrink: 0 }} className="rounded-xl object-cover border border-slate-200" />;
  return (
    <div style={{ width: 40, height: 40, flexShrink: 0 }} className="rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function CoFoundersClient({ startups }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const availableCategories = useMemo(() => {
    const cats = [...new Set(startups.map((s) => s.category).filter(Boolean))];
    return cats.sort();
  }, [startups]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(s.category)) return false;
      return true;
    });
  }, [startups, selectedCategories]);

  const hasFilters = selectedCategories.length > 0;

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  const Sidebar = () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</p>
        <div className="flex flex-col gap-2">
          {availableCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="checkbox checkbox-xs rounded border-slate-300 transition-all checked:bg-emerald-500 checked:border-emerald-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            </label>
          ))}
          {availableCategories.length === 0 && (
            <span className="text-xs text-slate-400">No categories found</span>
          )}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-tight"
        >
          <X size={12} strokeWidth={3} /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Section */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <Users size={24} className="text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seeking Co-founders</h1>
            </div>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Connect with visionary founders in Bangladesh looking for partners to build the next big thing.
            </p>
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden flex items-center justify-center gap-2 w-full text-sm font-bold text-slate-700 border-2 border-slate-200 bg-white px-4 py-3 rounded-xl hover:bg-slate-50 transition-all"
          >
            <SlidersHorizontal size={16} />
            Filters {hasFilters && `(${selectedCategories.length})`}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="hidden sm:block w-56 shrink-0 sticky top-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Sidebar />
          </div>
          
          <div className="mt-6 p-6 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
            <h3 className="text-sm font-bold mb-2">Are you a founder?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Add your startup and mark "Seeking Co-founder" to appear here.</p>
            <Link href="/new" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Get Started <ChevronRight size={14} />
            </Link>
          </div>
        </aside>

        {/* Mobile Filter Overlay */}
        {sidebarOpen && (
          <div className="sm:hidden mb-6 p-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Filters</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <Sidebar />
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No founders found</h3>
              <p className="text-sm text-slate-500 max-w-xs">Try adjusting your filters or check back later for new opportunities.</p>
              <button onClick={clearFilters} className="mt-6 text-sm font-bold text-emerald-600 hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((startup) => (
                <Link key={startup._id} href={`/startups/${toSlug(startup.name)}`} className="group">
                  <div className="h-full flex flex-col p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <LogoSquare src={startup.logoUrl} name={startup.name} />
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">{startup.name}</h3>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                            {CATEGORY_LABELS[startup.category] ?? startup.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Heart size={12} />
                        <span className="text-xs font-bold tabular-nums">{startup.likes}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed flex-1">
                      {startup.description}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={startup.founder?.image} name={startup.founder?.name} size={28} />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-0.5">Founder</span>
                          <span className="text-xs font-bold text-slate-700">{startup.founder?.name ?? "Anonymous"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        View Details <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
