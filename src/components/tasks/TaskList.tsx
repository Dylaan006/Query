'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, closeTask, getProjects, updateTask, deleteTask, getSections } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Calendar as CalendarIcon, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import UrgentTaskCard from './UrgentTaskCard';
import ProjectSelector from './ProjectSelector';
import { Button } from '@/components/ui/Button';
import TaskEditor from './TaskEditor';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

import { isToday, isFuture, parseISO, isPast } from 'date-fns';

export default function TaskList({ initialTasks = [], activeFilter = 'inbox' }: { initialTasks?: any[], activeFilter?: string }) {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'alphabetical' | 'priority'>('alphabetical');
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch tasks
    const { data: tasks, isLoading, isError, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: getTasks,
        initialData: initialTasks,
    });

    // Fetch projects
    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
        staleTime: 1000 * 60 * 5,
    });

    // Fetch sections if we are in a project view
    const isProjectView = activeFilter !== 'inbox' && activeFilter !== 'today' && activeFilter !== 'upcoming';
    const { data: sections } = useQuery({
        queryKey: ['sections', activeFilter],
        queryFn: () => isProjectView ? getSections(activeFilter!) : Promise.resolve([]),
        enabled: isProjectView,
    });

    const createTaskMutation = useMutation({
        mutationFn: async (data: any) => {
            return await createTask(data.content, data.projectId, data.description, data.priority, data.dueDate, data.sectionId);
        },
        onSuccess: (newTask) => {
            queryClient.setQueryData(['tasks'], (old: any[]) => [...(old || []), newTask]);
            setIsCreating(false);
        },
    });

    const closeTaskMutation = useMutation({
        mutationFn: closeTask,
        onSuccess: (taskId, variables) => {
            queryClient.setQueryData(['tasks'], (old: any[]) => old.filter((t: any) => t.id !== variables));
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: (taskId, variables) => {
            queryClient.setQueryData(['tasks'], (old: any[]) => old.filter((t: any) => t.id !== variables));
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return await updateTask(id, data);
        },
        onSuccess: () => {
            // We could update manually or invalidate. Invalidation is safer for sync.
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const handleCreateTask = (data: any) => {
        createTaskMutation.mutate(data);
    };

    const handleDeleteClick = (taskId: string) => {
        setTaskToDelete(taskId);
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            deleteTaskMutation.mutate(taskToDelete);
            setTaskToDelete(null);
        }
    };

    if (isError) {
        return <div className="text-red-500 bg-red-50 p-4 rounded-xl text-center">Error: {(error as Error).message}</div>;
    }

    // Filter tasks logic
    const filteredTasks = tasks?.filter((t: any) => {
        if (activeFilter === 'inbox') return true; // Show all for Inbox for now, or filter by !projectId if strictly inbox

        if (activeFilter === 'today') {
            if (!t.due?.date) return false;
            const date = parseISO(t.due.date);
            return isToday(date) || (isPast(date) && !isToday(date)); // Today + Overdue
        }

        if (activeFilter === 'upcoming') {
            if (!t.due?.date) return false;
            const date = parseISO(t.due.date);
            return isFuture(date) && !isToday(date);
        }

        // Project Filter
        return t.projectId === activeFilter;
    }) || [];

    const urgentTasks = filteredTasks.filter((t: any) => t.priority === 4);

    // Sort logic
    const sortTasks = (taskList: any[]) => {
        return [...taskList].sort((a: any, b: any) => { // Use spread to avoid modifying original array
            if (sortOrder === 'priority') {
                return (b.priority || 1) - (a.priority || 1);
            }
            return a.content.localeCompare(b.content);
        });
    };

    const otherTasks = filteredTasks.filter((t: any) => t.priority !== 4);

    // Dynamic Title
    const getTitle = () => {
        if (activeFilter === 'inbox') return 'Inbox';
        if (activeFilter === 'today') return 'Today';
        if (activeFilter === 'upcoming') return 'Scheduled';
        const project = projects?.find((p: any) => p.id === activeFilter);
        return project ? project.name : 'Tasks';
    };

    const getProjectInfo = (projectId?: string) => {
        if (!projectId || !projects) return undefined;
        return projects.find((p: any) => p.id === projectId);
    };

    // Grouping for Project View
    const groupedTasks = isProjectView ? sections?.reduce((acc: any, section: any) => {
        acc[section.id] = {
            id: section.id,
            name: section.name,
            tasks: sortTasks(otherTasks.filter((t: any) => t.sectionId === section.id))
        };
        return acc;
    }, {}) : {};

    // Get tasks with no section (or all tasks if not grouped)
    const noSectionTasks = isProjectView
        ? sortTasks(otherTasks.filter((t: any) => !t.sectionId || (sections && !sections.find((s: any) => s.id === t.sectionId))))
        : sortTasks(otherTasks);

    // If we have sections, we need to handle "No Section" tasks too
    const finalSections = isProjectView && sections && sections.length > 0
        ? [
            ...sections.map((s: any) => groupedTasks[s.id]),
            ...(noSectionTasks.length > 0 ? [{ id: 'no-section', name: 'No Section', tasks: noSectionTasks }] : [])
        ].filter(section => section.tasks.length > 0) // Only include sections that have tasks
        : [{ id: 'all', name: null, tasks: noSectionTasks }]; // Default view for flat lists


    return (
        <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">

            {/* Header & Actions */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{getTitle()}</h1>
                    <p className="text-zinc-500">
                        {mounted ? `You have ${urgentTasks.length + otherTasks.length} tasks remaining.` : 'Loading your tasks...'}
                    </p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            {/* Create Task Form (Expandable) */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        className="mb-8 relative z-30"
                    >
                        <TaskEditor
                            onSubmit={handleCreateTask}
                            onCancel={() => setIsCreating(false)}
                            initialProjectId={activeFilter !== 'inbox' && activeFilter !== 'today' && activeFilter !== 'upcoming' ? activeFilter : undefined}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Urgent Tasks Section (Always at top, ungrouped) */}
            {urgentTasks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--brand)] tracking-wider uppercase">
                        <span className="w-2 h-4 bg-[var(--brand)] rounded-sm" />
                        Urgent
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {urgentTasks.map((task: any) => {
                                const project = getProjectInfo(task.projectId);
                                return (
                                    <UrgentTaskCard
                                        key={task.id}
                                        id={task.id}
                                        content={task.content}
                                        description={task.description}
                                        projectName={project?.name}
                                        projectColor={project?.color}
                                        priority={task.priority} // Pass priority
                                        due={task.due}
                                        onComplete={(id) => closeTaskMutation.mutate(id)}
                                        onUpdate={(id, data) => updateTaskMutation.mutate({ id, data })}
                                        onDelete={handleDeleteClick}
                                        isCompleting={closeTaskMutation.isPending && closeTaskMutation.variables === task.id}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            {/* Other Tasks Section (Grouped by Sections if available) */}
            <section>
                <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 tracking-wider uppercase">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Later
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortOrder(prev => prev === 'alphabetical' ? 'priority' : 'alphabetical')}
                        className="h-6 px-2 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <ArrowUpDown className="w-3 h-3 mr-1.5" />
                        {sortOrder === 'alphabetical' ? 'Alphabetical' : 'Priority'}
                    </Button>
                </div>

                <div className="space-y-8">
                    {finalSections.map((section: any) => (
                        section.tasks.length > 0 && (
                            <div key={section.id}>
                                {section.name && (
                                    <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2 pl-1">
                                        {section.name}
                                    </h3>
                                )}
                                <ul className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {section.tasks.map((task: any) => {
                                            const project = getProjectInfo(task.projectId);
                                            return (
                                                <TaskItem
                                                    key={task.id}
                                                    id={task.id}
                                                    content={task.content}
                                                    description={task.description}
                                                    projectId={task.projectId}
                                                    projectName={project?.name}
                                                    projectColor={project?.color}
                                                    priority={task.priority}
                                                    due={task.due}
                                                    onComplete={(id) => closeTaskMutation.mutate(id)}
                                                    onUpdate={(id, data) => updateTaskMutation.mutate({ id, data })}
                                                    onDelete={handleDeleteClick}
                                                    isCompleting={closeTaskMutation.isPending && closeTaskMutation.variables === task.id}
                                                />
                                            );
                                        })}
                                    </AnimatePresence>
                                </ul>
                            </div>
                        )
                    ))}
                    {finalSections.every(section => section.tasks.length === 0) && urgentTasks.length === 0 && (
                        <div className="text-center py-12 text-zinc-400">
                            <p>No tasks remaining. Enjoy your day!</p>
                        </div>
                    )}
                </div>
            </section>

            <ConfirmationModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
