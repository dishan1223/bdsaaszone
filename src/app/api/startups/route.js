import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getRedisClient } from "@/lib/redis";

const ITEMS_PER_PAGE = 20;
const CACHE_TTL = 60; // Cache for 60 seconds

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const forSaleOnly = searchParams.get("forSale") === "true";
  const newlyAdded = searchParams.get("newlyAdded") === "true";
  const seekingCofounder = searchParams.get("seekingCofounder") === "true";
  const advertisedOnly = searchParams.get("advertised") === "true";

  // Construct Cache Key
  const cacheKey = `startups:${page}:${category}:${search}:${forSaleOnly}:${newlyAdded}:${seekingCofounder}:${advertisedOnly}`;

  try {
    const redisClient = await getRedisClient();

    // 1. Try fetching from Redis
    if (redisClient) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    // 2. Fetch from MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.DB);

    // Build Query
    const query = {};
    if (category !== "all") query.category = category;
    if (forSaleOnly) query.forSale = true;
    if (seekingCofounder) query.seekingCofounder = true;
    if (advertisedOnly) {
      query.isAdvertised = true;
      query.advertisedUntil = { $gte: new Date() };
    }
    if (newlyAdded) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      query.createdAt = { $gte: threeDaysAgo };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Get Total Count for Pagination
    const total = await db.collection("startups").countDocuments(query);

    // Fetch Paginated Startups
    const sort = newlyAdded ? { createdAt: -1 } : { likes: -1 };
    const startups = await db
      .collection("startups")
      .find(query)
      .sort(sort)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    // Enrich with User Data (Only for current page)
    const uniqueUserIds = [...new Set(startups.map((s) => s.userId).filter(Boolean))];
    const objectIds = uniqueUserIds.flatMap((uid) => {
      try { return [new ObjectId(uid)]; } catch { return []; }
    });

    const users = objectIds.length > 0
      ? await db
          .collection("user")
          .find({ _id: { $in: objectIds } })
          .project({ _id: 1, name: 1, image: 1 })
          .toArray()
      : [];

    const userMap = {};
    for (const u of users) {
      userMap[u._id.toString()] = { name: u.name, image: u.image ?? null };
    }

    const enrichedStartups = startups.map((s) => ({
      ...s,
      _id: s._id.toString(),
      likes: s.likes ?? 0,
      founder: userMap[s.userId] ?? null,
      // Only show as advertised if the date hasn't passed
      isAdvertised: s.isAdvertised && s.advertisedUntil && new Date(s.advertisedUntil) > new Date(),
    }));

    const response = {
      startups: enrichedStartups,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      totalItems: total,
      hasMore: page * ITEMS_PER_PAGE < total
    };

    // 3. Set Redis Cache
    if (redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(response), { EX: CACHE_TTL });
    }

    return NextResponse.json(response);

  } catch (err) {
    console.error("[GET /api/startups]", err);
    return NextResponse.json(
      { message: "Failed to fetch startups." },
      { status: 500 }
    );
  }
}