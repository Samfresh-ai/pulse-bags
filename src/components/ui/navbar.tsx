"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
     
        <div className="flex items-center gap-2">
           <Image src="/logo.png" width={24} height={24} alt="logo"/>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Product", "How it Works", "For Holders", "Docs"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-foreground/60 hover:text-pulse transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/signup">
            <Button 
              variant="primary" 
              size="md" 
              rightIcon={<MoveRight size={16} />}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};