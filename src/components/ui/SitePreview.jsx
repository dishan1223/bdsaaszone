"use client";
// src/components/ui/SitePreview.jsx
import { useState, useRef, useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";

export default function SitePreview({ url, name }) {
  const [failed, setFailed] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [displayH, setDisplayH] = useState(420);

  const IFRAME_W = 1920;
  const IFRAME_H = 1080;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth;
        const newScale = containerW / IFRAME_W;

        setScale(newScale);

        // Maintain aspect ratio (16:9) and cap at 420px
        const scaledHeight = IFRAME_H * newScale;
        setDisplayH(Math.min(420, scaledHeight));
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (failed) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 py-14">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Globe size={18} className="text-slate-400" />
        </div>
        <p className="text-sm text-slate-400">
          This site doesn't allow previews.
        </p>
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

  return (
    <div className="flex flex-col gap-2">
      {/* Container — clips the scaled iframe */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100"
        style={{ height: displayH }}
      >
        {/* Transparent overlay — blocks all mouse interaction */}
        <div className="absolute inset-0 z-10" />

        {/* Scaled iframe */}
        <div
          style={{
            width: IFRAME_W,
            height: IFRAME_H,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <iframe
            src={url}
            title={`${name} preview`}
            width={IFRAME_W}
            height={IFRAME_H}
            scrolling="no"
            onError={() => setFailed(true)}
            style={{
              width: IFRAME_W,
              height: IFRAME_H,
              border: "none",
              pointerEvents: "none",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400 truncate max-w-[70%]">
          {url}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors shrink-0"
        >
          Open site <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}