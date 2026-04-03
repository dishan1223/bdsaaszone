import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ADMIN_EMAIL = "dishanishtiaq45@gmail.com";

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.email === ADMIN_EMAIL;
}

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const startups = await db.collection("startups").find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ startups });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch startups" }, { status: 500 });
  }
}

export async function POST(req) {
  if (!await isAdmin()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startupId, advertise } = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const updateData = advertise 
      ? { 
          isAdvertised: true, 
          advertisedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
        }
      : { 
          isAdvertised: false, 
          advertisedUntil: null 
        };

    await db.collection("startups").updateOne(
      { _id: new ObjectId(startupId) },
      { $set: updateData }
    );

    return NextResponse.json({ message: "Advertisement status updated" });
  } catch (error) {
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
