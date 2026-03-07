// src/app/api/startups/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const startups = await db
      .collection("startups")
      .find({})
      .sort({ likes: -1 })
      .toArray();

    if (startups.length === 0) {
      return NextResponse.json({ startups: [] });
    }

    // userId is stored as a plain ObjectId hex string e.g. "69a983e26b63c417122dbf98"
    // Convert to ObjectId[] and query _id in the user collection
    const uniqueUserIds = [
      ...new Set(startups.map((s) => s.userId).filter(Boolean)),
    ];

    const objectIds = uniqueUserIds.flatMap((uid) => {
      try { return [new ObjectId(uid)]; }
      catch { return []; }
    });

    const users =
      objectIds.length > 0
        ? await db
            .collection("user")
            .find({ _id: { $in: objectIds } })
            .project({ _id: 1, name: 1, image: 1 })
            .toArray()
        : [];

    // Map hex string → user
    const userMap = {};
    for (const u of users) {
      userMap[u._id.toString()] = { name: u.name, image: u.image ?? null };
    }

    const enriched = startups.map((s) => ({
      ...s,
      _id: s._id.toString(),
      likes: s.likes ?? 0,
      founder: userMap[s.userId] ?? null,
    }));
    

    return NextResponse.json({ startups: enriched });
  } catch (err) {
    console.error("[GET /api/startups]", err);
    return NextResponse.json(
      { message: "Failed to fetch startups." },
      { status: 500 }
    );
  }
}