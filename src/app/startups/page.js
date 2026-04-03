import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import StartupsClient from "@/components/ui/StartupsClient";

export const metadata = {
  title: "Startup Directory | BD SaaS Zone",
  description: "Browse all Bangladeshi startups. Filter by category, product type, and more.",
};

async function getAllStartups() {
  const client = await clientPromise;
  const db = client.db(process.env.DB);

  // Fetch all startups, sorted by likes by default
  const startups = await db
    .collection("startups")
    .find({})
    .sort({ likes: -1 })
    .toArray();

  if (!startups.length) return [];

  // Enrich with founder data
  const userIds = [...new Set(startups.map((s) => s.userId).filter(Boolean))];
  const objectIds = userIds.flatMap((uid) => {
    try { return [new ObjectId(uid)]; } catch { return []; }
  });

  const users = await db
    .collection("user")
    .find({ _id: { $in: objectIds } })
    .project({ _id: 1, name: 1, image: 1 })
    .toArray();

  const userMap = {};
  for (const u of users) {
    userMap[u._id.toString()] = { name: u.name, image: u.image ?? null };
  }

  return startups.map((s) => ({
    ...s,
    _id: s._id.toString(),
    likes: s.likes ?? 0,
    founder: userMap[s.userId] ?? null,
  }));
}

export default async function StartupsPage() {
  const startups = await getAllStartups();
  return <StartupsClient initialStartups={startups} />;
}
