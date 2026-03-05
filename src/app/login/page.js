"use client";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function LoginForm() {
  const searchParams = useSearchParams();
  

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl, 
    });
  };

  return (
    <div className="flex flex-col justify-center items-center gap-5 h-screen">
      <div className="flex items-center gap-3">
        <div>
          <Image
            src="/logo.svg"
            alt="logo"
            width={30}
            height={30}
          />
        </div>
        <div className="text-3xl text-slate-600">BD SaaS Zone</div>
      </div>
      <div className="py-10 px-14 bg-slate-50 rounded-lg bg-slate-50 border border-slate-300 flex flex-col justify-center items-center gap-5">
        <div className="text-xl text-slate-800">Sign in to your account</div>
       
        <div>
          <button onClick={handleGoogleLogin} className="btn bg-white text-black border-[#e5e5e5] rounded-lg">
            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense (Next.js requirement for useSearchParams during build)
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}