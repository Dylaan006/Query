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

    return (
        <>
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
        </>
    );
}
