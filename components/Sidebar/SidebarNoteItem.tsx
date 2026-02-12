import React from 'react';
import Link from 'next/link';

type Note = {
    id: string;
    title: string;
}

interface SidebarNoteItemProps {
    note: Note;
    isDragging?: boolean;
    isOverlay?: boolean;
    onContextMenu?: (e: React.MouseEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
}

export default function SidebarNoteItem({ note, isDragging, isOverlay, onContextMenu, onClick }: SidebarNoteItemProps) {
    // If it's an overlay or dragging, we might want to disable the Link behavior or style it differently
    const content = (
        <div className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md group transition-colors 
            ${isOverlay ? 'bg-primary text-white shadow-lg scale-105 pointer-events-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5 cursor-grab active:cursor-grabbing'}
            ${isDragging ? 'opacity-30' : ''}
        `}>
            <span className={`material-icons-outlined text-lg ${isOverlay ? 'text-white' : 'text-gray-400'}`}>description</span>
            <span className="truncate">{note.title || 'Untitled'}</span>
        </div>
    );

    if (isOverlay) {
        return content;
    }

    return (
        <div onContextMenu={onContextMenu} onClick={onClick}>
            <Link href={`/notes/${note.id}`} onClick={(e) => {
                // Additional safety: if user was dragging, this click might need prevention?
                // But since we are using DragOverlay, the click on the underlying element might still happen if we drop *on* it?
                // No, usually drag events supersede.
            }}>
                {content}
            </Link>
        </div>
    );
}
