import Link from "next/link";
import { ArrowLeft, Code, FileCode2, Tag, Info, CheckCircle } from "lucide-react";
import { RankBadgeLarge, RankBadgeSmall } from "@/components/ui/RankBadge";

const GITHUB_USERNAME = "dishan1223";
const CDN_URL = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/bdsaaszone-badge-widget@latest/embed.js`;

export default function BadgeDocs() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-8 text-sm">
        <ArrowLeft size={15} /> Back to home
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Rank Badge Widget</h1>
        <p className="text-slate-600 mt-1">
          Showcase your BD SaaS Zone ranking on your personal website, portfolio, or product landing page.
        </p>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Large</span>
            <RankBadgeLarge rank={1} />
          </div>
          <div className="hidden sm:block h-12 w-px bg-slate-200"></div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Small</span>
            <RankBadgeSmall rank={2} />
          </div>
        </div>
      </div>

      {/* Steps Container */}
      <div className="flex flex-col gap-6">
        
        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">1</div>
            <h2 className="text-lg font-semibold text-slate-800">Add the Script</h2>
          </div>
          <p className="text-slate-600 text-sm mb-4 pl-10">
            Paste this script tag once in your website's <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 text-xs font-mono">&lt;head&gt;</code> or before the closing <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 text-xs font-mono">&lt;/body&gt;</code> tag.
          </p>
          
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre><code>{`<script src="${CDN_URL}" defer></script>`}</code></pre>
          </div>

          <div className="flex items-start gap-2 mt-4 pl-10 text-sm text-slate-500">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
            <span>You only need to add this script <strong className="text-slate-700">once</strong> per page, even if you display multiple badges.</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">2</div>
            <h2 className="text-lg font-semibold text-slate-800">Find Your Slug</h2>
          </div>
          <p className="text-slate-600 text-sm mb-4 pl-10">
            The widget needs your unique identifier (slug). You can find this in your startup's URL on BD SaaS Zone.
          </p>

          <div className="pl-10 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <span className="px-3 py-2 text-slate-500 text-sm border-r border-slate-200 bg-slate-100">bdsaaszone.site/startups/</span>
                <span className="px-3 py-2 text-blue-600 font-semibold text-sm">your-startup-name</span>
              </div>
              
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">Your Slug</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              * Slug is usually the lowercase version of your startup name with hyphens.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">3</div>
            <h2 className="text-lg font-semibold text-slate-800">Add the Widget</h2>
          </div>
          <p className="text-slate-600 text-sm mb-4 pl-10">
            Place the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 text-xs font-mono">&lt;bds-rank-badge&gt;</code> tag wherever you want the badge to appear.
          </p>

          {/* Large Badge Block */}
          <div className="pl-10 mb-4">
            <span className="text-xs font-semibold text-slate-500 mb-2 block">Large Badge (Best for Footer/About)</span>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre><code>{`<bds-rank-badge slug="YOUR_SLUG" size="large"></bds-rank-badge>`}</code></pre>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4 mx-10"></div>

          {/* Small Badge Block */}
          <div className="pl-10">
            <span className="text-xs font-semibold text-slate-500 mb-2 block">Small Badge (Best for Navbar/Sidebar)</span>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre><code>{`<bds-rank-badge slug="YOUR_SLUG" size="small"></bds-rank-badge>`}</code></pre>
            </div>
          </div>
        </div>

        {/* Full Example */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileCode2 size={18} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Full HTML Example</h2>
          </div>
          
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto">
            <pre><code>{`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Startup</title>
    <!-- 1. Include the Script -->
    <script src="${CDN_URL}" defer></script>
</head>
<body>
    <header>
        <h1>Welcome to My Startup</h1>
    </header>

    <main>
        <p>We are building the future.</p>
        
        <!-- 2. Place the Badge -->
        <div style="margin-top: 20px;">
            <bds-rank-badge slug="your-startup-name" size="large"></bds-rank-badge>
        </div>
    </main>
</body>
</html>`}</code></pre>
          </div>
        </div>

      </div>
    </div>
  );
}