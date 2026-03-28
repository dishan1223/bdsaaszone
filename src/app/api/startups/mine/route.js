import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to view your startups." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const startups = await db
      .collection("startups")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = startups.map((s) => ({
      ...s,
      _id: s._id.toString(),
      likes: s.likes ?? 0,
    }));

    return NextResponse.json({ startups: enriched });
  } catch (err) {
    console.error("[GET /api/startups/mine]", err);
    return NextResponse.json(
      { message: "Failed to fetch your startups." },
      { status: 500 }
    );
  }
}