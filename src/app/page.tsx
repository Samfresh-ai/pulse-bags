"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PulseLogo } from "@/components/ui/logo";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import FloatingCoin from "@/components/ui/floatingCoin";
import ProfileMockup from "@/components/ui/profileMockUp";

function ArrowIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M2 6.5h9M8 3.5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-[13px] border border-white/10 bg-violet-500 px-6 py-3.5 text-[15px] font-medium text-white no-underline shadow-[0_0_28px_rgba(139,92,246,0.28),0_4px_14px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-[0_0_44px_rgba(139,92,246,0.44),0_4px_18px_rgba(0,0,0,0.45)]"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[13px] border border-white/[0.055] bg-transparent px-5 py-3.5 text-[15px] font-normal text-slate-400 no-underline transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-slate-100"
    >
      {children}
    </Link>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-violet-300 before:h-px before:w-[18px] before:bg-violet-500">
      {children}
    </div>
  );
}

export default function PulseLandingPage() {
  useEffect(() => {
    const space = document.getElementById("space");
    if (!space || space.childElementCount > 0) return;

    for (let i = 0; i < 160; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 1.8 + 0.4;
      star.className = "absolute rounded-full bg-white animate-twinkle";
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--twinkle-duration", `${2.5 + Math.random() * 4}s`);
      star.style.setProperty("--twinkle-delay", `${-(Math.random() * 7)}s`);
      star.style.setProperty("--twinkle-low", `${0.08 + Math.random() * 0.18}`);
      star.style.setProperty("--twinkle-high", `${0.45 + Math.random() * 0.5}`);
      space.appendChild(star);
    }

    const nebulae = [
      { w: 550, h: 550, t: "-80px", l: "-80px", c: "rgba(139,92,246,0.07)", d: "22s" },
      { w: 420, h: 420, t: "35%", r: "-100px", c: "rgba(99,102,241,0.05)", d: "28s" },
      { w: 600, h: 360, b: "8%", l: "18%", c: "rgba(139,92,246,0.04)", d: "34s" },
      { w: 260, h: 260, t: "65%", l: "4%", c: "rgba(34,197,94,0.03)", d: "19s" },
    ];

    nebulae.forEach((nebula) => {
      const element = document.createElement("div");
      element.className = "absolute rounded-full blur-[70px] animate-nebula";
      element.style.width = `${nebula.w}px`;
      element.style.height = `${nebula.h}px`;
      element.style.background = `radial-gradient(circle, ${nebula.c} 0%, transparent 70%)`;
      element.style.setProperty("--nebula-duration", nebula.d);
      if (nebula.t) element.style.top = nebula.t;
      if (nebula.b) element.style.bottom = nebula.b;
      if (nebula.l) element.style.left = nebula.l;
      if (nebula.r) element.style.right = nebula.r;
      space.appendChild(element);
    });

    [
      { size: 380, top: "18%", left: "8%", duration: "90s" },
      { size: 260, top: "58%", left: "74%", duration: "58s" },
      { size: 190, top: "78%", left: "28%", duration: "42s" },
    ].forEach((ring) => {
      const element = document.createElement("div");
      element.className = "absolute rounded-full border border-violet-500/[0.055] animate-ring";
      element.style.width = `${ring.size}px`;
      element.style.height = `${ring.size}px`;
      element.style.top = ring.top;
      element.style.left = ring.left;
      element.style.setProperty("--ring-duration", ring.duration);
      space.appendChild(element);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050810] font-['DM_Sans'] text-slate-100">
      <div id="space" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />
      <FloatingCoin side="left"  top="28%" delay="0s"    size={28} />
      <FloatingCoin side="left"  top="58%" delay="1.8s"  size={22} />
      <FloatingCoin side="right" top="22%" delay="0.9s"  size={30} />
      <FloatingCoin side="right" top="55%" delay="2.6s"  size={20} />

      <nav className="fixed inset-x-0 top-0 z-[200] flex h-[66px] items-center justify-between border-b border-white/[0.055] bg-[#050810]/70 px-5 backdrop-blur-[18px] md:px-12">
        <PulseLogo />

        <ul className="hidden list-none gap-8 md:flex">
          <li><Link href="#how"     className="text-sm text-slate-400 no-underline transition hover:text-slate-100">Product</Link></li>
          <li><Link href="#how"     className="text-sm text-slate-400 no-underline transition hover:text-slate-100">How it Works</Link></li>
          <li><Link href="#holders" className="text-sm text-slate-400 no-underline transition hover:text-slate-100">For Holders</Link></li>
          <li><Link href="#"        className="text-sm text-slate-400 no-underline transition hover:text-slate-100">Docs</Link></li>
        </ul>

        <Link
          href="/console"
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-violet-500 px-[18px] py-2 text-[13.5px] font-medium text-white no-underline shadow-[0_0_18px_rgba(139,92,246,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-violet-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.38)]"
        >
          Get Started
          <ArrowIcon />
        </Link>
      </nav>
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-[90px] pt-[130px] text-center">
        <div className="animate-up mb-[30px] inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 py-1.5 pl-2 pr-3.5 font-['JetBrains_Mono'] text-[11px] tracking-[0.06em] text-violet-300">
          <span className="h-1.5 w-1.5 animate-glow-dot rounded-full bg-violet-500" />
          BUILT ON
          <Image src="/Logos/bags-logo.svg" alt="bags" width={20} height={20} />
          BAGS PROTOCOL
        </div>
        <div className="w-full max-w-[1080px] flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="animate-up animation-delay-100 font-['Space_Grotesk'] text-[clamp(32px,6vw,72px)] font-bold leading-[1.05] tracking-[-0.035em]">
              Find your strongest holders.<br />
              <em className="not-italic bg-gradient-to-br from-violet-200 via-violet-500 to-purple-700 bg-clip-text text-transparent">
                Reward the ones who believe.
              </em>
            </h1>
          </div>
          <div className="relative flex-1 w-full h-[320px] overflow-hidden lg:h-[480px] lg:overflow-visible">

            <div
              className="absolute inset-0"
              style={{
                transform: "translateX(80px) scale(0.82)",
                transformOrigin: "right center",
                opacity: 0.18,
                filter: "blur(2px)",
                zIndex: 1,
              }}
            >
              <Image
                src="/Images/follow2.png"
                alt=""
                fill
                className="object-contain object-center lg:object-left"
                style={{ mixBlendMode: "luminosity" }}
              />
            </div>

            <div
              className="absolute inset-0"
              style={{
                transform: "translateX(40px) scale(0.91)",
                transformOrigin: "right center",
                opacity: 0.42,
                filter: "blur(0.8px)",
                zIndex: 2,
              }}
            >
              <Image
                src="/Images/follow2.png"
                alt=""
                fill
                className="object-contain object-center lg:object-left"
                style={{ mixBlendMode: "luminosity" }}
              />
            </div>

            <div
              className="absolute inset-0"
              style={{ opacity: 0.88, zIndex: 3 }}
            >
              <Image
                src="/Images/follow2.png"
                alt="followers"
                fill
                className="object-contain object-center lg:object-left"
                style={{ mixBlendMode: "luminosity" }}
                priority
              />
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 4,
                background: `
                  linear-gradient(to right,  #050810 0%, transparent 22%, transparent 75%, #050810 100%),
                  linear-gradient(to bottom, #050810 0%, transparent 18%, transparent 75%, #050810 100%)
                `,
              }}
            />
          </div>
        </div>

        <div className="animate-up animation-delay-200 mx-auto mb-11 mt-10 flex max-w-[760px] flex-col items-start gap-5 md:flex-row md:items-start md:gap-0">
          {[
            ["01", "Connect a Bags token",        "Link your token — Pulse indexes all holders on-chain instantly."],
            ["02", "Find your strongest holders",  "Holders verify their social presence. Pulse scores conviction across holdings, duration, and reach."],
            ["03", "Reward with fee-share",         "Open a bonus window that routes your Bags fee-share directly to ranked believers — on-chain, transparent."],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="relative flex flex-1 flex-col items-center gap-2.5 px-6 text-center md:[&:not(:first-child)]:before:absolute md:[&:not(:first-child)]:before:left-0 md:[&:not(:first-child)]:before:top-[22px] md:[&:not(:first-child)]:before:h-7 md:[&:not(:first-child)]:before:w-px md:[&:not(:first-child)]:before:bg-white/[0.055]"
            >
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] tracking-[0.1em] text-violet-300">
                {number}
              </span>
              <div className="text-sm font-normal leading-[1.55] text-slate-400">
                <strong className="mb-1 block text-[15px] font-semibold text-slate-100">{title}</strong>
                {text}
              </div>
            </div>
          ))}
        </div>

        <div className="animate-up animation-delay-300 flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton href="/console">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" />
            </svg>
            Connect your Bags token
            <ArrowIcon className="transition-transform group-hover:translate-x-1" />
          </PrimaryButton>
          <SecondaryButton href="#">See demo</SecondaryButton>
          <SecondaryButton href="#">Launch Pulse token on Bags</SecondaryButton>
        </div>
      </section>

      <section className="reveal relative z-10 mx-auto mt-20 max-w-[960px] px-6">
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-0">
          <TokenPanel />
          <FlowArrow />
          <ScorePanel />
          <FlowArrow />
          <RewardPanel />
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-[1080px] px-6 py-[110px]">
        <div className="reveal">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="mb-[60px] font-['Space_Grotesk'] text-[clamp(26px,3.8vw,42px)] font-bold leading-[1.1] tracking-[-0.025em]">
            Three steps. One honest leaderboard.
          </h2>
        </div>

        <div className="reveal grid grid-cols-1 gap-px overflow-hidden rounded-[20px] bg-white/[0.055] md:grid-cols-3">
          <StepCard step="STEP 01" title="Connect your token" color="violet">
            Link your Bags token to Pulse. We index your full on-chain holder list automatically — no CSV uploads, no manual work.
          </StepCard>
          <StepCard step="STEP 02" title="Holders verify identity" color="green">
            Each holder links their wallet to their social profile. Pulse builds a verified conviction score — holdings, duration, reach, engagement.
          </StepCard>
          <StepCard step="STEP 03" title="Open the reward window" color="violet">
            Route your Bags fee-share to top-ranked holders through a time-boxed bonus window. Transparent, on-chain, no intermediary.
          </StepCard>
        </div>
      </section>

      <section id="holders" className="relative z-10 mx-auto max-w-[1080px] px-6 pb-[110px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="reveal">
            <SectionEyebrow>For Holders</SectionEyebrow>
            <h2 className="font-['Space_Grotesk'] text-[clamp(26px,3.8vw,42px)] font-bold leading-[1.1] tracking-[-0.025em]">
              Your conviction,<br />made visible
            </h2>
            <div className="mt-8 flex flex-col gap-[18px]">
              <BenefitCard title="Ranked on every leaderboard">
                Your Pulse Score appears publicly on every creator&apos;s holder table. Conviction and reach determine your rank.
              </BenefitCard>
              <BenefitCard title="Earn Bags fee-share">
                Creators open bonus windows that route fee-share to their top Pulse holders. Higher rank means a larger cut of the pool.
              </BenefitCard>
              <BenefitCard title="One profile, many tokens">
                Verify once. Your Pulse profile carries across every token using Pulse — a single on-chain proof of belief.
              </BenefitCard>
            </div>
          </div>

          <ProfileMockup />
        </div>
      </section>

      <section className="relative z-10 px-6 pb-[140px] pt-[90px] text-center">
        <div className="reveal relative mx-auto max-w-[620px] overflow-hidden rounded-[28px] border border-violet-500/20 bg-[#0d1120] px-8 py-[60px] shadow-[0_0_90px_rgba(139,92,246,0.07),0_40px_80px_rgba(0,0,0,0.5)] md:px-11">
          <div className="pointer-events-none absolute -inset-20 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_0%,transparent_65%)]" />
          <h2 className="relative mb-3 font-['Space_Grotesk'] text-[clamp(24px,3.5vw,36px)] font-bold tracking-[-0.025em]">
            Ready to reward<br />
            <span className="bg-gradient-to-br from-violet-200 to-violet-500 bg-clip-text text-transparent">
              your real believers?
            </span>
          </h2>
          <p className="relative mb-8 text-[15px] font-light leading-[1.65] text-slate-400">
            Connect your Bags token, find your strongest holders ranked by conviction, and open a fee-share bonus window for the ones who show up.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/console">
              Connect your Bags token
              <ArrowIcon className="transition-transform group-hover:translate-x-1" />
            </PrimaryButton>
            <SecondaryButton href="#">See demo</SecondaryButton>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/15 bg-[#0d1120] px-5 py-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.05)_0%,transparent_60%)]">
      <div className="relative">{children}</div>
    </div>
  );
}

