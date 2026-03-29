import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Globe, Heart, Tag, DollarSign, Users, BarChart2, ExternalLink } from "lucide-react";
import { TECH_ICONS } from "@/lib/techIcons";

const CATEGORY_LABELS = {
  ai: "AI", productivity: "Productivity", marketing: "Marketing", finance: "Finance",
  hr: "HR & Recruitment", ecommerce: "E-Commerce", education: "Education",
  healthcare: "Healthcare", "developer-tools": "Developer Tools", analytics: "Analytics",
  communication: "Communication", design: "Design", security: "Security", other: "Other",
};

const PRODUCT_TYPE_LABELS = {
  free: "Free", subscription: "Subscription", one_time: "One-time",
};

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

async function getFounderData(userId) {
  let oid;
  try { oid = new ObjectId(userId); } catch { return null; }

  const client = await clientPromise;
  const db = client.db(process.env.DB);

  const user = await db
    .collection("user")
    .findOne({ _id: oid }, { projection: { _id: 1, name: 1, image: 1, email: 1, createdAt: 1 } });

  if (!user) return null;

  const startups = await db
    .collection("startups")
    .find({ userId })
    .sort({ likes: -1 })
    .toArray();

  return {
    founder: {
      id: user._id.toString(),
      name: user.name,
      image: user.image ?? null,
      email: user.email ?? null,
      memberSince: user.createdAt ?? null,
    },
    startups: startups.map((s) => ({
      ...s,
      _id: s._id.toString(),
      likes: s.likes ?? 0,
    })),
  };
}

// ── Sub-components (no event handlers — safe for Server Components) ────────────

function LogoSquare({ src, name, size = 44 }) {
  const style = { width: size, height: size, flexShrink: 0 };
  if (src) return <img src={src} alt={name} style={style} className="rounded-xl object-cover border border-slate-200" />;
  return (
    <div style={style} className="rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
      {(name ?? "??").slice(0, 2).toUpperCase()}
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const styles = {
    slate: "bg-slate-100 text-slate-500",
    blue:  "bg-blue-50 text-blue-600 border border-blue-100",
    green: "bg-green-50 text-green-600 border border-green-100",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${styles[color]}`}>
      {children}
    </span>
  );
}

function TechPill({ name }) {
  const iconSlug = TECH_ICONS[name];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
      {iconSlug && (
        <Image
          src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconSlug}/${iconSlug}-original.svg`}
          alt={name}
          width={12}
          height={12}
          style={{ flexShrink: 0 }}
        />
      )}
      {name}
    </span>
  );
}

function StartupCard({ startup }) {
  const slug = toSlug(startup.name);
  return (
    <Link href={`/startups/${slug}`} className="block group">
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">

        {/* Top row */}
        <div className="flex items-start gap-3">
          <LogoSquare src={startup.logoUrl} name={startup.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-slate-900">
                {startup.name}
              </span>
              {startup.forSale && <Badge color="blue">For Sale</Badge>}
              {startup.seekingCofounder && <Badge color="green">Seeking Co-founder</Badge>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
              {startup.description}
            </p>
          </div>
          {/* Likes */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <Heart size={13} className={startup.likes > 0 ? "text-rose-400" : "text-slate-300"} />
            <span className="text-xs font-semibold tabular-nums text-slate-600">{startup.likes}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-slate-400">
            <Tag size={11} />
            <span className="text-xs">{CATEGORY_LABELS[startup.category] ?? startup.category}</span>
          </div>
          <span className="text-slate-200 text-xs">·</span>
          <Badge>{PRODUCT_TYPE_LABELS[startup.productType] ?? startup.productType}</Badge>
          {startup.forSale && startup.askingPrice && (
            <>
              <span className="text-slate-200 text-xs">·</span>
              <div className="flex items-center gap-1 text-blue-500">
                <DollarSign size={11} />
                <span className="text-xs font-medium">{startup.askingPrice}</span>
              </div>
            </>
          )}
        </div>

        {/* URL */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Globe size={11} className="shrink-0" />
          <span className="text-xs truncate">{startup.url?.replace(/^https?:\/\//, "")}</span>
          <ExternalLink size={10} className="shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Tech stack */}
        {startup.techStack?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {startup.techStack.slice(0, 5).map((t) => (
              <TechPill key={t} name={t} />
            ))}
            {startup.techStack.length > 5 && (
              <span className="text-xs text-slate-400 self-center">+{startup.techStack.length - 5} more</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function FounderPage({ params }) {
  const { userId } = await params;
  const data = await getFounderData(userId);
  if (!data) notFound();

  const { founder, startups } = data;

  const totalLikes     = startups.reduce((acc, s) => acc + s.likes, 0);
  const forSaleCount   = startups.filter((s) => s.forSale).length;
  const cofounderCount = startups.filter((s) => s.seekingCofounder).length;
  const mostLiked      = startups[0]; // sorted by likes desc

  const memberSince = founder.memberSince
    ? new Date(founder.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  const stats = [
    { icon: <BarChart2 size={15} className="text-slate-400" />, label: "Startups",          value: startups.length },
    { icon: <Heart size={15} className="text-rose-400" />,      label: "Total likes",       value: totalLikes },
    { icon: <DollarSign size={15} className="text-blue-400" />, label: "For sale",          value: forSaleCount },
    { icon: <Users size={15} className="text-green-400" />,     label: "Seeking co-founder", value: cofounderCount },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-8 text-sm w-fit">
        <ArrowLeft size={15} /> Back to home
      </Link>

      {/* Profile card */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-200 mb-6">
        <div className="shrink-0">
          {founder.image ? (
            <img src={founder.image} alt={founder.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 ring-2 ring-slate-100">
              {founder.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Image src="/logo.svg" alt="logo" width={12} height={12} />
            <span className="text-xs text-slate-400">BD SaaS Zone founder</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 truncate">{founder.name}</h1>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {founder.email && (
              <span className="text-sm text-slate-400 truncate">{founder.email}</span>
            )}
            {memberSince && (
              <>
                <span className="text-slate-200 text-xs hidden sm:inline">·</span>
                <span className="text-xs text-slate-400">Member since {memberSince}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {startups.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5 p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-1.5">
                  {s.icon}
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <span className="text-2xl font-bold text-slate-800 tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>

          {mostLiked && mostLiked.likes > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100">
              <Heart size={14} className="text-rose-400 shrink-0" />
              <span className="text-xs text-rose-600">
                <span className="font-semibold">{mostLiked.name}</span> is the most liked startup with{" "}
                <span className="font-semibold">{mostLiked.likes}</span> {mostLiked.likes === 1 ? "like" : "likes"}.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Startups */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Startups by {founder.name?.split(" ")[0]}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {startups.length}
          </span>
        </div>

        {startups.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            <span className="text-3xl">🚀</span>
            <span className="text-sm">No startups listed yet.</span>
          </div>
        )}

        {startups.length > 0 && (
          <div className="flex flex-col gap-3">
            {startups.map((startup) => (
              <StartupCard key={startup._id} startup={startup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}