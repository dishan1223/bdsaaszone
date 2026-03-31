// src/app/api/startups/comments/[startupId]/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/createNotification";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

// ── GET /api/startups/comments/[startupId]?page=1&limit=10
export async function GET(req, { params }) {
  try {
    const { startupId } = await params;
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
    const skip  = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const filter = { startupId, parentId: { $exists: false } };

    const [comments, total] = await Promise.all([
      db.collection("comments")
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("comments").countDocuments(filter),
    ]);

    const commentIds = comments.map((c) => c._id.toString());
    const allReplies = commentIds.length > 0
      ? await db.collection("comments")
          .find({ parentId: { $in: commentIds } })
          .sort({ createdAt: 1 })
          .toArray()
      : [];

    const allDocs = [...comments, ...allReplies];
    const userIds = [...new Set(allDocs.map((d) => d.userId).filter(Boolean))];
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

    const repliesByParent = {};
    for (const r of allReplies) {
      if (!repliesByParent[r.parentId]) repliesByParent[r.parentId] = [];
      repliesByParent[r.parentId].push({
        ...r,
        _id: r._id.toString(),
        author: userMap[r.userId] ?? null,
        likes: r.likes ?? 0,
        likedBy: r.likedBy ?? [],
      });
    }

    const enriched = comments.map((c) => ({
      ...c,
      _id: c._id.toString(),
      author: userMap[c.userId] ?? null,
      likes: c.likes ?? 0,
      likedBy: c.likedBy ?? [],
      replies: repliesByParent[c._id.toString()] ?? [],
    }));

    return NextResponse.json({ comments: enriched, total, page, limit });
  } catch (err) {
    console.error("[GET /api/startups/comments/[startupId]]", err);
    return NextResponse.json({ message: "Failed to fetch comments." }, { status: 500 });
  }
}

// ── POST /api/startups/comments/[startupId]
export async function POST(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "You must be logged in to comment." }, { status: 401 });
    }

    const { startupId } = await params;
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

    // Fetch startup for notification metadata (lightweight projection)
    const startup = await db.collection("startups")
      .findOne({ _id: startupId }, { projection: { userId: 1, name: 1 } })
      .catch(() => null);

    const doc = {
      startupId,
      userId: session.user.id,
      text: text.trim(),
      likes: 0,
      likedBy: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("comments").insertOne(doc);

    // ── Fire-and-forget notification (not awaited — never blocks response) ────
    if (startup) {
      createNotification({
        founderId:   startup.userId,
        actorId:     session.user.id,
        actorName:   session.user.name,
        actorImage:  session.user.image ?? null,
        type:        "comment",
        startupId,
        startupName: startup.name,
        startupSlug: toSlug(startup.name),
        preview:     text.trim().slice(0, 80),
      });
    }

    return NextResponse.json({
      comment: {
        ...doc,
        _id: result.insertedId.toString(),
        author: { name: session.user.name, image: session.user.image ?? null },
        replies: [],
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/startups/comments/[startupId]]", err);
    return NextResponse.json({ message: "Failed to post comment." }, { status: 500 });
  }
}