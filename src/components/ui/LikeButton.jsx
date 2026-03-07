"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import axios from "axios";

export default function LikeButton({ startupId, initialLikes, initialLiked = false }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));

    setLoading(true);
    try {
      const res = await axios.post("/api/startups/like", { startupId });
      // Sync with server's authoritative count and liked state
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
  );
}