import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Circle, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import TaskEditor from './TaskEditor';
import { Button } from '@/components/ui/Button';

interface UrgentTaskCardProps {
    id: string;
    content: string;
    description?: string;
    projectName?: string;
    projectColor?: string;
    priority?: number;
    due?: { date: string; string: string; is_recurring: boolean };
    onComplete: (id: string) => void;
    onUpdate?: (id: string, data: any) => void;
    onDelete?: (id: string) => void;
    isCompleting: boolean;
}

export default function UrgentTaskCard({
    id,
    content,
    description,
    projectName,
    projectColor,
    priority = 4,
    due,
    onComplete,
    onUpdate,
    onDelete,
    isCompleting
}: UrgentTaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = (data: any) => {
        onUpdate?.(id, data);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="relative z-30">
                <TaskEditor
                    initialContent={content}
                    initialDescription={description}
                    // initialProjectId={projectId} // We might need to pass projectId prop if we want to edit it
                    initialPriority={priority}
                    initialDueDate={due?.string}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                    submitLabel="Save"
                />
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col p-5 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 hover:border-zinc-600 shadow-xl relative overflow-hidden group"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-start justify-between mb-3 relative z-10 transition-opacity">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wider text-[var(--brand)] uppercase">Urgent</span>
                </div>

                <div className="flex items-center gap-2">
                    {projectName && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700">
                            {projectColor && (
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: projectColor }}
                                />
                            )}
                            <span className="text-[10px] font-medium text-zinc-400">
                                {projectName}
                            </span>
                        </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                            <Pencil className="w-3 h-3 text-zinc-400 hover:text-zinc-200" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete?.(id)}>
                            <Trash2 className="w-3 h-3 text-zinc-400 hover:text-red-400" />
                        </Button>
                    </div>
                </div>
            </div>

            <h3
                className="text-zinc-100 font-semibold text-lg leading-snug mb-2 line-clamp-2 cursor-pointer hover:underline decoration-zinc-600/50 underline-offset-4"
                onClick={() => setIsEditing(true)}
            >
                {content}
            </h3>

            {description && (
                <p className="text-zinc-500 text-sm line-clamp-2 mb-4 cursor-pointer" onClick={() => setIsEditing(true)}>
                    {description}
                </p>
            )}

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-700/50">
                <div className="flex items-center gap-3 text-zinc-400">
                    <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{due?.string || 'Today'}</span>
                    </div>
                </div>

                <button
                    onClick={() => onComplete(id)}
                    disabled={isCompleting}
                    className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300",
                        isCompleting
                            ? "bg-[var(--brand)]/20 border-[var(--brand)] text-[var(--brand)]"
                            : "border-zinc-600 text-zinc-400 hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--brand)]/10"
                    )}
                >
                    {isCompleting ? (
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                        <Circle className="w-5 h-5" />
                    )}
                </button>
            </div>
        </motion.div>
    );
}
