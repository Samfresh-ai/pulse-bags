import React from 'react'
import { PulseLogo } from './logo';
import Link from 'next/link';

export default function Footer() {
return(
      <footer className="relative z-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.055] px-6 py-7 text-center md:flex-row md:px-12 md:text-left">
        <PulseLogo />
        <span className="font-['JetBrains_Mono'] text-xs text-slate-600">© 2026 Pulse. Built on Bags Protocol.</span>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Docs', 'X / Twitter'].map((item) => (
            <Link key={item} href="#" className="text-[13px] text-slate-600 no-underline transition hover:text-slate-400">
              {item}
            </Link>
          ))}
        </div>
      </footer>
)
}
