'use client';

import {
    Inbox,
    Calendar,
    CalendarDays,
    Hash,
    Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/app/actions';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecondarySidebarProps {
    className?: string;
    activeFilter?: string;
    onFilterChange?: (filter: string) => void;
}

export default function SecondarySidebar({ className, activeFilter = 'inbox', onFilterChange }: SecondarySidebarProps) {
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
        staleTime: 1000 * 60 * 5,
    });

    const NavItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => {
        const isActive = activeFilter === id;
        return (
            <button
                onClick={() => onFilterChange?.(id)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                        ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
            >
                <Icon className={cn("w-4 h-4", isActive ? "text-[var(--brand)]" : "text-zinc-500")} />
                {label}
            </button>
        );
    };

    return (
        <aside className={cn(
            "w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col",
            className
        )}>
            {/* Workspace Header - Removed as per user request */}
            <div className="h-4" />

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {/* Main Links */}
                <div className="space-y-1">
                    <NavItem icon={Inbox} label="Inbox" id="inbox" />
                    <NavItem icon={Calendar} label="Today" id="today" />
                    <NavItem icon={CalendarDays} label="Scheduled" id="upcoming" />
                </div>

                {/* Projects */}
                <div className="space-y-1">
                    <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <span>Projects</span>

                    </div>

                    {isLoading ? (
                        <div className="px-3 py-2 text-sm text-zinc-500">Loading...</div>
                    ) : (
                        projects?.map((project: any) => (
                            <button
                                key={project.id}
                                onClick={() => onFilterChange?.(project.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                    activeFilter === project.id
                                        ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                )}
                            >
                                <Hash className="w-3.5 h-3.5" />
                                <span className="truncate">{project.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-zinc-800 mt-auto">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Page</span>
                </button>
            </div>
        </aside>
    );
}
