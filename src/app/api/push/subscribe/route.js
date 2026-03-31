import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ message: "Invalid subscription." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    // Upsert by endpoint — avoid duplicates if user visits multiple times
    await db.collection("pushSubscriptions").updateOne(
      { "subscription.endpoint": subscription.endpoint },
      {
        $set: {
          userId:       session.user.id,
          subscription, // full PushSubscription object
          updatedAt:    new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/push/subscribe]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}