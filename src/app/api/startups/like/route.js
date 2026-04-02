import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/createNotification";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to like." },
        { status: 401 }
      );
    }

    const { startupId } = await req.json();

    let oid;
    try {
      oid = new ObjectId(startupId);
    } catch {
      return NextResponse.json(
        { message: "Invalid startup ID." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const userId = session.user.id;

    // STEP 1: Try unlike first (atomic)
    const unlikeResult = await db.collection("startups").findOneAndUpdate(
      {
        _id: oid,
        likedBy: userId,
      },
      {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      },
      {
        returnDocument: "after",
      }
    );

    if (unlikeResult.value) {
      return NextResponse.json({
        liked: false,
        likes: unlikeResult.value.likes,
      });
    }

    // STEP 2: Try like atomically only if not already liked
    const likeResult = await db.collection("startups").findOneAndUpdate(
      {
        _id: oid,
        likedBy: { $ne: userId },
      },
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId },
      },
      {
        returnDocument: "after",
      }
    );

    if (!likeResult.value) {
      return NextResponse.json(
        { message: "Startup not found." },
        { status: 404 }
      );
    }

    // notification
    createNotification({
      founderId: likeResult.value.userId,
      actorId: userId,
      actorName: session.user.name,
      actorImage: session.user.image ?? null,
      type: "like",
      startupId,
      startupName: likeResult.value.name,
      startupSlug: toSlug(likeResult.value.name),
    });

    return NextResponse.json({
      liked: true,
      likes: likeResult.value.likes,
    });
  } catch (err) {
    console.error("[POST /api/startups/like]", err);
    return NextResponse.json(
      { message: "Failed to update like." },
      { status: 500 }
    );
  }
}