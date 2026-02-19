'use client';

import { useState } from 'react';
import TaskList from "@/components/tasks/TaskList";
import TiptapEditor from "@/components/notes/TiptapEditor";
import HabitTracker from "@/components/habits/HabitTracker";
import { Calendar as CalendarIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "@/components/sidebar/Sidebar";
import SecondarySidebar from "@/components/sidebar/SecondarySidebar";
import Section from "@/components/ui/Section";
import { Button } from '@/components/ui/Button';
import FileExplorer from "@/components/notes/FileExplorer";

type Tab = 'tasks' | 'notes' | 'calendar' | 'habits';

export default function Dashboard({ initialTasks = [] }: { initialTasks?: any[] }) {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('inbox'); // 'inbox', 'today', 'upcoming', or projectId
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    return (
        <div className="flex h-screen bg-zinc-900 overflow-hidden dark">
            {/* Primary Sidebar (Fixed Icons) */}
            <div className="hidden md:block">
                <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />
            </div>

            {/* Mobile Header (Only visible on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6 text-zinc-400" />
                    </Button>
                    <span className="font-bold text-white">App</span>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-80 bg-zinc-900 z-50 md:hidden flex"
                        >
                            <Sidebar
                                activeTab={activeTab}
                                onTabChange={(tab) => {
                                    setActiveTab(tab as Tab);
                                    if (tab !== 'tasks' && tab !== 'notes') setIsMobileMenuOpen(false);
                                }}
                                className="static h-full border-r-0"
                            />
                            {activeTab === 'tasks' && (
                                <div className="flex-1 bg-zinc-900 border-l border-zinc-800">
                                    <SecondarySidebar
                                        className="w-full border-none"
                                        activeFilter={activeFilter}
                                        onFilterChange={(filter) => {
                                            setActiveFilter(filter);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    />
                                </div>
                            )}
                            {activeTab === 'notes' && (
                                <div className="flex-1 bg-zinc-900 border-l border-zinc-800">
                                    <FileExplorer
                                        className="w-full border-none"
                                        activeNoteId={selectedNoteId}
                                        onSelectNote={(id) => {
                                            setSelectedNoteId(id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Secondary Sidebar (Contextual Navigation) - Desktop */}
            <AnimatePresence mode="wait">
                {(activeTab === 'tasks' || activeTab === 'notes') && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="ml-20 h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl z-40 hidden md:block"
                    >
                        {activeTab === 'tasks' && (
                            <SecondarySidebar
                                activeFilter={activeFilter}
                                onFilterChange={setActiveFilter}
                            />
                        )}
                        {activeTab === 'notes' && (
                            <div className="w-64 h-full bg-zinc-900 border-r border-zinc-800">
                                <FileExplorer
                                    activeNoteId={selectedNoteId}
                                    onSelectNote={setSelectedNoteId}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className={`flex-1 h-full overflow-y-auto transition-all duration-300 p-4 md:p-8 pt-20 md:pt-8 ${activeTab !== 'tasks' && activeTab !== 'notes' ? 'md:ml-20' : ''}`}>
                <div className="max-w-5xl mx-auto h-full">
                    <AnimatePresence mode="wait">
                        {activeTab === 'tasks' && (
                            <Section key="tasks" title="" subtitle="">
                                <TaskList
                                    initialTasks={initialTasks}
                                    activeFilter={activeFilter}
                                />
                            </Section>
                        )}

                        {activeTab === 'notes' && (
                            <Section key="notes" title={selectedNoteId ? "" : "Notes"} subtitle={selectedNoteId ? "" : "Select a note to start editing"}>
                                <div className="h-full flex flex-col">
                                    {selectedNoteId ? (
                                        <TiptapEditor
                                            key={selectedNoteId} // Force re-mount on note change
                                            noteId={selectedNoteId}
                                            placeholder="Write something brilliant..."
                                        />
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                                            <p>Select a note from the explorer</p>
                                        </div>
                                    )}
                                </div>
                            </Section>
                        )}

                        {activeTab === 'calendar' && (
                            <Section key="calendar" title="Calendar" subtitle="Coming Soon...">
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                                    <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Calendar View Under Construction</p>
                                </div>
                            </Section>
                        )}

                        {activeTab === 'habits' && (
                            <Section key="habits" title="Habit Tracker" subtitle="Build better routines">
                                <HabitTracker />
                            </Section>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
