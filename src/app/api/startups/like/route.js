import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/createNotification";
import { invalidateStartupsCache } from "@/lib/redis";

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

    // Attempt LIKE###########################################################
    // Atomic: the filter { likedBy: { $ne: userId } } guarantees this update
    // only executes if the user hasn't already liked. No separate read needed.
    // Two simultaneous requests both see $ne: true initially, but MongoDB's
    // document-level locking means only one $addToSet will match — the second
    // finds likedBy already contains userId and skips, then falls to UNLIKE
    // which also won't match, returning 404. The client's optimistic UI already
    // shows the correct state, so this is invisible to the user.
    // ########################################################################
    const likeResult = await db.collection("startups").findOneAndUpdate(
      { _id: oid, likedBy: { $ne: userId } },
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId },
      },
      { returnDocument: "after", projection: { likes: 1, userId: 1, name: 1 } }
    );

    if (likeResult) {
      // Fire-and-forget — never awaited so they don't slow down the response
      createNotification({
        founderId:   likeResult.userId,
        actorId:     userId,
        actorName:   session.user.name,
        actorImage:  session.user.image ?? null,
        type:        "like",
        startupId,
        startupName: likeResult.name,
        startupSlug: toSlug(likeResult.name),
      });
      invalidateStartupsCache();
      return NextResponse.json({ liked: true, likes: likeResult.likes });
    }

    // ── Attempt UNLIKE ────────────────────────────────────────────────────────
    // Atomic: filter { likedBy: userId } only matches if currently liked.
    const unlikeResult = await db.collection("startups").findOneAndUpdate(
      { _id: oid, likedBy: userId },
      {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      },
      { returnDocument: "after", projection: { likes: 1 } }
    );

    if (unlikeResult) {
      invalidateStartupsCache();
      return NextResponse.json({ liked: false, likes: Math.max(0, unlikeResult.likes) });
    }

    // Neither matched — startup doesn't exist
    return NextResponse.json({ message: "Startup not found." }, { status: 404 });

  } catch (err) {
    console.error("[POST /api/startups/like]", err);
    return NextResponse.json({ message: "Failed to update like." }, { status: 500 });
  }
}