import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";


export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
    const skip  = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const [comments, total] = await Promise.all([
      db.collection("comments")
        .find({ startupId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("comments").countDocuments({ startupId: id }),
    ]);

    // Fetch authors in one query
    const userIds = [...new Set(comments.map((c) => c.userId).filter(Boolean))];
    const objectIds = userIds.flatMap((uid) => {
      try { return [new ObjectId(uid)]; } catch { return []; }
    });

    const users = objectIds.length > 0
      ? await db.collection("user")
          .find({ _id: { $in: objectIds } })
          .project({ _id: 1, name: 1, image: 1 })
          .toArray()
      : [];

    const userMap = {};
    for (const u of users) userMap[u._id.toString()] = { name: u.name, image: u.image ?? null };

    const enriched = comments.map((c) => ({
      ...c,
      _id: c._id.toString(),
      author: userMap[c.userId] ?? null,
    }));

    return NextResponse.json({ comments: enriched, total, page, limit });
  } catch (err) {
    console.error("[GET /api/startups/[id]/comments]", err);
    return NextResponse.json({ message: "Failed to fetch comments." }, { status: 500 });
  }
}


export async function POST(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "You must be logged in to comment." }, { status: 401 });
    }

    const { id } = await params;
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ message: "Comment cannot be empty." }, { status: 400 });
    }
    if (text.trim().length > 1000) {
      return NextResponse.json({ message: "Comment must be under 1000 characters." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const now = new Date();
    const doc = {
      startupId: id,
      userId: session.user.id,
      text: text.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("comments").insertOne(doc);

    return NextResponse.json({
      comment: {
        ...doc,
        _id: result.insertedId.toString(),
        author: {
          name: session.user.name,
          image: session.user.image ?? null,
        },
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/startups/comments/[id]", err);
    return NextResponse.json({ message: "Failed to post comment." }, { status: 500 });
  }
}