'use client';

import React, { useState, useCallback, useEffect } from 'react';
import MDXEditorComponent from './MDXEditorComponent';
import { updateNoteTitle, updateNoteContent } from '@/app/(main)/actions';

// Simple debounce implementation
function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);
        setTimer(newTimer);
    }, [callback, delay, timer]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [timer]);

    return debouncedCallback;
}

export default function NoteEditor({
    noteId,
    initialTitle,
    initialContent
}: {
    noteId: string,
    initialTitle: string,
    initialContent: string
}) {
    const [title, setTitle] = useState(initialTitle);

    // Create debounced update functions
    const debouncedUpdateTitle = useDebounce((newTitle: string) => {
        updateNoteTitle(noteId, newTitle);
    }, 500);

    const debouncedUpdateContent = useDebounce((newContent: string) => {
        updateNoteContent(noteId, newContent);
    }, 1000);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedUpdateTitle(newTitle);
    };

    const handleContentChange = (newContent: string) => {
        debouncedUpdateContent(newContent);
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-12 px-8">
                {/* Title */}
                <input
                    className="w-full bg-transparent text-4xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 border-none focus:ring-0 p-0 mb-6 outline-none"
                    placeholder="Untitled"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                />

                {/* Body */}
                <MDXEditorComponent
                    markdown={initialContent || ''}
                    onChange={handleContentChange}
                />
            </div>

            {/* Bottom Stats Bar - Placeholder for now */}
            <div className="absolute bottom-4 right-8 text-xs text-gray-400 dark:text-gray-600 font-mono">
                {/* Could add word count here later */}
                Autosaved
            </div>
        </div>
    );
}
