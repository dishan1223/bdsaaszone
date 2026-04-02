// app/api/embed/rank/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      // Return 400 but still allow CORS
      return new NextResponse(JSON.stringify({ rank: null }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB);

    const rankingDoc = await db.collection("rankings").findOne({ type: "daily_top3" });

    if (!rankingDoc || !rankingDoc.top3) {
      return NextResponse.json({ rank: null }, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const normalize = (text) => 
      text.toLowerCase().trim().replace(/\s+/g, '-');

    const found = rankingDoc.top3.find((item) => {
      return normalize(item.name) === slug.toLowerCase();
    });

    const data = { 
      rank: found ? found.rank : null,
      name: found ? found.name : null 
    };

    // IMPORTANT: Return the response with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' // Cache for 1 min to save DB hits
      }
    });

  } catch (err) {
    console.error("[EMBED ERROR]", err);
    return NextResponse.json({ rank: null }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}