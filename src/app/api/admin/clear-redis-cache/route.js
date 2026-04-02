import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { invalidateStartupsCache } from "@/lib/redis";

export async function POST(req) {
  try {
    // 1. Secure the endpoint: Ensure user is logged in
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Optional: Check if user is an Admin
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }

    // 3. Clear the cache
    await invalidateStartupsCache();

    return NextResponse.json({ message: "✅ Cache cleared successfully!" });
  } catch (err) {
    console.error("[CLEAR CACHE ERROR]", err);
    return NextResponse.json({ message: "Failed to clear cache." }, { status: 500 });
  }
}