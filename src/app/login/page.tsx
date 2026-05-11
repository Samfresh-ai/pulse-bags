"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PulseLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function GoogleIcon() {
  return (
    <img src="/Icons/google-icon.svg" alt="Google Icon" />
  );
}

function XIcon() {
  return (
    <img src="/Icons/x-icon.svg" alt="Google Icon" />
  );
}

function DiscordIcon() {
  return (
      <img src="/Icons/discord-icon.svg" alt="Google Icon" />
  );
}

function WalletIcon() {
  return (
   <img src="/Icons/wallet-icon.svg" alt="Google Icon" />
  );
}

function ChevronRight() {
  return (
       <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
        <span className="mt-0.5 block font-['JetBrains_Mono'] text-[10px] text-slate-600">
          {sublabel}
        </span>
      </div>

      <span className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isAccent ? "text-violet-500" : "text-slate-700 group-hover:text-slate-500"}`}>
        <ChevronRight />
      </span>
    </Button>
  );
}
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1 bg-white/[0.055]" />
      <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/[0.055]" />
    </div>
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

    for (let i = 0; i < 140; i++) {
      const el = document.createElement("div");
      const sz = Math.random() * 1.7 + 0.3;
      el.className = "absolute rounded-full bg-white";
      el.style.cssText = `
        width:${sz}px;height:${sz}px;
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        animation:tw ${2.5 + Math.random() * 4}s ease-in-out infinite ${-(Math.random() * 7)}s;
        --lo:${0.06 + Math.random() * 0.14};--hi:${0.4 + Math.random() * 0.5};
      `;
      space.appendChild(el);
    }

    [
      { w: 520, h: 520, t: "-80px",  l: "-80px",  c: "rgba(139,92,246,0.08)" },
      { w: 380, h: 380, t: "38%",    r: "-90px",  c: "rgba(99,102,241,0.055)" },
      { w: 300, h: 300, b: "8%",     l: "28%",    c: "rgba(139,92,246,0.05)" },
      { w: 240, h: 240, t: "20%",    l: "60%",    c: "rgba(34,197,94,0.03)" },
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
        @keyframes tw {
          0%,100% { opacity: var(--lo, 0.08); }
          50%      { opacity: var(--hi, 0.55); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:none; }
        }
        .fu   { animation: fadeUp .5s ease both; }
        .fu-1 { animation-delay: .08s; }
        .fu-2 { animation-delay: .16s; }
        .fu-3 { animation-delay: .24s; }
        .fu-4 { animation-delay: .32s; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 6px rgba(139,92,246,0.5); }
          50%      { box-shadow: 0 0 16px rgba(139,92,246,1), 0 0 28px rgba(139,92,246,0.35); }
        }
        .glow-dot { animation: glowPulse 2.2s ease-in-out infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#050810] font-['DM_Sans'] text-slate-100 flex flex-col">
        <div id="login-space" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />

        <nav className="relative z-10 flex h-[62px] shrink-0 items-center justify-between border-b border-white/[0.055] bg-[#050810]/70 px-6 backdrop-blur-[18px] md:px-12">
          <PulseLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 transition hover:text-slate-300"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9 2.5L5 6.5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to home
          </Link>
        </nav>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-14">
          <div className="w-full max-w-[400px]">

            <div className="relative overflow-hidden rounded-[22px] border border-violet-500/[0.16] bg-[#0d1120] p-8 shadow-[0_0_80px_rgba(139,92,246,0.09),0_32px_80px_rgba(0,0,0,0.6)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.1)_0%,transparent_70%)]" />

              <div className="relative">
                <div className="fu mb-7 flex flex-col items-center gap-2 text-center">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 font-['JetBrains_Mono'] text-[10px] tracking-[0.06em] text-violet-300">
                    <span className="glow-dot h-1.5 w-1.5 rounded-full bg-violet-500" />
                    PULSE CONSOLE
                  </div>

                  <h1 className="font-['Space_Grotesk'] text-[22px] font-bold leading-tight tracking-[-0.025em]">
                    Sign in to Pulse
                  </h1>
                  <p className="text-[13px] leading-[1.65] text-slate-500">
                    Verify your identity to rank holders<br />and unlock fee-share rewards.
                  </p>
                </div>
                <div className="fu fu-1 flex flex-col gap-2">
                  <LoginButton
                    icon={<XIcon />}
                    label="Continue with X"
                    sublabel="Twitter / X account"
                    onClick={login}
                    variant="accent"
                  />
                  <LoginButton
                    icon={<GoogleIcon />}
                    label="Continue with Google"
                    sublabel="Gmail accounts only"
                    onClick={login}
                  />
                  <LoginButton
                    icon={<DiscordIcon />}
                    label="Continue with Discord"
                    sublabel="Discord account"
                    onClick={login}
                  />
                </div>

                <Divider label="or use a wallet" />

                <div className="fu fu-2">
                  <LoginButton
                    icon={<WalletIcon />}
                    label="Connect Wallet"
                    sublabel="Phantom · Backpack · Solflare · more"
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
                <p className="fu fu-4 mt-6 text-center font-['JetBrains_Mono'] text-[10px] leading-[1.75] text-slate-600">
                  Signing in creates your Pulse creator account.<br />
                  Holder verification uses a separate wallet-link flow.
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