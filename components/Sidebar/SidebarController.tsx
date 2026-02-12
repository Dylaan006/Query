'use client';

import React, { useState } from 'react';
import ActivityBar from './ActivityBar';
import FileExplorer from './FileExplorer';
import SearchPane from './SearchPane';

type Note = {
    id: string;
    title: string;
    content?: string;
}

type Folder = {
    id: string;
    name: string;
    notes?: Note[];
}

type ViewType = 'explorer' | 'search' | 'favorites';

export default function SidebarController({ folders, rootNotes }: { folders: Folder[], rootNotes: Note[] }) {
    const [activeView, setActiveView] = useState<ViewType>('explorer');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when selecting an item (logic can be passed down or handled here if we had the callback)
    // For now, we'll just handle the open/close state UI.

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface-light dark:bg-surface-dark rounded-md shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            >
                <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Sidebar Container - Mobile Overlay vs Desktop Static */}
            <div className={`
                fixed inset-y-0 left-0 z-40 flex h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <ActivityBar activeView={activeView} onViewChange={setActiveView} />

                {activeView === 'explorer' && (
                    <FileExplorer folders={folders} rootNotes={rootNotes} />
                )}

                {activeView === 'search' && (
                    <SearchPane folders={folders} rootNotes={rootNotes} />
                )}

                {activeView === 'favorites' && (
                    <aside className="w-72 flex-shrink-0 bg-gray-50 dark:bg-surface-dark flex flex-col border-r border-gray-300 dark:border-gray-800/50 p-4">
                        <div className="text-gray-500 text-sm">Favorites coming soon...</div>
                    </aside>
                )}
            </div>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
