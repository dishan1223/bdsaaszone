import Link from "next/link"
import Image from "next/image"
import { Facebook, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-[#EFF2F5] py-14 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10">

          {/* Brand */}
          <div className="flex flex-col items-center lg:items-start gap-3 max-w-xs">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="logo" width={22} height={22} />
              <h1 className="font-bold primary-font text-base">BD SaaS Zone</h1>
            </div>
            <p className="text-center lg:text-left text-sm secondary-font text-slate-500 leading-relaxed">
              A directory for Made-in-Bangladesh SaaS. A space for founders to showcase their startups and developers to discover.
            </p>
            <p className="text-xs text-slate-400 secondary-font">
              © {new Date().getFullYear()} BD SaaS Zone. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center lg:items-start gap-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Links</h2>
            {[
              { href: "/", label: "Home" },
              { href: "/login", label: "Login" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/docs/badge", label : "Ranking Badge Widget"},
              { href: "/for-sale", label: "SaaS For Sale" },
              { href: "/new", label: "Add Startup" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors secondary-font"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div className="flex flex-col items-center lg:items-start gap-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Connect</h2>
            <div className="flex gap-2">
              <Link
                href="https://www.facebook.com/ishtiaq.dishan/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <Facebook className="text-[#1877F2]" size={17} />
              </Link>
              <Link
                href="https://x.com/ishtiaqdishan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link
                href="mailto:dishanishtiaq45@gmail.com"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <Mail className="text-[#EA4335]" size={17} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}