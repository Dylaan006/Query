import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import SidebarNoteItem from './SidebarNoteItem';

type Note = {
    id: string;
    title: string;
}

export function DraggableNote({ note, onContextMenu }: { note: Note, onContextMenu?: (e: React.MouseEvent) => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: note.id,
        data: { type: 'note', note }
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className={`touch-none ${isDragging ? 'opacity-30 pointer-events-none' : ''}`}>
            <SidebarNoteItem note={note} isDragging={isDragging} onContextMenu={onContextMenu} />
        </div>
    );
}
