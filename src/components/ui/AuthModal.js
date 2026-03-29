"use client";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-xs w-full flex flex-col items-center gap-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-1">
          <Image src="/logo.svg" alt="logo" width={18} height={18} />
          <span className="text-sm font-semibold text-slate-700">BD SaaS Zone</span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-800">Sign in to continue</h2>
          <p className="text-sm text-slate-500">
            You need to be logged in to like and comment on startups.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full mt-1">
          <Link href="/login" className="w-full">
            <button className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors">
              Sign in
            </button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}