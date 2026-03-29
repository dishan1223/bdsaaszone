"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import { authClient } from "@/lib/auth-client";
import AuthModal from "@/components/ui/AuthModal";

export default function LikeButton({ startupId, initialLikes, initialLiked = false }) {
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLike = async () => {
    // Not logged in — show auth modal instead
    if (!user) { setShowAuthModal(true); return; }
    if (loading) return;

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));
    setLoading(true);

    try {
      const res = await axios.post("/api/startups/like", { startupId });
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch {
      // Rollback on failure
      setLiked(!newLiked);
      setLikes((prev) => prev + (newLiked ? -1 : 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-150 ${
          liked
            ? "bg-red-50 border-red-200 text-red-500"
            : "bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400 hover:bg-red-50"
        } ${loading ? "opacity-70" : "cursor-pointer"}`}
      >
        <Heart
          size={15}
          className="transition-all duration-150"
          style={{ fill: liked ? "#ef4444" : "none", color: liked ? "#ef4444" : "currentColor" }}
        />
        <span className="text-sm tabular-nums font-medium">{likes}</span>
      </button>
    </>
  );
}