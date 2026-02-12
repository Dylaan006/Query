'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

type Folder = {
    id: string;
    name: string;
}

export function DroppableFolder({ folder, children, isExpanded, toggleFolder, onContextMenu }: { folder: Folder, children: React.ReactNode, isExpanded: boolean, toggleFolder: (id: string) => void, onContextMenu?: (e: React.MouseEvent) => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id: folder.id,
        data: { type: 'folder', folder }
    });

    return (
        <div ref={setNodeRef} className={`rounded-md transition-colors ${isOver ? 'bg-primary/10 ring-1 ring-primary' : ''}`}>
            <button
                onClick={() => toggleFolder(folder.id)}
                onContextMenu={onContextMenu}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md group transition-colors"
            >
                <span className={`material-icons text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform text-lg ${isExpanded ? 'rotate-90' : ''}`}>arrow_right</span>
                <span className={`material-icons text-lg ${isOver ? 'text-primary' : 'text-primary/80'}`}>folder</span>
                <span>{folder.name}</span>
            </button>
            {children}
        </div>
    );
}
