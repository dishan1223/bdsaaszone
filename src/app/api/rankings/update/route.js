// src/app/api/rankings/update/route.js
// Call this once daily via a cron job (e.g. Vercel Cron, GitHub Actions, or upstash).
// Endpoint: POST /api/rankings/update
// Protect with CRON_SECRET env var.

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  // Simple secret check — add CRON_SECRET=some_long_random_string to .env
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    // Get top 3 startups by likes
    const top3 = await db
      .collection("startups")
      .find({})
      .sort({ likes: -1 })
      .limit(3)
      .project({ _id: 1, name: 1, likes: 1 })
      .toArray();

    const now = new Date();
    const rankMap = {}; // startupId → rank (1/2/3)
    top3.forEach((s, i) => { rankMap[s._id.toString()] = i + 1; });

    // Fetch the previous snapshot to detect changes
    const prevSnapshot = await db.collection("rankings").findOne({ type: "daily_top3" });
    const prevRankMap = {};
    if (prevSnapshot?.top3) {
      prevSnapshot.top3.forEach((s) => { prevRankMap[s.startupId] = s.rank; });
    }

    // Upsert the current snapshot
    await db.collection("rankings").updateOne(
      { type: "daily_top3" },
      {
        $set: {
          type: "daily_top3",
          top3: top3.map((s, i) => ({
            startupId: s._id.toString(),
            name: s.name,
            likes: s.likes,
            rank: i + 1,
          })),
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    // Update timesRanked on each startup that is newly in top 3
    // (only increment if the startup wasn't already at this rank in the previous snapshot)
    for (const [startupId, rank] of Object.entries(rankMap)) {
      const fieldKey = rank === 1 ? "timesRanked.first"
                     : rank === 2 ? "timesRanked.second"
                     :              "timesRanked.third";

      // Only increment if it's a new entry or rank changed
      if (prevRankMap[startupId] !== rank) {
        await db.collection("startups").updateOne(
          { _id: (await import("mongodb")).ObjectId.createFromHexString(startupId) },
          { $inc: { [fieldKey]: 1 } }
        );
      }
    }

    // Also store rank on the startup document for fast reads
    // Clear rank from all startups first, then set for top 3
    await db.collection("startups").updateMany({}, { $unset: { currentRank: "" } });
    for (const [startupId, rank] of Object.entries(rankMap)) {
      await db.collection("startups").updateOne(
        { _id: (await import("mongodb")).ObjectId.createFromHexString(startupId) },
        { $set: { currentRank: rank } }
      );
    }

    return NextResponse.json({
      ok: true,
      top3: top3.map((s, i) => ({ name: s.name, rank: i + 1, likes: s.likes })),
    });
  } catch (err) {
    console.error("[POST /api/rankings/update]", err);
    return NextResponse.json({ message: "Failed to update rankings." }, { status: 500 });
  }
}