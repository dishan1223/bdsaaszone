import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Globe, Tag, Layers, Users, DollarSign } from "lucide-react";
import LikeButton from "@/components/ui/LikeButton";
import SitePreview from "@/components/ui/SitePreview";
import CommentSection from "@/components/ui/CommentSection";
import { RankBadgeLarge, RankHistory } from "@/components/ui/RankBadge";
import { TECH_ICONS } from "@/constants/constants.js";
import { CATEGORY_LABELS, PRODUCT_TYPE_LABELS } from "@/constants/constants.js";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

async function getStartup(slug) {
  const client = await clientPromise;
  const db = client.db(process.env.DB);
  const startups = await db.collection("startups").find({}).toArray();
  const startup = startups.find((s) => toSlug(s.name) === slug);
  if (!startup) return null;

  let founder = null;
  try {
    const user = await db.collection("user").findOne(
      { _id: new ObjectId(startup.userId) },
      { projection: { _id: 1, name: 1, image: 1, email: 1 } }
    );
    if (user) founder = { name: user.name, image: user.image ?? null, email: user.email ?? null };
  } catch {}

  return {
    ...startup,
    _id: startup._id.toString(),
    likes: startup.likes ?? 0,
    likedBy: startup.likedBy ?? [],
    founder,
  };
}

export default async function StartupPage({ params }) {
  const { slug } = await params;
  const startup = await getStartup(slug);
  if (!startup) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id ?? null;
  const initialLiked = currentUserId ? (startup.likedBy ?? []).includes(currentUserId) : false;

  const { first = 0, second = 0, third = 0 } = startup.timesRanked ?? {};
  const hasRankHistory = first > 0 || second > 0 || third > 0;

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-8 text-sm">
          <ArrowLeft size={15} /> Back to home
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {startup.logoUrl ? (
            <img src={startup.logoUrl} alt={startup.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 shrink-0">
              {startup.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{startup.name}</h1>
              {startup.forSale && (
                <span style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }} className="text-xs font-medium px-2.5 py-1 rounded-full">For Sale</span>
              )}
              {startup.seekingCofounder && (
                <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }} className="text-xs font-medium px-2.5 py-1 rounded-full">Seeking Co-founder</span>
              )}
            </div>
            <a href={startup.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors">
              <Globe size={13} />
              {startup.url?.replace(/^https?:\/\//, "")}
            </a>
          </div>
          <div className="flex items-center gap-2">
            {/* Rank badge - only showing the badge without background */}
            {startup.currentRank && <RankBadgeLarge rank={startup.currentRank} />}
            <LikeButton startupId={startup._id} initialLikes={startup.likes} initialLiked={initialLiked} />
          </div>
        </div>

        {/* Rank History Section - keeping it in its original position */}
        {hasRankHistory && (
          <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <RankHistory timesRanked={startup.timesRanked} />
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href={`/founder/${startup.userId}`} className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
              {startup.founder?.image ? (
                <img src={startup.founder.image} alt={startup.founder.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                  {startup.founder?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Founder</div>
                <div className="text-sm font-medium text-slate-700">{startup.founder?.name ?? "Unknown"}</div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><Tag size={15} className="text-slate-500" /></div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Category</div>
              <div className="text-sm font-medium text-slate-700">{CATEGORY_LABELS[startup.category] ?? startup.category}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><Layers size={15} className="text-slate-500" /></div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Type</div>
              <div className="text-sm font-medium text-slate-700">{PRODUCT_TYPE_LABELS[startup.productType] ?? startup.productType}</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">About</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{startup.description}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Preview</h2>
          <SitePreview url={startup.url} name={startup.name} />
        </div>

        {startup.techStack?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {startup.techStack.map((tech) => {
                const iconSlug = TECH_ICONS[tech];
                return (
                  <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                    {iconSlug && <Image src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconSlug}/${iconSlug}-original.svg`} alt={tech} width={14} height={14} style={{ flexShrink: 0 }} />}
                    {tech}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {startup.subscriptions?.filter(s => s.plan || s.price).length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Pricing</h2>
            <div className="flex flex-col gap-2">
              {startup.subscriptions.filter(s => s.plan || s.price).map((sub, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">{sub.plan || "—"}</span>
                  <span className="text-sm font-semibold text-slate-800">{sub.price || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {startup.forSale && startup.askingPrice && (
          <div className="mb-8 p-5 rounded-xl border border-blue-100 bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={15} className="text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">This startup is for sale</span>
            </div>
            <p className="text-sm text-blue-600 mb-3">The founder is open to acquisition offers.</p>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-blue-500 block mb-0.5">Asking price</span>
                <span className="text-lg font-bold text-blue-700">{startup.askingPrice}</span>
              </div>
              {startup.founder?.email && (
                <a href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(startup.founder.email)}&su=${encodeURIComponent(`Interested in acquiring ${startup.name}`)}&body=${encodeURIComponent(`Hi ${startup.founder.name?.split(" ")[0] ?? "there"},\n\nI came across ${startup.name} on BD SaaS Zone and I'm interested in discussing an acquisition.\n\nAsking price listed: ${startup.askingPrice}\n\nLooking forward to hearing from you!`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                  Contact Founder
                </a>
              )}
            </div>
          </div>
        )}

        {startup.seekingCofounder && (
          <div className="mb-8 p-5 rounded-xl border border-green-100 bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <Users size={15} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">Seeking a Co-founder</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
              <p className="text-sm text-green-600">The founder is looking for a co-founder to join this startup.</p>
              {startup.founder?.email && (
                <a href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(startup.founder.email)}&su=${encodeURIComponent(`Interested in co-founding ${startup.name} with you`)}&body=${encodeURIComponent(`Hi ${startup.founder.name?.split(" ")[0] ?? "there"},\n\nI found ${startup.name} on BD SaaS Zone and I'd love to explore the possibility of joining as a co-founder.\n\nLooking forward to connecting!`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                  Contact Founder
                </a>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 mb-8" />
        <CommentSection startupId={startup._id} />

      </div>
    </div>
  );
}