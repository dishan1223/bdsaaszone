// src/app/api/notifications/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

// ── GET /api/notifications ────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ notifications: [], unread: 0 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const notifications = await db
      .collection("notifications")
      .find({ founderId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const unread = notifications.filter((n) => !n.seen).length;

    return NextResponse.json({
      notifications: notifications.map((n) => ({ ...n, _id: n._id.toString() })),
      unread,
    });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return NextResponse.json({ notifications: [], unread: 0 });
  }
}

// ── PATCH /api/notifications — mark all as seen ───────────────────────────────
export async function PATCH() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    await db.collection("notifications").updateMany(
      { founderId: session.user.id, seen: false },
      { $set: { seen: true } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/notifications]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}