import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
    }

    const { commentId } = await params;
    let oid;
    try { oid = new ObjectId(commentId); } catch {
      return NextResponse.json({ message: "Invalid comment ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const comment = await db.collection("comments").findOne({ _id: oid });
    if (!comment) {
      return NextResponse.json({ message: "Comment not found." }, { status: 404 });
    }
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    await db.collection("comments").deleteOne({ _id: oid });

    return NextResponse.json({ message: "Comment deleted." });
  } catch (err) {
    console.error("[DELETE /api/startups/[id]/comments/[commentId]]", err);
    return NextResponse.json({ message: "Failed to delete comment." }, { status: 500 });
  }
}