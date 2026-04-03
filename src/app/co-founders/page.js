import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import CoFoundersClient from "@/components/ui/CoFoundersClient";

export const metadata = {
  title: "Seeking Co-founders | BD SaaS Zone",
  description: "Connect with visionary founders in Bangladesh looking for partners to build the next big thing.",
};

async function getCoFounderStartups() {
  const client = await clientPromise;
  const db = client.db(process.env.DB);

  const startups = await db
    .collection("startups")
    .find({ seekingCofounder: true })
    .sort({ likes: -1 })
    .toArray();

  if (!startups.length) return [];

  const userIds = [...new Set(startups.map((s) => s.userId).filter(Boolean))];
  const objectIds = userIds.flatMap((uid) => { try { return [new ObjectId(uid)]; } catch { return []; } });
  const users = await db.collection("user").find({ _id: { $in: objectIds } }).project({ _id: 1, name: 1, image: 1 }).toArray();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = { name: u.name, image: u.image ?? null };

  return startups.map((s) => ({
    ...s,
    _id: s._id.toString(),
    likes: s.likes ?? 0,
    founder: userMap[s.userId] ?? null,
  }));
}

export default async function CoFoundersPage() {
  const startups = await getCoFounderStartups();
  return <CoFoundersClient startups={startups} />;
}