function TokenPanel() {
  return (
    <Panel>
      <PanelLabel color="bg-violet-500">YOUR BAGS TOKEN</PanelLabel>
      <div className="mb-2 flex items-center gap-2.5 rounded-[9px] border border-white/[0.055] bg-white/[0.03] px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 font-['JetBrains_Mono'] text-[9px] font-medium text-white">$</div>
        <div className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-slate-100">Your Token</span>
          <span className="mt-0.5 block font-['JetBrains_Mono'] text-[10px] text-slate-600">holders load after connection</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-[9px] border border-dashed border-violet-500/30 bg-violet-500/5 px-3 py-2 text-xs text-violet-300">
        Connect wallet to link your token
      </div>
    </Panel>
  );
}

function ScorePanel() {
  return (
    <Panel>
      <PanelLabel color="bg-violet-300">PULSE SCORING SIGNALS</PanelLabel>
      <div className="flex flex-col gap-2.5">
        <ScoreBar label="Holdings weight" value="highest" width="88%" />
        <ScoreBar label="Hold duration"   value="high"    width="72%" />
        <ScoreBar label="Social reach"    value="medium"  width="55%" />
        <ScoreBar label="Engagement"      value="contributes" width="38%" />
      </div>
      <div className="mt-3.5 border-t border-white/[0.055] pt-3 text-[11px] text-slate-600">
        Scores populate once holders verify
      </div>
    </Panel>
  );
}

