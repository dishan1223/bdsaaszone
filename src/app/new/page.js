"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Plus, Trash2, ArrowLeft, X, Users } from "lucide-react";
import axios from "axios";
import SuccessToast from "@/components/ui/SuccessToast";
import {CATEGORIES, TECH_ICONS,PRODUCT_TYPES, TechIcon, ALL_TECH_STACKS} from "@/constants/constants.js";




function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${enabled ? "bg-slate-900" : "bg-slate-300"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ── Currency input: ৳ prefix shown visually, free text allowed (e.g. 999/mo) ──
function CurrencyInput({ value, onChange, placeholder = "999/mo", required = false }) {
  return (
    <div className="flex items-center rounded-lg bg-slate-50 border border-slate-300 focus-within:border-slate-500 transition-colors overflow-hidden">
      <span className="px-3 py-2.5 text-sm text-slate-500 bg-slate-100 border-r border-slate-300 select-none font-medium">
        ৳
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
      />
    </div>
  );
}

function TechStackInput({ selected, onChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return; }
    const q = input.toLowerCase();
    const matches = ALL_TECH_STACKS.filter(
      (t) => t.toLowerCase().includes(q) && !selected.includes(t)
    ).slice(0, 8);
    setSuggestions(matches);
    setHighlightIdx(0);
  }, [input, selected]);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTech = (tech) => {
    if (!tech || selected.includes(tech)) return;
    onChange([...selected, tech]);
    setInput("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeTech = (tech) => onChange(selected.filter((t) => t !== tech));

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) addTech(suggestions[highlightIdx]);
      else if (input.trim()) addTech(input.trim());
    }
    else if (e.key === "Backspace" && !input && selected.length > 0) onChange(selected.slice(0, -1));
    else if (e.key === "Escape") setSuggestions([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-300 focus-within:border-slate-500 transition-colors min-h-[44px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((tech) => (
          <span key={tech} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
            <TechIcon name={tech} size={13} />
            {tech}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTech(tech); }} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "e.g. React, Node.js, PostgreSQL..." : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 py-0.5 px-1"
        />
      </div>
      {suggestions.length > 0 && (
        <div ref={dropdownRef} className="relative z-50">
          <div className="absolute top-0 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTech(s); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${i === highlightIdx ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <TechIcon name={s} size={15} />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400">Type to search, press Enter or select to add.</p>
    </div>
  );
}

export default function NewStartupPage() {
  const [form, setForm] = useState({ name: "", url: "", productType: "", category: "", description: "" });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [subscriptions, setSubscriptions] = useState([{ plan: "", price: "" }]);
  const [techStack, setTechStack] = useState([]);
  const [forSale, setForSale] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const [seekingCofounder, setSeekingCofounder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubChange = (index, field, value) => {
    // For price field: only allow digits and dot
    setSubscriptions(subscriptions.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleForSaleToggle = () => {
    if (seekingCofounder) return;
    setForSale(!forSale);
    setAskingPrice("");
  };

  const handleSeekingCofounderToggle = () => {
    const next = !seekingCofounder;
    setSeekingCofounder(next);
    if (next) { setForSale(false); setAskingPrice(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("url", form.url);
      formData.append("productType", form.productType);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (logo) formData.append("logo", logo);
      // Store prices with ৳ prefix in DB
      const subsWithCurrency = subscriptions
        .filter(s => s.plan || s.price)
        .map(s => ({ plan: s.plan, price: s.price ? `৳${s.price}` : "" }));
      formData.append("subscriptions", JSON.stringify(subsWithCurrency));
      formData.append("techStack", JSON.stringify(techStack));
      formData.append("forSale", forSale);
      if (forSale && askingPrice) formData.append("askingPrice", `৳${askingPrice}`);
      formData.append("seekingCofounder", seekingCofounder);

      await axios.post("/api/startups/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {success && <SuccessToast message="Startup submitted!" onClose={() => setSuccess(false)} />}

      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 w-fit">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to home</span>
        </Link>
        <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
          <Image src="/logo.svg" alt="logo" width={16} height={16} />
          BD SaaS Zone
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Add your Startup</h1>
        <p className="text-slate-500 mt-2">List your SaaS product for the Bangladeshi community to discover.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Startup Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Startup Name <span className="text-red-500">*</span></label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. ShopGuru"
            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800" />
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Website URL <span className="text-red-500">*</span></label>
          <input type="url" name="url" value={form.url} onChange={handleChange} required placeholder="https://yourproduct.com"
            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800" />
        </div>

        {/* Logo Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Startup Logo</label>
          {logoPreview ? (
            <div className="flex items-center gap-4">
              <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
              <button type="button" onClick={removeLogo} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors">
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setLogo(file);
                  setLogoPreview(URL.createObjectURL(file));
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all">
              <Upload size={20} color="#94a3b8" />
              <span className="text-sm text-slate-400">Click or drag to upload logo</span>
              <span className="text-xs text-slate-400">PNG, JPG, SVG up to 2MB</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
        </div>

        {/* Product Type & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Product Type <span className="text-red-500">*</span></label>
            <select name="productType" value={form.productType} onChange={handleChange} required
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800">
              <option value="" disabled>Select type</option>
              {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800">
              <option value="" disabled>Select category</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
            placeholder="Tell us what your product does, who it's for, and what makes it unique..."
            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800 resize-none" />
        </div>

        {/* Tech Stack */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Tech Stack</label>
          <TechStackInput selected={techStack} onChange={setTechStack} />
        </div>

        {/* Subscription Plans */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Subscription Plans</label>
            <button type="button" onClick={() => setSubscriptions([...subscriptions, { plan: "", price: "" }])}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 transition-colors">
              <Plus size={14} /> Add plan
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {subscriptions.map((sub, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="text" placeholder="Plan name (e.g. Pro)" value={sub.plan}
                  onChange={(e) => handleSubChange(index, "plan", e.target.value)}
                  className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800 text-sm" />
                {/* Price with ৳ prefix */}
                <div className="flex-1 flex items-center rounded-lg bg-slate-50 border border-slate-300 focus-within:border-slate-500 transition-colors overflow-hidden">
                  <span className="px-2.5 py-2.5 text-sm text-slate-500 bg-slate-100 border-r border-slate-300 select-none">৳</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="999"
                    value={sub.price}
                    onChange={(e) => handleSubChange(index, "price", e.target.value)}
                    className="flex-1 px-2.5 py-2.5 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
                {subscriptions.length > 1 && (
                  <button type="button" onClick={() => setSubscriptions(subscriptions.filter((_, i) => i !== index))}
                    className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Leave empty if not applicable.</p>
        </div>

        {/* Seeking Co-founder */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <Users size={15} className="text-slate-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-700">Seeking Co-founder</span>
                <span className="text-xs text-slate-400">Let others know you're looking for a co-founder to join you.</span>
              </div>
            </div>
            <Toggle enabled={seekingCofounder} onToggle={handleSeekingCofounderToggle} />
          </div>
        </div>

        {/* For Sale */}
        <div className="flex flex-col gap-3">
          <div className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${seekingCofounder ? "bg-slate-50 border-slate-200 opacity-50" : "bg-slate-50 border-slate-300"}`}>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-700">List for Sale</span>
              <span className="text-xs text-slate-400">
                {seekingCofounder ? "Cannot list for sale while seeking a co-founder." : "Let potential buyers know this startup is available for acquisition."}
              </span>
            </div>
            <Toggle enabled={forSale} onToggle={handleForSaleToggle} />
          </div>

          {forSale && !seekingCofounder && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Asking Price <span className="text-red-500">*</span></label>
              <CurrencyInput value={askingPrice} onChange={setAskingPrice} placeholder="5,00,000" required={forSale} />
              <p className="text-xs text-slate-400">Enter your desired sale price. Buyers may negotiate.</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="btn bg-slate-900 text-slate-50 border-none rounded-lg w-full disabled:opacity-60">
          {loading ? "Submitting..." : "Submit Startup"}
        </button>
      </form>
    </div>
  );
}