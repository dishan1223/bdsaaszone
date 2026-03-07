"use client";
// src/components/SuccessToast.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, X } from "lucide-react";

export default function SuccessToast({ message = "Startup submitted!", onClose }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onClose?.(), 350);
  };

  const goHome = () => {
    router.push("/");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        transition: "all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: visible && !leaving ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
      }}
    >
      <div
        style={{
          background: "#0f172a",
          borderRadius: "16px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
          minWidth: "320px",
          maxWidth: "420px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(34,197,94,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" strokeWidth={2.5} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>
            {message}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>
            Your startup is now listed on BD SaaS Zone.
          </div>
        </div>

        {/* Go Home button */}
        <button
          onClick={goHome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "12px",
            fontWeight: 500,
            padding: "6px 10px",
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "background 150ms",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#334155"}
          onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
        >
          View all <ArrowRight size={12} />
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#475569",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            transition: "color 150ms",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
          onMouseLeave={e => e.currentTarget.style.color = "#475569"}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}