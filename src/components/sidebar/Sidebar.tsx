'use client';

import {
    CheckSquare,
    FileText,
    Calendar,
    Settings,
    Home,
    LayoutGrid,
    Search,
    BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from "@/lib/utils";

type Tab = 'tasks' | 'notes' | 'calendar' | 'habits';

interface SidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    className?: string;
}

export default function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
    const navItems = [
        { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
        { id: 'notes', icon: FileText, label: 'Notes' },
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'habits', icon: LayoutGrid, label: 'Habits' },
    ];

    return (
        <aside className={cn("fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-8 bg-zinc-900 border-r border-zinc-800 z-50 transition-all duration-300", className)}>
            {/* Brand / Logo */}
            <div className="mb-10 p-3 bg-[var(--brand)] rounded-xl shadow-lg shadow-[var(--brand)]/40">
                <Home className="w-6 h-6 text-white" />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col gap-6 w-full items-center">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id as Tab)}
                            className="relative group w-12 h-12 flex items-center justify-center"
                            aria-label={item.label}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-[var(--brand)]/10 rounded-xl border-l-2 border-[var(--brand)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Hover effect */}
                            <div className="absolute inset-0 rounded-xl bg-zinc-800/0 group-hover:bg-zinc-800/50 transition-colors duration-200" />

                            <Icon
                                className={`relative z-10 w-6 h-6 transition-colors duration-200 ${isActive ? 'text-[var(--brand)]' : 'text-zinc-500 group-hover:text-zinc-300'
                                    }`}
                            />

                            {/* Tooltip */}
                            <span className="absolute left-14 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-6 items-center mt-auto pb-4">
                <button className="relative group w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>

                {/* User Profile Placeholder */}
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors">
                    <div className="w-full h-full bg-gradient-to-tr from-orange-300 to-amber-200 opacity-80" />
                </div>
            </div>
        </aside>
    );
}
