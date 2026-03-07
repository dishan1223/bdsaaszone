import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to like a startup." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { startupId } = await req.json();

    if (!startupId) {
      return NextResponse.json({ message: "Missing startupId." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const col = db.collection("startups");

    // Check current state
    const startup = await col.findOne(
      { _id: new ObjectId(startupId) },
      { projection: { likes: 1, likedBy: 1 } }
    );

    if (!startup) {
      return NextResponse.json({ message: "Startup not found." }, { status: 404 });
    }

    const alreadyLiked = Array.isArray(startup.likedBy) && startup.likedBy.includes(userId);

    let result;
    if (alreadyLiked) {
      // Unlike — remove userId from likedBy, decrement likes (floor 0)
      result = await col.findOneAndUpdate(
        { _id: new ObjectId(startupId), likes: { $gt: 0 } },
        {
          $inc: { likes: -1 },
          $pull: { likedBy: userId },
        },
        { returnDocument: "after", projection: { likes: 1 } }
      );
    } else {
      // Like — add userId to likedBy, increment likes
      result = await col.findOneAndUpdate(
        { _id: new ObjectId(startupId) },
        {
          $inc: { likes: 1 },
          $addToSet: { likedBy: userId },
        },
        { returnDocument: "after", projection: { likes: 1 } }
      );
    }

    const newLikes = result?.likes ?? startup.likes ?? 0;
    return NextResponse.json({ likes: newLikes, liked: !alreadyLiked });
  } catch (err) {
    console.error("[POST /api/startups/like]", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}