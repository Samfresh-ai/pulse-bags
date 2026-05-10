import React from 'react'
import Image from 'next/image';

export default 

function FloatingCoin({
  side,
  top,
  delay = "0s",
}: {
  side: "left" | "right";
  top: string;
  delay?: string;
  size?: number;
}) {
  const posClass = side === "left" ? "left-4 lg:left-8" : "right-4 lg:right-8";
  return (
    <div
      className={`pointer-events-none fixed z-20 ${posClass}`}
      style={{
        top,
        animation: `coinFloat 4s ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <Image
        src="/Images/coins.png"
        alt=""
        width={120}
        height={120}
        className="opacity-70 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
      />
      <style jsx>{`
        @keyframes coinFloat {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
}