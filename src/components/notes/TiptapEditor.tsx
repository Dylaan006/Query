/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, CheckSquare, Quote, Trash2 } from 'lucide-react' // Added Trash2
// Removed TodoistTaskNode
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import ConfirmationModal from '@/components/ui/ConfirmationModal' // Import ConfirmationModal

// Custom debounce hook
function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => {
            callback(...args);
        }, delay);
        setTimeoutId(id);
    };
}

const TiptapEditor = ({
    content: initialContent,
    onChange,
    placeholder = "Start writing...",
    noteId,
    onDelete
}: {
    content?: string,
    onChange?: (content: string) => void,
    placeholder?: string,
    noteId?: string,
    onDelete?: () => void
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for modal
    const queryClient = useQueryClient();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as SupabaseClient<Database>;

    // Fetch Note
    const { data: note, isLoading } = useQuery({
        queryKey: ['note', noteId],
        queryFn: async () => {
            if (!noteId) return null;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', noteId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!noteId
    });

    useEffect(() => {
        if ((note as any)?.title) setTitle((note as any).title);
    }, [note]);

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ title, content }: { title?: string, content?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const updates: any = { updated_at: new Date().toISOString() };
            if (title !== undefined) updates.title = title;
            if (content !== undefined) updates.content = content;

            // Cast supabase to any to avoid strict type checks on partial updates/inserts
            const sb = supabase as any;

            if ((note as any)?.id) {
                const { error } = await sb
                    .from('notes')
                    .update(updates)
                    .eq('id', (note as any).id);
                if (error) throw error;
            } else {
                const { error } = await sb
                    .from('notes')
                    .insert({ ...updates, user_id: user.id });
                if (error) throw error;
            }
        },
        onMutate: () => setIsSaving(true),
        onSettled: () => {
            setIsSaving(false);
            queryClient.invalidateQueries({ queryKey: ['note'] });
            queryClient.invalidateQueries({ queryKey: ['fileSystem'] }); // Update title in explorer
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!noteId) return;
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fileSystem'] });
            onDelete?.(); // Call parent callback
        }
    });

    const debouncedSaveContent = useDebouncedCallback((html: string) => {
        saveMutation.mutate({ content: html });
    }, 1000);

    const debouncedSaveTitle = useDebouncedCallback((newTitle: string) => {
        saveMutation.mutate({ title: newTitle });
    }, 1000);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedSaveTitle(newTitle);
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder: placeholder }),
            // TodoistTaskNode removed
        ],
        content: '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
            debouncedSaveContent(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert focus:outline-none max-w-3xl mx-auto min-h-[500px] py-8 px-4',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && (note as any)?.content && !editor.getText()) {
            setTimeout(() => {
                editor.commands.setContent((note as any).content);
            }, 0);
        } else if (editor && initialContent && !note && !editor.getText()) {
            setTimeout(() => {
                editor.commands.setContent(initialContent);
            }, 0);
        }
    }, [editor, note, initialContent]);

    if (!editor) return null;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950/50">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-8 py-3 bg-transparent z-10 sticky top-0 backdrop-blur-sm">
                <div className="text-xs text-zinc-400">
                    {isSaving ? "Saving..." : "Saved"}
                </div>
                {/* Toolbar could be floating or minimal here */}
                <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bulletList') ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className={`p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-zinc-400 hover:text-red-500`}
                        title="Delete Note"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-3xl mx-auto px-4 pt-12">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Untitled Note"
                        className="text-4xl font-bold bg-transparent border-none outline-none w-full text-zinc-800 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-700 mb-8"
                    />
                </div>
                <EditorContent editor={editor} />
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteMutation.mutate()}
                title="Delete Note"
                message="Are you sure you want to delete this note? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};

export default TiptapEditor
