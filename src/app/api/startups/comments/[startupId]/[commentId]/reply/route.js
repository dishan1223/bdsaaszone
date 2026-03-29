
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "You must be logged in to reply." }, { status: 401 });
    }

    const { startupId, commentId } = await params;
    const { text } = await req.json();

    if (!text?.trim()) return NextResponse.json({ message: "Reply cannot be empty." }, { status: 400 });
    if (text.trim().length > 1000) return NextResponse.json({ message: "Reply must be under 1000 characters." }, { status: 400 });

    // Verify parent comment exists
    let parentOid;
    try { parentOid = new ObjectId(commentId); } catch {
      return NextResponse.json({ message: "Invalid comment ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const parent = await db.collection("comments").findOne({ _id: parentOid });
    if (!parent) return NextResponse.json({ message: "Comment not found." }, { status: 404 });

    const now = new Date();
    const doc = {
      startupId,
      parentId: commentId,   // string, matches how we query in GET
      userId: session.user.id,
      text: text.trim(),
      likes: 0,
      likedBy: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("comments").insertOne(doc);

    return NextResponse.json({
      reply: {
        ...doc,
        _id: result.insertedId.toString(),
        author: { name: session.user.name, image: session.user.image ?? null },
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST reply]", err);
    return NextResponse.json({ message: "Failed to post reply." }, { status: 500 });
  }
}