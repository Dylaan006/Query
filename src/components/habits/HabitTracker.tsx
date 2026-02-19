'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Flame } from 'lucide-react';
import 'react-day-picker/dist/style.css';

// Mock data storage for habits (in a real app, uses Supabase)
interface Habit {
    id: string;
    name: string;
    streak: number;
    completedDates: string[]; // ISO date strings YYYY-MM-DD
}

const initialHabits: Habit[] = [
    { id: '1', name: 'Workout', streak: 5, completedDates: [dayjs().format('YYYY-MM-DD')] },
    { id: '2', name: 'Read 20 mins', streak: 12, completedDates: [] },
    { id: '3', name: 'Meditation', streak: 3, completedDates: [] },
];

export default function HabitTracker() {
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const toggleHabit = (habitId: string, date: Date) => {
        const dateStr = dayjs(date).format('YYYY-MM-DD');

        setHabits(prev => prev.map(habit => {
            if (habit.id !== habitId) return habit;

            const isCompleted = habit.completedDates.includes(dateStr);
            let newDates = [...habit.completedDates];
            let newStreak = habit.streak;

            if (isCompleted) {
                newDates = newDates.filter(d => d !== dateStr);
                // Simplified streak logic for demo
                newStreak = Math.max(0, newStreak - 1);
            } else {
                newDates.push(dateStr);
                newStreak += 1;
            }

            return { ...habit, completedDates: newDates, streak: newStreak };
        }));
    };

    const getDayContent = (day: Date) => {
        const dateStr = dayjs(day).format('YYYY-MM-DD');
        const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
        const totalHabits = habits.length;

        // Calculate intensity based on completion
        if (completedCount === 0) return null;

        const intensity = completedCount / totalHabits;
        let colorClass = 'bg-red-100 dark:bg-red-900/30';
        if (intensity > 0.3) colorClass = 'bg-red-300 dark:bg-red-700/50';
        if (intensity > 0.6) colorClass = 'bg-red-500 dark:bg-red-600';

        return (
            <div className={`w-full h-full absolute inset-0 rounded-full z-[-1] ${colorClass} opacity-80`} />
        );
    };

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
                            hasHabits: (date) => habits.some(h => h.completedDates.includes(dayjs(date).format('YYYY-MM-DD')))
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
                    <span className="text-sm text-zinc-400">
                        {habits.filter(h => h.completedDates.includes(dayjs(selectedDate).format('YYYY-MM-DD'))).length}/{habits.length} completed
                    </span>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {habits.map((habit) => {
                            const isCompleted = habit.completedDates.includes(dayjs(selectedDate).format('YYYY-MM-DD'));
                            return (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`
                                flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer
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
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
