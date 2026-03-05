"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Plus, Trash2, ArrowLeft, X } from "lucide-react";
import axios from "axios";

// ✏️ Edit categories here anytime
const CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "productivity", label: "Productivity" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR & Recruitment" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "developer-tools", label: "Developer Tools" },
  { value: "analytics", label: "Analytics" },
  { value: "communication", label: "Communication" },
  { value: "design", label: "Design" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const PRODUCT_TYPES = [
  { value: "free", label: "Free" },
  { value: "subscription", label: "Subscription Based" },
  { value: "one_time", label: "One Time Purchase" },
];

export default function NewStartupPage() {
  const [form, setForm] = useState({
    name: "",
    url: "",
    productType: "",
    category: "",
    description: "",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [subscriptions, setSubscriptions] = useState([{ plan: "", price: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    const updated = subscriptions.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    setSubscriptions(updated);
  };

  const addSubscription = () => {
    setSubscriptions([...subscriptions, { plan: "", price: "" }]);
  };

  const removeSubscription = (index) => {
    setSubscriptions(subscriptions.filter((_, i) => i !== index));
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
      formData.append("subscriptions", JSON.stringify(subscriptions.filter(s => s.plan || s.price)));

      await axios.post("/api/v1/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-5xl">🎉</div>
        <div className="text-2xl font-bold text-slate-800">Startup submitted!</div>
        <div className="text-slate-500">Your startup has been added successfully.</div>
        <Link href="/">
          <button className="btn bg-slate-900 text-slate-50 border-none rounded-lg mt-2">
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
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
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. ShopGuru"
            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800"
          />
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Website URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            required
            placeholder="https://yourproduct.com"
            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800"
          />
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
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all"
            >
              <Upload size={20} color="#94a3b8" />
              <span className="text-sm text-slate-400">Click to upload logo</span>
              <span className="text-xs text-slate-400">PNG, JPG, SVG up to 2MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>

        {/* Product Type & Category — side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Product Type <span className="text-red-500">*</span></label>
            <select
              name="productType"
              value={form.productType}
              onChange={handleChange}
              required
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800"
            >
              <option value="" disabled>Select type</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800"
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Tell us what your product does, who it's for, and what makes it unique..."
            className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800 resize-none"
          />
        </div>

        {/* Subscription Plans */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Subscription Plans</label>
            <button
              type="button"
              onClick={addSubscription}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Plus size={14} /> Add plan
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {subscriptions.map((sub, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Plan name (e.g. Pro)"
                  value={sub.plan}
                  onChange={(e) => handleSubChange(index, "plan", e.target.value)}
                  className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800 text-sm"
                />
                <input
                  type="text"
                  placeholder="Price (e.g. ৳999/mo)"
                  value={sub.price}
                  onChange={(e) => handleSubChange(index, "price", e.target.value)}
                  className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-300 outline-none focus:border-slate-500 transition-colors text-slate-800 text-sm"
                />
                {subscriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubscription(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Leave empty if not applicable.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn bg-slate-900 text-slate-50 border-none rounded-lg w-full disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Startup"}
        </button>
      </form>
    </div>
  );
}