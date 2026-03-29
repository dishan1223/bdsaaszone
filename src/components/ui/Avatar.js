export default function Avatar({ src, name, size = 28 }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const style = { width: size, height: size, flexShrink: 0 };
  if (src) return <img src={src} alt={name} style={style} className="rounded-full object-cover ring-1 ring-slate-200" />;
  return <div style={style} className="rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 ring-1 ring-slate-300">{initials}</div>;
}