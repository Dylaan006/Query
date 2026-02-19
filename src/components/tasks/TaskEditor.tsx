import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Flag, Hash, X, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover } from '@/components/ui/Popover';
import { cn } from "@/lib/utils";
import ProjectSelector from './ProjectSelector';
import { useQuery } from '@tanstack/react-query';
import { getProjects, getSections } from '@/app/actions';
import { format } from 'date-fns';

interface TaskEditorProps {
    initialContent?: string;
    initialDescription?: string;
    initialProjectId?: string;
    initialSectionId?: string;
    initialPriority?: number;
    initialDueDate?: string;
    onSubmit: (data: {
        content: string;
        description: string;
        projectId: string;
        sectionId?: string;
        priority: number;
        dueDate?: string | null;
    }) => void;
    onCancel: () => void;
    submitLabel?: string;
}

export default function TaskEditor({
    initialContent = '',
    initialDescription = '',
    initialProjectId = '',
    initialSectionId = '',
    initialPriority = 1,
    initialDueDate = undefined,
    onSubmit,
    onCancel,
    submitLabel = 'Add Task'
}: TaskEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [description, setDescription] = useState(initialDescription);
    const [projectId, setProjectId] = useState(initialProjectId);
    const [sectionId, setSectionId] = useState(initialSectionId);
    const [priority, setPriority] = useState(initialPriority);
    const [dueDate, setDueDate] = useState<Date | undefined>(
        initialDueDate ? new Date(initialDueDate) : undefined
    );
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);

    // Fetch sections when projectId changes
    const { data: sections } = useQuery({
        queryKey: ['sections', projectId],
        queryFn: () => projectId ? getSections(projectId) : Promise.resolve([]),
        enabled: !!projectId,
    });

    // Reset section when project changes, unless it matches initial (loading state)
    useEffect(() => {
        if (projectId !== initialProjectId) {
            setSectionId('');
        }
    }, [projectId, initialProjectId]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit({
            content,
            description,
            projectId,
            sectionId: sectionId || undefined,
            priority,
            dueDate: dueDate ? dueDate.toISOString() : null
        });
    };

    const priorities = [
        { value: 4, label: 'Priority 1', color: 'text-red-500', iconColor: 'text-red-500' },
        { value: 3, label: 'Priority 2', color: 'text-yellow-500', iconColor: 'text-yellow-500' },
        { value: 2, label: 'Priority 3', color: 'text-blue-500', iconColor: 'text-blue-500' },
        { value: 1, label: 'Priority 4', color: 'text-zinc-500', iconColor: 'text-zinc-400' },
    ];

    const currentSection = sections?.find((s: any) => s.id === sectionId);

    return (
        <form onSubmit={handleSubmit} className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl bg-white dark:bg-zinc-900 shadow-sm overflow-visible">
            <div className="p-3 space-y-2">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Task name"
                    className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
                    autoFocus
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full bg-transparent text-xs text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-500 outline-none resize-none"
                />

                <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <Popover
                        isOpen={isDateOpen}
                        onOpenChange={setIsDateOpen}
                        trigger={
                            <button
                                type="button"
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border border-transparent",
                                    dueDate
                                        ? "text-[var(--brand)] bg-[var(--brand)]/10 hover:bg-[var(--brand)]/20"
                                        : "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                            >
                                <CalendarIcon className="w-4 h-4" />
                                <span className={cn("truncate", dueDate ? "font-semibold" : "")}>
                                    {dueDate ? format(dueDate, 'MMM d') : 'Date'}
                                </span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", isDateOpen ? 'rotate-180' : '')} />
                            </button>
                        }
                        content={
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={(date) => {
                                    setDueDate(date);
                                    setIsDateOpen(false);
                                }}
                                initialFocus
                            />
                        }
                    />

                    <Popover
                        isOpen={isPriorityOpen}
                        onOpenChange={setIsPriorityOpen}
                        trigger={
                            <button
                                type="button"
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border border-transparent",
                                    priority === 4
                                        ? "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                        : priority === 3
                                            ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                                            : priority === 2
                                                ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                : "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                )}
                            >
                                <Flag className={cn("w-4 h-4", priority !== 1 ? "fill-current" : "")} />
                                <span>
                                    {priority === 4 ? 'Priority 1' : priority === 3 ? 'Priority 2' : priority === 2 ? 'Priority 3' : 'Priority'}
                                </span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", isPriorityOpen ? 'rotate-180' : '')} />
                            </button>
                        }
                        content={
                            <div className="flex flex-col p-1 min-w-[160px]">
                                {priorities.map((p) => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => {
                                            setPriority(p.value);
                                            setIsPriorityOpen(false);
                                        }}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Flag className={cn("w-4 h-4", p.iconColor, p.value !== 1 ? "fill-current" : "")} />
                                            <span className={cn(p.value === priority ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-600 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white")}>
                                                {p.label}
                                            </span>
                                        </div>
                                        {priority === p.value && (
                                            <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        }
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <ProjectSelector selectedProjectId={projectId} onSelect={setProjectId} />

                    {projectId && sections && sections.length > 0 && (
                        <>
                            {/* Section Selector */}
                            <Popover
                                isOpen={isSectionOpen}
                                onOpenChange={setIsSectionOpen}
                                trigger={
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                                    >
                                        <Hash className="w-4 h-4" />
                                        <span className="truncate max-w-[120px]">
                                            {currentSection ? currentSection.name : 'No Section'}
                                        </span>
                                        <ChevronDown className={cn("w-3 h-3 transition-transform", isSectionOpen ? 'rotate-180' : '')} />
                                    </button>
                                }
                                content={
                                    <div className="flex flex-col p-1 min-w-[200px] max-h-[200px] overflow-y-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSectionId('');
                                                setIsSectionOpen(false);
                                            }}
                                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-zinc-300 dark:bg-zinc-600" />
                                                <span className={cn("truncate", !sectionId ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-600 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white")}>
                                                    No Section
                                                </span>
                                            </div>
                                            {!sectionId && (
                                                <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                                            )}
                                        </button>
                                        {sections.map((section: any) => (
                                            <button
                                                key={section.id}
                                                type="button"
                                                onClick={() => {
                                                    setSectionId(section.id);
                                                    setIsSectionOpen(false);
                                                }}
                                                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-zinc-300 dark:bg-zinc-600" />
                                                    <span className={cn("truncate", sectionId === section.id ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-600 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white")}>
                                                        {section.name}
                                                    </span>
                                                </div>
                                                {sectionId === section.id && (
                                                    <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                }
                            />
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!content.trim()}
                        className={cn(content.trim() ? "bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white" : "")}
                    >
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
