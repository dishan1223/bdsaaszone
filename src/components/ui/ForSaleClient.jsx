// this is basically the /for-sale page
// i though i would put caching but i did not. 
// so its here now
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, DollarSign, SlidersHorizontal, X } from "lucide-react";
import {CATEGORY_LABELS} from "@/constants/constants.js"
import Avatar from "@/components/ui/Avatar"


const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

// Parse price string like "৳999/mo" or "৳50000" → number, or null
function parsePrice(str) {
  if (!str) return null;
  const num = parseFloat(str.replace(/[^\d.]/g, ""));
  return isNaN(num) ? null : num;
}


function LogoSquare({ src, name }) {
  if (src) return <img src={src} alt={name} style={{ width: 38, height: 38, flexShrink: 0 }} className="rounded-lg object-cover border border-slate-200" />;
  return (
    <div style={{ width: 38, height: 38, flexShrink: 0 }} className="rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}



export default function ForSaleClient({ startups }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive which categories actually exist in the data
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
    const min = minPrice !== "" ? parseFloat(minPrice) : null;
    const max = maxPrice !== "" ? parseFloat(maxPrice) : null;
    return startups.filter((s) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(s.category)) return false;
      if (min !== null || max !== null) {
        const price = parsePrice(s.askingPrice);
        if (price === null) return false;
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
      }
      return true;
    });
  }, [startups, selectedCategories, minPrice, maxPrice]);

  const hasFilters = selectedCategories.length > 0 || minPrice !== "" || maxPrice !== "";

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const Sidebar = () => (
    <div className="flex flex-col gap-5">
      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-col gap-1">
          {availableCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="checkbox checkbox-xs rounded border-slate-300"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            </label>
          ))}
          {availableCategories.length === 0 && (
            <span className="text-xs text-slate-400">No categories</span>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Asking Price (৳)</p>
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Min</label>
            <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 focus-within:border-slate-400 overflow-hidden transition-colors">
              <span className="px-2 text-xs text-slate-400 bg-slate-100 border-r border-slate-200 py-1.5 select-none">৳</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs text-slate-700 bg-transparent outline-none w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Max</label>
            <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 focus-within:border-slate-400 overflow-hidden transition-colors">
              <span className="px-2 text-xs text-slate-400 bg-slate-100 border-r border-slate-200 py-1.5 select-none">৳</span>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs text-slate-700 bg-transparent outline-none w-full"
              />
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 mt-1">
            {[["<10k", "", "10000"], ["<50k", "", "50000"], ["<2L", "", "200000"]].map(([label, mn, mx]) => (
              <button
                key={label}
                onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  minPrice === mn && maxPrice === mx
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X size={12} /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">

      {/* Header */}
      <div className="mt-6 mb-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-3">
          <ArrowLeft size={13} /> Back to home
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">For Sale</h1>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden flex items-center gap-1.5 text-xs text-slate-600 border border-slate-300 bg-slate-50 px-3 py-1.5 rounded-lg"
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">Startups from Bangladesh looking for acquirers.</p>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="sm:hidden mb-4 p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Filters</span>
            <button onClick={() => setSidebarOpen(false)}><X size={15} className="text-slate-400" /></button>
          </div>
          <Sidebar />
        </div>
      )}

      <div className="flex gap-5 items-start">

        {/* Desktop Sidebar */}
        <aside className="hidden sm:block w-44 shrink-0 sticky top-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">Filters</span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Clear
                </button>
              )}
            </div>
            <Sidebar />
          </div>
        </aside>

        {/* Table */}
        <div className="flex-1 min-w-0 mb-10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-2 text-slate-400">
              <span className="text-2xl">🏷️</span>
              <span className="text-sm">No startups match your filters.</span>
              <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 mt-1">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="table w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-200">
                    <th className="w-8 font-medium py-2 pl-3 bg-transparent">#</th>
                    <th className="font-medium py-2 bg-transparent">Startup</th>
                    <th className="font-medium py-2 bg-transparent hidden sm:table-cell">Founder</th>
                    <th className="font-medium py-2 bg-transparent hidden sm:table-cell">Category</th>
                    <th className="font-medium py-2 bg-transparent hidden sm:table-cell">Asking Price</th>
                    <th className="font-medium py-2 pr-3 bg-transparent text-right">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((startup, idx) => (
                    <tr key={startup._id} className="border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <td className="pl-3 py-2.5 text-xs text-slate-400 font-mono w-8">{idx + 1}</td>
                      <td className="py-2.5">
                        <Link href={`/startups/${toSlug(startup.name)}`} className="flex items-center gap-2.5 group">
                          <LogoSquare src={startup.logoUrl} name={startup.name} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                              {startup.name}
                            </span>
                            {startup.description && (
                              <span className="text-xs text-slate-400">
                                {startup.description.length > 55 ? startup.description.slice(0, 55) + "..." : startup.description}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-0.5 sm:hidden flex-wrap">
                              {startup.askingPrice && (
                                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600">
                                  <DollarSign size={10} />{startup.askingPrice}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">{CATEGORY_LABELS[startup.category] ?? startup.category}</span>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-2.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar src={startup.founder?.image} name={startup.founder?.name} size={24} />
                          <span className="text-sm text-slate-600">{startup.founder?.name ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-2.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[startup.category] ?? startup.category}
                        </span>
                      </td>
                      <td className="py-2.5 hidden sm:table-cell">
                        {startup.askingPrice ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            <DollarSign size={13} className="text-blue-400" />
                            {startup.askingPrice}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Negotiable</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <Heart size={12} />
                          <span className="text-xs tabular-nums">{startup.likes}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}