"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { ArrowLeft, Rocket, Check, X, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const ADMIN_EMAIL = "dishanishtiaq45@gmail.com";

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) {
      fetchStartups();
    }
  }, [session]);

  const fetchStartups = async () => {
    try {
      const res = await axios.get("/api/admin/advertise");
      setStartups(res.data.startups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdvertise = async (startupId, currentStatus) => {
    try {
      await axios.post("/api/admin/advertise", {
        startupId,
        advertise: !currentStatus
      });
      fetchStartups();
    } catch (err) {
      alert("Failed to update advertisement status");
    }
  };

  if (isPending) return <div className="p-10 text-center">Checking session...</div>;
  if (session?.user?.email !== ADMIN_EMAIL) return notFound();

  const filtered = startups.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage advertisements and promoted SaaS.</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
          <Rocket size={24} className="text-blue-600" />
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search startups to advertise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Startup</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Advertised Until</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400">Loading startups...</td></tr>
            ) : filtered.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {s.logoUrl && <img src={s.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {s.isAdvertised ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                      <Check size={12} /> Promoted
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 tracking-tight uppercase">Regular</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                  {s.advertisedUntil ? new Date(s.advertisedUntil).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleAdvertise(s._id, s.isAdvertised)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      s.isAdvertised 
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"
                    }`}
                  >
                    {s.isAdvertised ? "Stop Ads" : "Start Ads"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
