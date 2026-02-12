import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Folder = {
    id: string;
    name: string;
    notes?: Note[];
}

type Note = {
    id: string;
    title: string;
    content?: string;
}

import { DragEndEvent, DragStartEvent, useDroppable, DragOverlay } from '@dnd-kit/core';
import ClientDndContext from './ClientDndContext';
import { DraggableNote } from './DraggableNote';
import SidebarNoteItem from './SidebarNoteItem';
import { DroppableFolder } from './DroppableFolder';
import { moveNoteToFolder, createFolder, createNote, deleteFolder, deleteNote, renameFolder, updateNoteTitle } from '@/app/(main)/actions';
import ContextMenu from '../UI/ContextMenu';
import MoveFileModal from './MoveFileModal';


// ... imports

export default function FileExplorer({ folders, rootNotes }: { folders: Folder[], rootNotes?: Note[] }) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'folder' | 'note', id: string, name?: string } | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [movingNoteId, setMovingNoteId] = useState<string | null>(null);

    // Root Droppable
    const { setNodeRef: setRootNodeRef, isOver: isOverRoot } = useDroppable({
        id: 'root-folder',
        data: { type: 'folder', id: null } // null id implies root
    });

    // Sorting Logic
    const sortedFolders = useMemo(() => {
        return [...folders].sort((a, b) => {
            return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        });
    }, [folders, sortOrder]);

    const sortedRootNotes = useMemo(() => {
        return rootNotes ? [...rootNotes].sort((a, b) => {
            return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }) : [];
    }, [rootNotes, sortOrder]);

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const toggleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === 'note') {
            setActiveNote(event.active.data.current.note as Note);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveNote(null);

        if (over && active.id !== over.id) {
            const noteId = active.id as string;
            // Check if dropped on root
            const folderId = over.id === 'root-folder' ? null : over.id as string;
            moveNoteToFolder(noteId, folderId);
        }
    }, []);

    // ... context menu handlers
    const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'note', id: string, name?: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, id, name });
    };

    const closeContextMenu = () => setContextMenu(null);

    const handleDelete = async () => {
        if (!contextMenu) return;
        if (confirm(`Are you sure you want to delete this ${contextMenu.type}?`)) {
            if (contextMenu.type === 'folder') {
                await deleteFolder(contextMenu.id);
            } else {
                await deleteNote(contextMenu.id);
            }
        }
        closeContextMenu();
    };

    const handleRename = async () => {
        if (!contextMenu) return;
        const newName = prompt(`Rename ${contextMenu.type}`, contextMenu.name || '');
        if (newName && newName !== contextMenu.name) {
            if (contextMenu.type === 'folder') {
                await renameFolder(contextMenu.id, newName);
            } else {
                await updateNoteTitle(contextMenu.id, newName);
            }
        }
        closeContextMenu();
    };

    const handleMoveInit = () => {
        if (!contextMenu) return;
        // Only notes can be moved for now? Original request implies dragging files (notes).
        // If folders can be moved, that's complex nesting. Assuming notes only based on requirement "move file".
        if (contextMenu.type === 'note') {
            setMovingNoteId(contextMenu.id);
            setIsMoveModalOpen(true);
        }
        closeContextMenu();
    };

    const handleMoveConfirm = async (folderId: string | null) => {
        if (movingNoteId) {
            await moveNoteToFolder(movingNoteId, folderId);
            setMovingNoteId(null);
        }
    };

    return (
        <aside className="w-72 flex-shrink-0 bg-gray-50 dark:bg-surface-dark flex flex-col border-r border-gray-300 dark:border-gray-800/50 overflow-hidden">
            {/* Search & Header */}
            <div className="p-4 pb-2">
                <div className="bg-gray-200 dark:bg-white/5 rounded-lg p-2 mb-4 text-xs text-center text-gray-500">
                    Search moved to sidebar icon
                </div>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => createNote()}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2 px-3 rounded-lg shadow-sm shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                    >
                        <span className="material-icons-outlined text-lg">add</span>
                        New Note
                    </button>
                    <button
                        onClick={() => createFolder()}
                        className="flex-none w-10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center transition-all"
                        title="New Folder"
                    >
                        <span className="material-icons-outlined text-lg">create_new_folder</span>
                    </button>
                    {/* Sort Button */}
                    <button
                        onClick={toggleSort}
                        className="flex-none w-10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center transition-all"
                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        <span className="material-icons-outlined text-lg">sort_by_alpha</span>
                        {/* Optional indicator */}
                        <span className="text-[10px] ml-[-2px]">{sortOrder === 'asc' ? '↓' : '↑'}</span>
                    </button>
                </div>
            </div>

            {/* File Tree */}
            <ClientDndContext key="dnd-context-v2" onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2 pb-4">
                    <div className="flex-1 flex flex-col space-y-0.5">
                        {sortedFolders.map((folder) => (
                            <DroppableFolder
                                key={folder.id}
                                folder={folder}
                                isExpanded={expandedFolders.has(folder.id)}
                                toggleFolder={toggleFolder}
                                onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id, folder.name)}
                            >
                                {expandedFolders.has(folder.id) && (
                                    <div className="pl-4 ml-2 border-l border-gray-200 dark:border-white/5 mt-1 space-y-0.5">
                                        {folder.notes?.sort((a, b) => sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)).map((note) => (
                                            <DraggableNote
                                                key={note.id}
                                                note={note}
                                                onContextMenu={(e) => handleContextMenu(e, 'note', note.id, note.title)}
                                            />
                                        ))}
                                        {(!folder.notes || folder.notes.length === 0) && (
                                            <div className="px-2 py-1.5 text-xs text-gray-400 italic">No notes</div>
                                        )}
                                    </div>
                                )}
                            </DroppableFolder>
                        ))}

                        {folders?.length === 0 && rootNotes?.length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No files yet.
                            </div>
                        )}

                        {/* Root Notes - Droppable Area */}

                        {/* Root Notes List (Not Droppable directly, just the items) */}
                        <div className="mt-2 space-y-0.5">
                            {sortedRootNotes.map((note) => (
                                <DraggableNote
                                    key={note.id}
                                    note={note}
                                    onContextMenu={(e) => handleContextMenu(e, 'note', note.id, note.title)}
                                />
                            ))}
                        </div>

                        {/* Dedicated Root Drop Zone (Sibling) */}
                        <div
                            ref={setRootNodeRef}
                            className={`mt-4 flex-1 min-h-[100px] rounded-lg border-2 border-dashed transition-all relative z-10
                                ${isOverRoot ? 'border-primary bg-primary/20 scale-[1.02]' : 'border-transparent'}
                                ${activeNote && !isOverRoot ? 'border-gray-200 dark:border-gray-800' : ''}
                            `}
                        >
                            {(isOverRoot || activeNote) && (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400 pointer-events-none">
                                    {isOverRoot ? 'Drop to Move to Root' : 'Root Drop Zone'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeNote ? (
                        <SidebarNoteItem note={activeNote} isOverlay />
                    ) : null}
                </DragOverlay>
            </ClientDndContext>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    actions={[
                        { label: 'Rename', onClick: handleRename, icon: 'edit' },
                        { label: 'Move to...', onClick: handleMoveInit, icon: 'drive_file_move' },
                        { label: 'Delete', onClick: handleDelete, icon: 'delete', danger: true },
                    ]}
                />
            )}

            <MoveFileModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                folders={folders}
                onSelectFolder={handleMoveConfirm}
                fileName={contextMenu?.name} // Use the name from context menu state if available, but movingNoteId is more reliable for ID. Name is just for display.
            />
        </aside>
    );
}
