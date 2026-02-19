'use client';

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, CheckSquare, Quote, Save, CheckCircle2 } from 'lucide-react'
import { TodoistTaskNode } from './TodoistTaskNode'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

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

const TiptapEditor = ({ content: initialContent, onChange, placeholder = "Start writing...", noteId }: { content?: string, onChange?: (content: string) => void, placeholder?: string, noteId?: string }) => {
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as SupabaseClient<Database>;

    // Fetch Note
    const { data: note, isLoading } = useQuery({
        queryKey: ['note', noteId], // distinct query key per note
        queryFn: async () => {
            // If no noteId, don't fetch anything (or handle create mode)
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

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async (content: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            if ((note as any)?.id) {
                // Update
                const { error } = await (supabase
                    .from('notes') as any)
                    .update({ content, updated_at: new Date().toISOString() })
                    .eq('id', (note as any).id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await (supabase
                    .from('notes') as any)
                    .insert({ content, user_id: user.id });
                if (error) throw error;
            }
        },
        onMutate: () => setIsSaving(true),
        onSettled: () => {
            setIsSaving(false);
            queryClient.invalidateQueries({ queryKey: ['note'] });
        }
    });

    const debouncedSave = useDebouncedCallback((html: string) => {
        saveMutation.mutate(html);
    }, 1000); // 1 second debounce

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: placeholder,
            }),
            TodoistTaskNode,
        ],
        content: '', // content handled via effect
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
            debouncedSave(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[400px] p-4', // Increased min-height
            },
        },
        immediatelyRender: false,
    })

    // Load content when data is ready
    useEffect(() => {
        if (editor && (note as any)?.content && !editor.getText()) { // Only load if editor empty to avoid overwrite loop
            editor.commands.setContent((note as any).content);
        } else if (editor && initialContent && !note && !editor.getText()) {
            editor.commands.setContent(initialContent);
        }
    }, [editor, note, initialContent]);

    if (!editor) {
        return null
    }

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm transition-all focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-zinc-700">
            <div className="flex items-center justify-between p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="flex items-center gap-1 overflow-x-auto">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('taskList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                        title="Task List"
                    >
                        <CheckSquare className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().insertContent({ type: 'todoistTask', attrs: { content: 'New Todoist Task' } }).run()}
                        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400`}
                        title="Add Todoist Task"
                    >
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
                <div className="flex items-center px-2">
                    {isSaving ? (
                        <span className="text-xs text-zinc-400 animate-pulse">Saving...</span>
                    ) : (
                        <span className="text-xs text-zinc-500">Saved</span>
                    )}
                </div>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}

export default TiptapEditor
