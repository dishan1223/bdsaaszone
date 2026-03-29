import Link from "next/link"
import Image from "next/image"
import { Facebook, Mail } from "lucide-react"

export default function Footer(){
    return(
            <div>
                <footer className="lg:py-20 py-18 px-8 lg:px-18 w-full bg-[#EFF2F5]">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 justify-between">
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="logo" width={25} height={25} />
                <h1 className="font-bold primary-font text-lg">BD SaaS Zone</h1>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <p className="text-center lg:text-left mb-4 text-sm w-45 secondary-font">
                  BD SaaS Zone is a directory for Made-in-Bangladesh SaaS. A space for founders to showcase their startups and developers to discover
                </p>
                <p className="text-center text-sm font-semibold secondary-font">
                  Copyright © {new Date().getFullYear()}. All rights reserved.
                </p>
              </div>
            </div>
            <div>
              <h1 className="text-soft mb-4 text-center lg:text-left">Links</h1>
              <div className="flex flex-col gap-2 text-sm secondary-font items-center lg:items-start">
                <Link className="hover:underline" href="/">
                  Home
                </Link>
                <Link className="hover:underline" href="/login">
                  login
                </Link>
                <Link className="hover:underline" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="hover:underline" href="/for-sale">
                  SaaS For Sale
                </Link>
                <Link className="hover:underline" href="/new">
                  Add New Startup
                </Link>
              </div>
            </div>
            <div>
              <h1 className="text-soft mb-4 text-center lg:text-left">Connect</h1>
              <div className="flex gap-3 items-center lg:items-start">
                <Link 
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 transition-all duration-200 hover:scale-110 shadow-sm" 
                  href="https://www.facebook.com/ishtiaq.dishan/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="text-[#1877F2]" size={20} />
                </Link>
                <Link 
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 transition-all duration-200 hover:scale-110 shadow-sm" 
                  href="https://x.com/ishtiaqdishan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link 
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white hover:bg-gray-100 transition-all duration-200 hover:scale-110 shadow-sm" 
                  href="mailto:dishanishtiaq45@gmail.com"
                >
                  <Mail className="text-[#EA4335]" size={20} />
                </Link>
              </div>
            </div>
          </div>
        </footer>
            </div>
        )
}