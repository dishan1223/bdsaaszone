// src/components/ui/RankBadge.jsx
"use client";

const RANK_META = {
  1: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", medal: "#F59E0B", label: "1st" },
  2: { bg: "#F1F5F9", border: "#94A3B8", text: "#1E293B", medal: "#94A3B8", label: "2nd" },
  3: { bg: "#FDF6EC", border: "#CD7F32", text: "#7C2D12", medal: "#CD7F32", label: "3rd" },
};

function MedalSVG({ color, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="10" r="5.5" fill={color} opacity="0.2" />
      <circle cx="8" cy="10" r="5.5" stroke={color} strokeWidth="1.2" />
      <path d="M5.5 5.5L3.5 1.5H6.5L8 4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 5.5L12.5 1.5H9.5L8 4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 7.2L8.5 8.9H10.3L8.9 9.9L9.4 11.6L8 10.6L6.6 11.6L7.1 9.9L5.7 8.9H7.5L8 7.2Z" fill={color} />
    </svg>
  );
}

// ── Small inline badge — for table rows and mobile cards ──────────────────────
export function RankBadgeSmall({ rank }) {
  const c = RANK_META[rank];
  if (!c) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: "10px", fontWeight: 600, padding: "2px 7px",
      borderRadius: "999px", whiteSpace: "nowrap", flexShrink: 0,
    }}>
      <MedalSVG color={c.medal} size={10} />
      {c.label} on BD SaaS Zone
    </span>
  );
}

// ── Large shareable badge — for startup detail page header ────────────────────
export function RankBadgeLarge({ rank }) {
  const c = RANK_META[rank];
  if (!c) return null;
  const ordinal = rank === 1 ? "1st place" : rank === 2 ? "2nd place" : "3rd place";
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "5px",
      padding: "12px 18px", background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: "14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <MedalSVG color={c.medal} size={20} />
        <span style={{ fontSize: "14px", fontWeight: 700, color: c.text, letterSpacing: "-0.01em" }}>
          {ordinal}
        </span>
      </div>
      <span style={{ fontSize: "10px", color: c.text, opacity: 0.7, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
        on BD SaaS Zone
      </span>
    </div>
  );
}

// ── Rank history pills — "Ranked 1st × 3  2nd × 1" ───────────────────────────
export function RankHistory({ timesRanked }) {
  if (!timesRanked) return null;
  const { first = 0, second = 0, third = 0 } = timesRanked;
  if (!first && !second && !third) return null;

  const items = [
    { rank: 1, count: first,  label: "1st" },
    { rank: 2, count: second, label: "2nd" },
    { rank: 3, count: third,  label: "3rd" },
  ].filter((i) => i.count > 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400">Ranked:</span>
      {items.map(({ rank, count, label }) => {
        const c = RANK_META[rank];
        return (
          <span key={rank} style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: c.bg, border: `1px solid ${c.border}`, color: c.text,
            fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
          }}>
            <MedalSVG color={c.medal} size={9} />
            {label} × {count}
          </span>
        );
      })}
    </div>
  );
}