import Image from "next/image";
import Link from "next/link";
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-center mt-20 gap-4">
        <div className="flex gap-2 text-slate-600 md:text-2xl font-md text-muted-foreground">
          <Image
            src="/logo.svg"
            alt="logo"
            width={20}
            height={20}
          />
          BD SaaS Zone
        </div>
        <div className="text-slate-800 font-bold text-5xl text-center">A Database of SaaS products<br/> from Bangladesh</div>
        <div className="flex gap-2">
          <div className="flex items-center w-90 p-2 rounded-lg bg-slate-50 border border-slate-300">
            <div className="pl-1">
              <Search size={20} color="#7C7D7E" strokeWidth={2.5} />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search Startups" 
                className="flex-1 bg-transparent px-3 outline-none"
              />
            </div>
          </div>
          <div>
            <Link href="/new">
              <button className="btn border-none h-full bg-slate-900 rounded-lg text-slate-50">+ Add Startup</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
