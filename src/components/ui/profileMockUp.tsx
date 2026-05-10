import React from 'react'

export default function ProfileMockup() {
  return (
    <div className="reveal rounded-[20px] border border-violet-500/15 bg-[#0d1120] p-6 shadow-[0_0_50px_rgba(139,92,246,0.06)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[42px] w-[42px] rounded-[11px] bg-gradient-to-br from-violet-600 to-indigo-600" />
          <div>
            <div className="text-sm font-semibold text-slate-100">Your public profile</div>
            <div className="mt-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-600">wallet linked after verification</div>
          </div>
        </div>
        <div className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] text-violet-300">Your rank</div>
      </div>

      <div className="mb-[18px] border-y border-white/[0.055] py-5 text-center">
        <span className="mb-2 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600">Pulse Score</span>
        <div className="flex items-center justify-center">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="45" cy="45" r="36" fill="none" stroke="url(#pulseRing)" strokeWidth="6" strokeLinecap="round" strokeDasharray="226" strokeDashoffset="56" transform="rotate(-90 45 45)" />
            <defs>
              <linearGradient id="pulseRing" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <text x="45" y="49" textAnchor="middle" fill="#3d4f63" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1">LIVE</text>
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <ProfileMetric label="Holdings weight" value="↑ most" width="82%" />
        <ProfileMetric label="Hold duration"   value="↑ high" width="70%" />
        <ProfileMetric label="Social reach"    value="mid"    width="54%" />
        <ProfileMetric label="Engagement"      value="mid"    width="38%" />
      </div>

      <div className="mt-[18px] flex items-center justify-between border-t border-white/[0.055] pt-4">
        <span className="text-xs text-slate-600">Fee-share reward</span>
        <span className="font-['JetBrains_Mono'] text-[11px] text-slate-600">proportional to rank · paid on window close</span>
      </div>
    </div>
  );
}

function ProfileMetric({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="min-w-[105px] text-xs text-slate-400">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300" style={{ width }} />
      </div>
      <span className="min-w-[30px] text-right font-['JetBrains_Mono'] text-[11px] text-slate-600">{value}</span>
    </div>
  );
}