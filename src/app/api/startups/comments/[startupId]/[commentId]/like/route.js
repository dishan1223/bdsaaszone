import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to like a comment." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { startupId, commentId } = await params;

    if (!startupId || !commentId) {
      return NextResponse.json(
        { message: "Missing startupId or commentId." },
        { status: 400 }
      );
    }

    let commentOid, startupOid;
    try {
      commentOid = new ObjectId(commentId);
      startupOid = new ObjectId(startupId);
    } catch {
      return NextResponse.json(
        { message: "Invalid startup or comment ID." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const col = db.collection("comments");

    // Check current state
    const comment = await col.findOne(
      { _id: commentOid },
      { projection: { likes: 1, likedBy: 1, startupId: 1 } }
    );

    if (!comment) {
      return NextResponse.json({ message: "Comment not found." }, { status: 404 });
    }

    // Verify the comment belongs to the specified startup
    if (comment.startupId.toString() !== startupId) {
      return NextResponse.json(
        { message: "Comment does not belong to this startup." },
        { status: 400 }
      );
    }

    const alreadyLiked = Array.isArray(comment.likedBy) && comment.likedBy.includes(userId);

    let result;
    if (alreadyLiked) {
      // Unlike — remove userId from likedBy, decrement likes (floor 0)
      result = await col.findOneAndUpdate(
        { _id: commentOid, likes: { $gt: 0 } },
        {
          $inc: { likes: -1 },
          $pull: { likedBy: userId },
        },
        { returnDocument: "after", projection: { likes: 1 } }
      );
    } else {
      // Like — add userId to likedBy, increment likes
      result = await col.findOneAndUpdate(
        { _id: commentOid },
        {
          $inc: { likes: 1 },
          $addToSet: { likedBy: userId },
        },
        { returnDocument: "after", projection: { likes: 1 } }
      );
    }

    const newLikes = result?.likes ?? comment.likes ?? 0;
    return NextResponse.json({ likes: newLikes, liked: !alreadyLiked });
  } catch (err) {
    console.error("[POST /api/startups/comments/[startupId]/[commentId]/like]", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
