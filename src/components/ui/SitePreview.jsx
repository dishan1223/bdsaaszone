"use client";
// src/components/ui/SitePreview.jsx
import { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

export default function SitePreview({ url, name }) {
  const [mode, setMode] = useState("screenshot"); // "screenshot" | "iframe" | "failed"
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;

  if (mode === "failed") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 py-14">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Globe size={18} className="text-slate-400" />
        </div>
        <p className="text-sm text-slate-400">Preview not available for this site.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          Visit {name} <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  if (mode === "iframe") {
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <span className="text-sm text-slate-400">Loading preview...</span>
          </div>
        )}
        <iframe
          src={url}
          title={`${name} preview`}
          className="w-full"
          style={{ height: 480, border: "none" }}
          onLoad={() => setIframeLoaded(true)}
          onError={() => setMode("failed")}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-400 truncate">{url}</span>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 shrink-0 ml-2 transition-colors">
            Open <ExternalLink size={11} />
          </a>
        </div>
      </div>
    );
  }

  // Default: screenshot mode
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt={`${name} screenshot`}
          className="w-full h-auto object-cover object-top"
          style={{ minHeight: 200 }}
          onError={() => setMode("failed")}
        />
        {/* Overlay with visit button on hover */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-md hover:bg-slate-50 transition-colors"
          >
            Visit site <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Switch to live preview */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400">Static screenshot via Microlink</span>
        <button
          onClick={() => setMode("iframe")}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors underline underline-offset-2"
        >
          Try live preview →
        </button>
      </div>
    </div>
  );
}