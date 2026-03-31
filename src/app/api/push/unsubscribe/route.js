import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ ok: false }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    await db.collection("pushSubscriptions").deleteOne({
      userId: session.user.id,
      "subscription.endpoint": endpoint,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/push/unsubscribe]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}