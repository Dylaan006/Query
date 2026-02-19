'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import {
    Folder,
    FileText,
    ChevronRight,
    ChevronDown,
    Plus,
    MoreHorizontal,
    Trash2,
    Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface FileExplorerProps {
    onSelectNote: (noteId: string) => void;
    activeNoteId?: string | null;
    className?: string;
}

type FolderNode = Database['public']['Tables']['folders']['Row'] & {
    children: FolderNode[];
    notes: Database['public']['Tables']['notes']['Row'][];
};

export default function FileExplorer({ onSelectNote, activeNoteId, className }: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as SupabaseClient<Database>;

    // Fetch Folders and Notes
    const { data: fileSystem, isLoading } = useQuery({
        queryKey: ['fileSystem'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { folders: [], notes: [] };

            const [foldersResult, notesResult] = await Promise.all([
                supabase.from('folders').select('*').eq('user_id', user.id).order('name'),
                supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
            ]);

            if (foldersResult.error) throw foldersResult.error;
            if (notesResult.error) throw notesResult.error;

            return {
                folders: foldersResult.data,
                notes: notesResult.data
            };
        }
    });

    const createFolderMutation = useMutation({
        mutationFn: async ({ name, parentId }: { name: string, parentId?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase.from('folders').insert({
                name,
                user_id: user.id,
                parent_id: parentId || null
            } as any);
            if (error) throw error;
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['fileSystem'] })
    });

    const createNoteMutation = useMutation({
        mutationFn: async ({ title, parentId }: { title: string, parentId?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { data, error } = await supabase.from('notes').insert({
                title: title || 'Untitled',
                content: '',
                user_id: user.id,
                parent_folder_id: parentId || null
            } as any).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['fileSystem'] });
            if (data) onSelectNote(data.id);
        }
    });

    const deleteFolderMutation = useMutation({
        mutationFn: async (folderId: string) => {
            const { error } = await supabase
                .from('folders')
                .delete()
                .eq('id', folderId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fileSystem'] });
            setFolderToDelete(null);
        }
    });

    // Move Mutation
    const moveNodeMutation = useMutation({
        mutationFn: async ({ id, type, parentId }: { id: string, type: 'folder' | 'note', parentId: string | null }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const table = type === 'folder' ? 'folders' : 'notes';
            const column = type === 'folder' ? 'parent_id' : 'parent_folder_id';

            const { error } = await (supabase
                .from(table) as any)
                .update({ [column]: parentId })
                .eq('id', id);

            if (error) throw error;
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['fileSystem'] })
    });

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const activeType = active.data.current?.type as 'folder' | 'note';
        const overId = over.id as string;

        // Don't drop on itself
        if (activeId === overId) return;

        // Determine target parent ID
        // If dropping on 'root', parent is null.
        // If dropping on a folder, parent is that folder's ID.
        let targetParentId: string | null = overId === 'root' ? null : overId;

        // Check for cycles if moving a folder
        // For simplicity, we assume the UI prevents simple drops, but backend should handle circular deps ideally.
        // Here we just allow it for now.

        moveNodeMutation.mutate({ id: activeId, type: activeType, parentId: targetParentId });
    };

    // Components for DnD
    const DraggableItem = ({ id, type, children, className }: { id: string, type: 'folder' | 'note', children: React.ReactNode, className?: string }) => {
        const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
            id,
            data: { type }
        });

        const style = transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 999,
        } : undefined;

        return (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn(className, isDragging && "opacity-50")}>
                {children}
            </div>
        );
    };

    const DroppableFolder = ({ id, children, className, isExpanded }: { id: string, children: React.ReactNode, className?: string, isExpanded: boolean }) => {
        const { setNodeRef, isOver } = useDroppable({
            id,
            data: { type: 'folder' }
        });

        return (
            <div ref={setNodeRef} className={cn(className, isOver && "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500 rounded")}>
                {children}
            </div>
        );
    };

    const DroppableRoot = ({ children }: { children: React.ReactNode }) => {
        const { setNodeRef, isOver } = useDroppable({
            id: 'root',
            data: { type: 'root' }
        });

        return (
            <div ref={setNodeRef} className={cn("flex-1 overflow-y-auto p-2 scrollbar-thin min-h-[200px]", isOver && "bg-blue-50/10")}>
                {children}
            </div>
        );
    }

    // Build Tree Structure
    const buildTree = (folders: any[], notes: any[]) => {
        const folderMap = new Map();
        const rootFolders: any[] = [];
        const rootNotes = notes.filter(n => !n.parent_folder_id);

        // Initialize map
        folders.forEach(f => {
            folderMap.set(f.id, { ...f, children: [], notes: [] });
        });

        // Populate hierarchy
        folders.forEach(f => {
            if (f.parent_id) {
                const parent = folderMap.get(f.parent_id);
                if (parent) parent.children.push(folderMap.get(f.id));
            } else {
                rootFolders.push(folderMap.get(f.id));
            }
        });

        // Add notes to folders
        notes.forEach(n => {
            if (n.parent_folder_id) {
                const folder = folderMap.get(n.parent_folder_id);
                if (folder) folder.notes.push(n);
            }
        });

        return { rootFolders, rootNotes };
    };

    const tree = fileSystem ? buildTree(fileSystem.folders, fileSystem.notes) : { rootFolders: [], rootNotes: [] };

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleCreateFolder = () => {
        const name = prompt("Folder Name:");
        if (name) createFolderMutation.mutate({ name });
    };

    const handleCreateNote = () => {
        createNoteMutation.mutate({ title: 'New Note' });
    };

    // Recursive Renderer
    const renderFolder = (folder: any, depth = 0) => {
        const isExpanded = expandedFolders.has(folder.id);

        return (
            <div key={folder.id} className={cn("mb-1", depth > 0 && "ml-4")}>
                <DroppableFolder id={folder.id} isExpanded={isExpanded}>
                    <DraggableItem id={folder.id} type="folder">
                        <div
                            className={cn(
                                "flex items-center gap-2 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm text-zinc-600 dark:text-zinc-300 select-none group"
                            )}
                            onClick={() => toggleFolder(folder.id)}
                        >
                            <span className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </span>
                            <Folder className="w-4 h-4 text-zinc-400 fill-zinc-400/20" />
                            <span className="flex-1 truncate">{folder.name}</span>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded mr-1"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const name = prompt("New Folder inside " + folder.name);
                                        if (name) createFolderMutation.mutate({ name, parentId: folder.id });
                                    }}
                                    title="New Subfolder"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                                <button
                                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded mr-1"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        createNoteMutation.mutate({ title: 'New Note', parentId: folder.id });
                                    }}
                                    title="New Note"
                                >
                                    <FileText className="w-3 h-3" />
                                </button>
                                <button
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 rounded"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFolderToDelete(folder.id);
                                    }}
                                    title="Delete Folder"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </DraggableItem>
                </DroppableFolder>

                {isExpanded && (
                    <div>
                        {folder.children.map((child: any) => renderFolder(child, depth + 1))}
                        {folder.notes.map((note: any) => renderNote(note, depth + 1))}
                        {folder.children.length === 0 && folder.notes.length === 0 && (
                            <div className={cn("text-xs text-zinc-400 py-1 pl-8", depth > 0 && "ml-4")}>Empty</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderNote = (note: any, depth = 0) => {
        const isActive = activeNoteId === note.id;
        return (
            <div key={note.id} className={cn("mb-1", depth > 0 && "ml-6")}>
                <DraggableItem id={note.id} type="note">
                    <div
                        className={cn(
                            "flex items-center gap-2 p-1.5 rounded-md cursor-pointer text-sm transition-colors group",
                            isActive
                                ? "bg-[var(--brand)]/10 text-[var(--brand)] font-medium"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                        onClick={() => onSelectNote(note.id)}
                    >
                        <FileText className="w-4 h-4 opacity-70" />
                        <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                    </div>
                </DraggableItem>
            </div>
        );
    };

    if (isLoading) return <div className="p-4 text-zinc-500 text-sm">Loading...</div>;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className={cn("flex flex-col h-full", className)}>
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 z-10">
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Explorer</span>
                    <div className="flex gap-1">
                        <button onClick={handleCreateFolder} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500" title="New Folder">
                            <Folder className="w-4 h-4" />
                            <span className="sr-only">New Folder</span>
                        </button>
                        <button onClick={handleCreateNote} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500" title="New Note">
                            <FileText className="w-4 h-4" />
                            <span className="sr-only">New Note</span>
                        </button>
                    </div>
                </div>

                <DroppableRoot>
                    {tree.rootFolders.map((folder) => renderFolder(folder))}
                    {tree.rootNotes.map((note) => renderNote(note))}
                </DroppableRoot>

                <DragOverlay>
                </DragOverlay>

                <ConfirmationModal
                    isOpen={!!folderToDelete}
                    onClose={() => setFolderToDelete(null)}
                    onConfirm={() => {
                        if (folderToDelete) deleteFolderMutation.mutate(folderToDelete);
                    }}
                    title="Delete Folder"
                    message="Are you sure you want to delete this folder? All contents inside will be deleted."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                />
            </div>
        </DndContext>
    );
}
