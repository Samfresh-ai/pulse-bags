"use client"
import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  BarChart3, 
  Settings,
  LogOut,
} from 'lucide-react';

export default function DashboardSidebar({ activeNav, token, onNavChange }: { activeNav: string, token: any, onNavChange?: (id: string) => void }) {
    const { user, logout } = usePrivy();

    const formatWallet = (address?: string) => 
        address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "0x00...0000";

    const navItems = [
        { id: "overview",    label: "Overview",    icon: <LayoutDashboard size={18} /> },
        { id: "holders",      label: "Holders",      icon: <Users size={18} /> },
        { id: "activations",  label: "Activations", icon: <Zap size={18} /> },
        { id: "analytics",    label: "Analytics",   icon: <BarChart3 size={18} /> },
        { id: "settings",     label: "Settings",    icon: <Settings size={18} /> },
    ];

    return (
        <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-white/[0.055] bg-var(--background) sticky top-0 overflow-y-auto">
            <div className="flex h-[64px] items-center border-b border-white/[0.055] px-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-violet-600">
                        <Zap size={14} color="white" />
                    </div>
                    <span className="font-bold text-slate-100">PULSE</span>
                </div>
            </div>

            <div className="border-b border-white/[0.055] px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                        {user?.twitter?.username?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-slate-200">
                            @{user?.twitter?.username ?? "user"}
                        </p>
                        <p className="text-[11px] text-slate-600">Creator</p>
                    </div>
                </div>
            </div>

            <nav className="flex flex-col gap-1 p-3 flex-1">
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeNav === item.id}
                        href={`#${item.id}`}
                        onClick={() => onNavChange?.(item.id)}
                    />
                ))}
            </nav>

            <div className="m-3 rounded-[12px] border border-white/[0.07] bg-[#0d1120] p-4">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {token?.symbol?.[0] ?? "P"}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-slate-200">{token?.name ?? "Pulse Token"}</p>
                        <p className="font-mono text-[9px] text-slate-600">{formatWallet(token?.mint)}</p>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="px-3 pb-4">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 transition-all duration-200 hover:bg-red-500/[0.08] hover:text-red-400"
                >
                    <LogOut size={16} />
                    <span className="text-[13px] font-medium">Log out</span>
                </button>
            </div>
        </aside>
    );
}

function NavItem({ 
    icon, 
    label, 
    active, 
    href,
    onClick,
}: { 
    icon: React.ReactNode, 
    label: string, 
    active: boolean, 
    href: string,
    onClick?: () => void,
}) {
    return (
        <a 
            href={href}
            onClick={(e) => { e.preventDefault(); onClick?.(); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                active 
                ? 'bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
        >
            <span className={active ? "text-violet-400" : ""}>{icon}</span>
            <span className="text-[13px] font-medium">{label}</span>
        </a>
    );
}