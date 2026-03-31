// src/app/api/notifications/[id]/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

    const { id } = await params;
    let oid;
    try { oid = new ObjectId(id); } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    // Only delete if it belongs to this founder
    await db.collection("notifications").deleteOne({
      _id: oid,
      founderId: session.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/notifications/[id]]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}