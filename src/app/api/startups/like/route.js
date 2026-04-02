import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/createNotification";
import { invalidateStartupsCache } from "@/lib/redis"; // Import helper

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "You must be logged in to like." }, { status: 401 });
    }

    const { startupId } = await req.json();
    let oid;
    try { oid = new ObjectId(startupId); } catch {
      return NextResponse.json({ message: "Invalid startup ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const userId = session.user.id;

    const startup = await db.collection("startups").findOne({ _id: oid });
    if (!startup) return NextResponse.json({ message: "Startup not found." }, { status: 404 });

    const alreadyLiked = (startup.likedBy ?? []).includes(userId);

    if (alreadyLiked) {
      await db.collection("startups").updateOne(
        { _id: oid },
        { $inc: { likes: -1 }, $pull: { likedBy: userId } }
      );
      
      // Invalidate cache because like counts/positions changed
      await invalidateStartupsCache();

      return NextResponse.json({ liked: false, likes: Math.max(0, (startup.likes ?? 1) - 1) });
    } else {
      await db.collection("startups").updateOne(
        { _id: oid },
        { $inc: { likes: 1 }, $addToSet: { likedBy: userId } }
      );

      // Fire-and-forget notification
      createNotification({
        founderId: startup.userId,
        actorId: userId,
        actorName: session.user.name,
        actorImage: session.user.image ?? null,
        type: "like",
        startupId: startupId,
        startupName: startup.name,
        startupSlug: toSlug(startup.name),
      });

      // Invalidate cache
      await invalidateStartupsCache();

      return NextResponse.json({ liked: true, likes: (startup.likes ?? 0) + 1 });
    }
  } catch (err) {
    console.error("[POST /api/startups/like]", err);
    return NextResponse.json({ message: "Failed to update like." }, { status: 500 });
  }
}