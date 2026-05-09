import Link from "next/link";
import Image from "next/image";
export function PulseLogo() {
  return (
    <Link href="#" className="flex items-center gap-2.5 no-underline">
      <div className="relative flex h-[33px] w-[33px] rounded-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 shadow-[0_0_18px_rgba(139,92,246,0.38)] before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_55%)]">
       
        <Image src="/Logos/logo.svg" alt="logo" width={50} height={50}
        className="rounded-full"/>
      </div>
      <span className="font-[Inter] drop-shadow-2xl text-[17px] font-bold tracking-[-0.02em] text-foreground">
        PULSE
      </span>
    </Link>
  );
}