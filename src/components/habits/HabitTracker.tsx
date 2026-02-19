'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Flame, Plus, Trash2 } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

// Database Types
type HabitRecord = {
    id: string;
    name: string;
    streak: number; // Calculated on client
    completedDates: string[]; // Calculated on client
    habit_logs: { date: string }[];
}

export default function HabitTracker() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const queryClient = useQueryClient();
    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch Habits
    const { data: habits = [], isLoading } = useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const { data: habitsData, error: habitsError } = await supabase
                .from('habits')
                .select('*, habit_logs(date)')
                .order('created_at', { ascending: true });

            if (habitsError) throw habitsError;

            // Transform data structure
            return habitsData.map((habit: any) => {
                const completedDates = habit.habit_logs.map((log: any) => log.date);

                // Calculate streak (simplified)
                let streak = 0;
                const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                let currentDate = dayjs();

                // Check if today is done, if not, check yesterday to start streak
                if (sortedDates.includes(currentDate.format('YYYY-MM-DD'))) {
                    streak++;
                    currentDate = currentDate.subtract(1, 'day');
                } else {
                    if (sortedDates.includes(currentDate.subtract(1, 'day').format('YYYY-MM-DD'))) {
                        currentDate = currentDate.subtract(1, 'day');
                    } else {
                        // Streak broken
                    }
                }

                while (sortedDates.includes(currentDate.format('YYYY-MM-DD'))) {
                    streak++;
                    currentDate = currentDate.subtract(1, 'day');
                }

                return {
                    id: habit.id,
                    name: habit.name,
                    streak,
                    completedDates
                };
            });
        }
    });

    // Toggle Mutation
    const toggleMutation = useMutation({
        mutationFn: async ({ habitId, date }: { habitId: string, date: string }) => {
            // Check if exists
            const { data: existing } = await supabase
                .from('habit_logs')
                .select('*')
                .eq('habit_id', habitId)
                .eq('date', date)
                .maybeSingle();

            if (existing) {
                // Delete
                const { error } = await supabase
                    .from('habit_logs')
                    .delete()
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('habit_logs')
                    .insert({ habit_id: habitId, date });
                if (error) throw error;
            }
        },
        onMutate: async ({ habitId, date }) => {
            // Optimistic Update
            await queryClient.cancelQueries({ queryKey: ['habits'] });
            const previousHabits = queryClient.getQueryData(['habits']);

            queryClient.setQueryData(['habits'], (old: HabitRecord[] | undefined) => {
                if (!old) return [];
                return old.map(h => {
                    if (h.id !== habitId) return h;
                    const exists = h.completedDates.includes(date);
                    return {
                        ...h,
                        completedDates: exists
                            ? h.completedDates.filter(d => d !== date)
                            : [...h.completedDates, date]
                    };
                });
            });

            return { previousHabits };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['habits'], context?.previousHabits);
            console.error("Failed to toggle habit", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
    });

    const toggleHabit = (habitId: string, date: Date) => {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        toggleMutation.mutate({ habitId, date: dateStr });
    };

    // New Habit Mutation
    const createHabitMutation = useMutation({
        mutationFn: async (name: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase.from('habits').insert({
                name,
                user_id: user.id
            });
            if (error) throw error;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
    });

    const handleCreateHabit = () => {
        const name = prompt("Enter habit name:");
        if (name) createHabitMutation.mutate(name);
    };

    const deleteHabitMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('habits').delete().eq('id', id);
            if (error) throw error;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
    });


    const getDayContent = (day: Date) => {
        const dateStr = dayjs(day).format('YYYY-MM-DD');
        const completedCount = habits.filter((h: HabitRecord) => h.completedDates.includes(dateStr)).length;
        const totalHabits = habits.length;

        if (totalHabits === 0 || completedCount === 0) return null;

        const intensity = completedCount / totalHabits;
        let colorClass = 'bg-red-100 dark:bg-red-900/30';
        if (intensity > 0.3) colorClass = 'bg-red-300 dark:bg-red-700/50';
        if (intensity > 0.6) colorClass = 'bg-red-500 dark:bg-red-600';

        return (
            <div className={`w-full h-full absolute inset-0 rounded-full z-[-1] ${colorClass} opacity-80`} />
        );
    };

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading habits...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
            {/* Calendar Section */}
            <div className="col-span-1 md:col-span-5 flex justify-center">
                <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{
                            hasHabits: (date) => habits.some((h: HabitRecord) => h.completedDates.includes(dayjs(date).format('YYYY-MM-DD')))
                        }}
                        modifiersClassNames={{
                            selected: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        }}
                        components={{
                            DayContent: ({ date }) => (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <span className="z-10">{date.getDate()}</span>
                                    {getDayContent(date)}
                                </div>
                            )
                        }}
                        className="dark:text-zinc-100"
                    />
                </div>
            </div>

            {/* Habits List Section */}
            <div className="col-span-1 md:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                        Habits for {dayjs(selectedDate).format('MMMM D, YYYY')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400 mr-2">
                            {habits.filter((h: HabitRecord) => h.completedDates.includes(dayjs(selectedDate).format('YYYY-MM-DD'))).length}/{habits.length} completed
                        </span>
                        <button
                            onClick={handleCreateHabit}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                            title="Add Habit"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {habits.length === 0 && (
                            <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                No habits tracked yet. Click + to add one.
                            </div>
                        )}
                        {habits.map((habit: HabitRecord) => {
                            const isCompleted = habit.completedDates.includes(dayjs(selectedDate).format('YYYY-MM-DD'));
                            return (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`
                                flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group
                                ${isCompleted
                                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                                            : 'bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
                            `}
                                    onClick={() => selectedDate && toggleHabit(habit.id, selectedDate)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center transition-colors
                                    ${isCompleted ? 'bg-red-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}
                                `}>
                                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />}
                                        </div>
                                        <div>
                                            <h4 className={`font-medium ${isCompleted ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                {habit.name}
                                            </h4>
                                            <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                                <Flame className="w-3 h-3 fill-orange-500" />
                                                {habit.streak} day streak
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete habit?')) deleteHabitMutation.mutate(habit.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
