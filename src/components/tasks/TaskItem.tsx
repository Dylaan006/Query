'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, Calendar, Pencil, Trash2, Flag } from 'lucide-react';
import TaskEditor from './TaskEditor';
import { Button } from '@/components/ui/Button';
import { cn } from "@/lib/utils";


interface TaskItemProps {
    id: string;
    content: string;
    description?: string;
    projectId?: string;
    sectionId?: string;
    projectName?: string;
    projectColor?: string;
    priority?: number;
    due?: { date: string; string: string; is_recurring: boolean };
    onComplete: (id: string) => void;
    onUpdate?: (id: string, data: any) => void;
    onDelete?: (id: string) => void;
    isCompleting: boolean;
}

export default function TaskItem({
    id,
    content,
    description,
    projectId,
    sectionId, // Destructure sectionId
    projectName,
    projectColor,
    priority = 1,
    due,
    onComplete,
    onUpdate,
    onDelete,
    isCompleting
}: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = (data: any) => {
        onUpdate?.(id, data);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="py-2 relative z-30">
                <TaskEditor
                    initialContent={content}
                    initialDescription={description}
                    initialProjectId={projectId}
                    initialSectionId={sectionId} // Added initialSectionId
                    initialPriority={priority}
                    initialDueDate={due?.date} // Changed from due?.string to due?.date
                    onSubmit={(data) => { // Modified onSubmit
                        onUpdate?.(id, data);
                        setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                    submitLabel="Save"
                />
            </div>
        );
    }

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileHover={{ y: -2 }}
            className="group flex items-start justify-between p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-300"
        >
            <div className="flex items-start gap-4 flex-1">
                <button
                    onClick={() => onComplete(id)}
                    disabled={isCompleting}
                    className="mt-1 text-zinc-400 hover:text-[var(--brand)] active:text-[var(--brand)] transition-colors disabled:opacity-50 relative shrink-0"
                >
                    <Circle className="w-5 h-5 stroke-[1.5]" />
                    {isCompleting && (
                        <span className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-full animate-pulse" />
                    )}
                </button>

                <div className="flex flex-col gap-1.5 w-full cursor-pointer" onClick={() => setIsEditing(true)}>
                    <span className="text-zinc-700 dark:text-zinc-200 font-medium leading-snug group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {content}
                    </span>
                    {description && (
                        <p className="text-xs text-zinc-500 line-clamp-2">{description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                        {due && (
                            <div className="flex items-center gap-1 group-hover:text-[var(--brand)] transition-colors">
                                <Calendar className="w-3 h-3" />
                                <span>{due.string}</span>
                            </div>
                        )}

                        {projectName && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                                {projectColor && (
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: projectColor }}
                                    />
                                )}
                                <span className="font-medium text-10">{projectName}</span>
                            </div>
                        )}

                        {priority > 1 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                                <Flag className={cn(
                                    "w-3 h-3 fill-current",
                                    priority === 4 ? "text-red-500" :
                                        priority === 3 ? "text-yellow-500" :
                                            priority === 2 ? "text-blue-500" : "text-zinc-500"
                                )} />
                                <span className={cn(
                                    "font-medium text-10",
                                    priority === 4 ? "text-red-500" :
                                        priority === 3 ? "text-yellow-500" :
                                            priority === 2 ? "text-blue-500" : "text-zinc-500"
                                )}>
                                    {priority === 4 ? 'P1' : priority === 3 ? 'P2' : 'P3'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete?.(id)}>
                        <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                    </Button>
                </div>
            </div>
        </motion.li>
    );
}
