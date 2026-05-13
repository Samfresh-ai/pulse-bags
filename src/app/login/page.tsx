"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PulseLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function GoogleIcon() {
  return <Image src="/Icons/google-icon.svg" alt="Google Icon" className="w-4 h-4" />;
}

function XIcon() {
  return <Image src="/Icons/x-icon.svg" alt="X Icon" className="w-4 h-4" />;
}

function PrivyIcon() {
  return (
    <div className="h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
  );
}

function WalletIcon() {
  return <Image src="/Icons/wallet-icon.svg" alt="Wallet Icon" className="w-4 h-4" />;
}

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 32 32"><path fill="none" d="M22 16L12 26l-1.4-1.4l8.6-8.6l-8.6-8.6L12 6z"
      stroke="currentColor" 
        strokeWidth="1.4" 
        strokeLinecap="round" 
        strokeLinejoin="round"/></svg>
  );
}

function StepProgress({ currentStep }: { currentStep: number }) {
  const steps = ["Connect", "Token", "Complete"];
  
  return (
    <div className="relative mb-10 px-4">
      <div className="absolute top-[10px] left-[45px] right-[45px] h-[1px] bg-white/10">
        <div 
          className="h-full bg-violet-500 transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(139,92,246,0.5)]"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <div className="relative flex justify-between">
        {steps.map((step, i) => {
          const isCompleted = currentStep > i + 1;
          const isActive = currentStep === i + 1;
          
          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-bold transition-all duration-300 ${
                isActive || isCompleted
                  ? "border-violet-500 bg-[#0d1120] text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.4)]" 
                  : "border-white/10 bg-[#0d1120] text-slate-600"
              }`}>
                {isCompleted ? "✓" : i + 1}
              </div>
              <span className={`font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest ${
                isActive || isCompleted ? "text-violet-400" : "text-slate-700"
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LoginButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
  variant?: "default" | "accent";
}

function LoginButton({ icon, label, sublabel, onClick, variant = "default" }: LoginButtonProps) {
  const isAccent = variant === "accent";
  return (
    <Button
      onClick={onClick}
      className={[
        "group w-full flex items-center gap-3 rounded-[12px] border px-4 py-3.5 text-left transition-all duration-200",
        isAccent
          ? "border-violet-500/30 bg-violet-500/[0.07] hover:border-violet-500/50 hover:bg-violet-500/[0.12]"
          : "border-white/[0.07] bg-white/[0.025] hover:border-violet-500/25 hover:bg-violet-500/[0.04]",
      ].join(" ")}
    >
      <div className={[
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border transition-colors",
        isAccent
          ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
          : "border-white/[0.07] bg-white/[0.04] text-slate-400 group-hover:border-violet-500/20 group-hover:text-slate-300",
      ].join(" ")}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <span className={`block text-[13.5px] font-medium leading-tight ${isAccent ? "text-slate-100" : "text-slate-200"}`}>
          {label}
        </span>
        <span className="mt-0.5 block font-['JetBrains_Mono'] text-[10px] text-slate-600 uppercase">
          {sublabel}
        </span>
      </div>

      <span className={`shrink-0 transition-transform group-hover:-translate-x-0.5 ${isAccent ? "text-violet-500" : "text-slate-700 group-hover:text-slate-500"}`}>
        <ArrowLeft />
      </span>
    </Button>
  );
}

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.replace("/console");
  }, [ready, authenticated, router]);

  useEffect(() => {
    const space = document.getElementById("login-space");
    if (!space || space.childElementCount > 0) return;

    [
      { w: 520, h: 520, t: "-80px",  l: "-80px",  c: "rgba(139,92,246,0.08)" },
      { w: 380, h: 380, t: "38%",    r: "-90px",  c: "rgba(99,102,241,0.055)" },
      { w: 300, h: 300, b: "8%",     l: "28%",    c: "rgba(139,92,246,0.05)" },
    ].forEach((n) => {
      const el = document.createElement("div");
      el.className = "absolute rounded-full blur-[70px] pointer-events-none";
      el.style.cssText = `
        width:${n.w}px;height:${n.h}px;
        background:radial-gradient(circle,${n.c} 0%,transparent 70%);
        ${n.t ? `top:${n.t};` : ""}${n.b ? `bottom:${n.b};` : ""}
        ${n.l ? `left:${n.l};` : ""}${n.r ? `right:${n.r};` : ""}
      `;
      space.appendChild(el);
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:none; }
        }
        .fu   { animation: fadeUp .5s ease both; }
        .fu-1 { animation-delay: .08s; }
        .fu-4 { animation-delay: .32s; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#050810] font-['DM_Sans'] text-slate-100 flex flex-col">
        <div id="login-space" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />
        <nav className="relative z-10 flex h-[62px] shrink-0 items-center justify-between border-b border-white/[0.055] bg-[#050810]/70 px-6 backdrop-blur-[18px] md:px-12">
          <PulseLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 transition hover:text-slate-300"
          >
            <ArrowLeft />
            Back to home
          </Link>
        </nav>
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-14">
          <div className="w-full max-w-[400px]">
            
            <div className="relative overflow-hidden rounded-[22px] border border-violet-500/[0.16] bg-[#0d1120] p-8 shadow-[0_0_80px_rgba(139,92,246,0.09),0_32px_80px_rgba(0,0,0,0.6)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.1)_0%,transparent_70%)]" />

              <div className="relative">
                <div className="fu">
                  <StepProgress currentStep={1} />
                </div>

                <div className="fu mb-7 flex flex-col items-center gap-2 text-center">
                  <h1 className="font-['Space_Grotesk'] text-[22px] font-bold leading-tight tracking-[-0.025em]">
                    Connect Your Wallet
                  </h1>
                  <p className="text-[13px] leading-[1.65] text-slate-500">
                    Sign in to Pulse to connect your Bags token and discover your true fans.
                  </p>
                </div>

                <div className="fu fu-1 flex flex-col gap-2">
                  <LoginButton
                    icon={<PrivyIcon />}
                    label="Connect with Privy"
                    sublabel="Fast & secure social login"
                    onClick={login}
                    variant="accent"
                  />
                  <LoginButton
                    icon={<WalletIcon />}
                    label="Connect Wallet"
                    sublabel="Use your Solana wallet"
                    onClick={login}
                  />
                  <LoginButton
                    icon={<XIcon />}
                    label="Connect with Twitter"
                    sublabel="Quick Login with X"
                    onClick={login}
                  />
                  <LoginButton
                    icon={<GoogleIcon />}
                    label="Connect with Google"
                    sublabel="Gmail accounts only"
                    onClick={login}
                  />
                </div>
                {!ready && (
                  <div className="fu fu-4 mt-5 flex items-center justify-center gap-2">
                    <div className="spin h-3.5 w-3.5 rounded-full border-2 border-violet-500 border-t-transparent" />
                    <span className="font-['JetBrains_Mono'] text-[10px] text-slate-600">
                      Checking session…
                    </span>
                  </div>
                )}

                <p className="fu fu-4 mt-8 text-center font-['JetBrains_Mono'] text-[10px] leading-[1.75] text-slate-600">
                  By signing in, you agree to our.<br />
                  <Link href="#" className="text-slate-400 hover:text-violet-400 transition-colors">Terms of Service</Link>
                  {" & "}
                  <Link href="#" className="text-slate-400 hover:text-violet-400 transition-colors">Privacy Policy</Link>
                </p>
              </div>
            </div>

            <div className="fu fu-4 mt-5 flex items-center justify-center gap-2">
              <Image src="/Logos/bags-logo.svg" alt="Bags Protocol" width={15} height={15}/>
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.07em] text-slate-600">
                Built on Bags Protocol
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}