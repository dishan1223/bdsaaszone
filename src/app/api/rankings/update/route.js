// src/app/api/rankings/update/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId at top
import { invalidateStartupsCache } from "@/lib/redis"; // Import cache helper

export async function GET(req) {
  // Simple secret check — add CRON_SECRET=some_long_random_string to .env
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    // 1. Get top 3 startups by likes
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

    // 2. Fetch the previous snapshot to detect changes
    const prevSnapshot = await db.collection("rankings").findOne({ type: "daily_top3" });
    const prevRankMap = {};
    if (prevSnapshot?.top3) {
      prevSnapshot.top3.forEach((s) => { prevRankMap[s.startupId] = s.rank; });
    }

    // 3. Upsert the current snapshot
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

    // 4. Update timesRanked on each startup
    for (const [startupId, rank] of Object.entries(rankMap)) {
      const fieldKey = rank === 1 ? "timesRanked.first"
                     : rank === 2 ? "timesRanked.second"
                     :              "timesRanked.third";

      if (prevRankMap[startupId] !== rank) {
        await db.collection("startups").updateOne(
          { _id: new ObjectId(startupId) }, // Cleaner ObjectId usage
          { $inc: { [fieldKey]: 1 } }
        );
      }
    }

    // 5. Update currentRank on startups (Clear all, then set top 3)
    await db.collection("startups").updateMany({}, { $unset: { currentRank: "" } });
    
    const bulkOps = top3.map((s, i) => ({
      updateOne: {
        filter: { _id: s._id },
        update: { $set: { currentRank: i + 1 } }
      }
    }));
    
    if (bulkOps.length > 0) {
      await db.collection("startups").bulkWrite(bulkOps);
    }

    // ── 6. Clear Redis Cache ─────────────────────────────
    // This ensures the new ranks appear immediately on the homepage
    await invalidateStartupsCache();

    return NextResponse.json({
      ok: true,
      message: "Rankings updated and cache cleared.",
      top3: top3.map((s, i) => ({ name: s.name, rank: i + 1, likes: s.likes })),
    });
  } catch (err) {
    console.error("[GET /api/rankings/update]", err);
    return NextResponse.json({ message: "Failed to update rankings." }, { status: 500 });
  }
}