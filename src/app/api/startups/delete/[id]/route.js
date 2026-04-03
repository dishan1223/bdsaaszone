import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { invalidateStartupsCache } from "@/lib/redis";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to delete a startup." },
        { status: 401 }
      );
    }

    const { id } = await params;
    let oid;
    try { oid = new ObjectId(id); } catch {
      return NextResponse.json({ message: "Invalid startup ID." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const startup = await db.collection("startups").findOne({ _id: oid });
    if (!startup) {
      return NextResponse.json({ message: "Startup not found." }, { status: 404 });
    }
    if (startup.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    if (startup.logoPublicId) {
      await cloudinary.uploader.destroy(startup.logoPublicId).catch(console.error);
    }

    await db.collection("startups").deleteOne({ _id: oid });

    await invalidateStartupsCache()

    return NextResponse.json({ message: "Startup deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/startups/[id]]", err);
    return NextResponse.json({ message: "Failed to delete startup." }, { status: 500 });
  }
}