function RewardPanel() {
  return (
    <Panel>
      <PanelLabel color="bg-green-500">FEE-SHARE DISTRIBUTION</PanelLabel>
      <div className="flex flex-col gap-2">
        <RewardRow rank="#1 — top score" width="90%" label="largest share"  opacity="opacity-100" />
        <RewardRow rank="#2 — ranked"    width="65%" label="proportional"   opacity="opacity-75"  />
        <RewardRow rank="#3 — ranked"    width="45%" label="proportional"   opacity="opacity-50"  />
      </div>
      <div className="mt-3 border-t border-white/[0.055] pt-3 text-[11px] text-slate-600">
        Amounts depend on fee pool size and rank
      </div>
    </Panel>
  );
}

function PanelLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.08em] text-slate-600">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
      {children}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex w-full rotate-90 items-center justify-center py-2 text-slate-600 md:w-10 md:rotate-0 md:py-0">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11h14M13 6l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ScoreBar({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-600">{label}</span>
        <span className="font-['JetBrains_Mono'] text-[11px] text-slate-600">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300 animate-bar-grow" style={{ width }} />
      </div>
    </div>
  );
}

function RewardRow({ rank, width, label, opacity }: { rank: string; width: string; label: string; opacity: string }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border border-white/[0.055] bg-white/[0.025] px-2.5 py-2 ${opacity}`}>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md border border-violet-500/20 bg-violet-500/25" />
        <span className="font-['JetBrains_Mono'] text-[10px] text-slate-600">{rank}</span>
      </div>
      <div className="mx-2.5 h-[3px] flex-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-green-500" style={{ width }} />
      </div>
      <span className="rounded bg-green-500/10 px-2 py-0.5 font-['JetBrains_Mono'] text-[11px] font-semibold text-green-500">{label}</span>
    </div>
  );
}

function StepCard({ step, title, children, color }: { step: string; title: string; children: React.ReactNode; color: "violet" | "green" | "amber" }) {
  const colorMap = {
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-500",
    green:  "border-green-500/15  bg-green-500/10  text-green-500",
    amber:  "border-amber-500/15  bg-amber-500/10  text-amber-500",
  };

  return (
    <div className="bg-[#0d1120] px-[30px] py-9 transition hover:bg-[#111827]">
      <div className="mb-5 flex items-center gap-2.5 font-['JetBrains_Mono'] text-[10px] tracking-[0.1em] text-slate-600 after:h-px after:flex-1 after:bg-white/[0.055]">
        {step}
      </div>
      <div className={`mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border ${colorMap[color]}`}>
        <span className="h-3 w-3 rounded-full bg-current" />
      </div>
      <h3 className="mb-2 font-['Space_Grotesk'] text-lg font-semibold tracking-[-0.02em] text-slate-100">{title}</h3>
      <p className="text-sm font-light leading-[1.65] text-slate-400">{children}</p>
    </div>
  );
}

function BenefitCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-[14px] border border-white/[0.055] bg-violet-500/[0.02] p-5 transition hover:border-violet-500/20 hover:bg-violet-500/[0.04]">
      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-violet-500/20 bg-violet-500/10 text-violet-500">
        <span className="h-3 w-3 rounded-full bg-current" />
      </div>
      <div>
        <h4 className="mb-1 text-sm font-semibold text-slate-100">{title}</h4>
        <p className="text-[13px] font-light leading-[1.6] text-slate-400">{children}</p>
      </div>
    </div>
  );
}

