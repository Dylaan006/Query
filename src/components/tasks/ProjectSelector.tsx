'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/app/actions';
import { Folder, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { Popover } from '@/components/ui/Popover';
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    name: string;
    color: string;
    isInbox: boolean;
}

interface ProjectSelectorProps {
    selectedProjectId?: string;
    onSelect: (projectId: string) => void;
}

export default function ProjectSelector({ selectedProjectId, onSelect }: ProjectSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const selectedProject = projects?.find((p: Project) => p.id === selectedProjectId);

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            trigger={
                <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                    <Folder className="w-4 h-4" />
                    <span className="truncate max-w-[120px]">
                        {selectedProject ? selectedProject.name : 'Inbox'}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            }
            content={
                <div className="flex flex-col p-1 min-w-[200px] max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-xs text-zinc-500">
                            Loading projects...
                        </div>
                    ) : (
                        <>
                            {/* Inbox Option (Explicitly adding if not in list or just as default) */}
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(''); // Assuming empty string is Inbox/No Project
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group"
                            >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-zinc-400" />
                                    <span className={cn("truncate", !selectedProjectId ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-600 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white")}>
                                        Inbox
                                    </span>
                                </div>
                                {!selectedProjectId && (
                                    <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                                )}
                            </button>

                            {projects?.map((project: Project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(project.id);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: project.color || '#808080' }}
                                        />
                                        <span className={cn("truncate", selectedProjectId === project.id ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-600 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white")}>
                                            {project.name}
                                        </span>
                                    </div>
                                    {selectedProjectId === project.id && (
                                        <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                                    )}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            }
        />
    );
}
