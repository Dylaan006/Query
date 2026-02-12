'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

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

export default function SearchPane({ folders, rootNotes }: { folders: Folder[], rootNotes: Note[] }) {
    const [query, setQuery] = useState('');

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        const extractTags = (content?: string) => {
            if (!content) return;
            const matches = content.match(/#[\w-]+/g);
            if (matches) {
                matches.forEach(tag => tags.add(tag));
            }
        };

        rootNotes.forEach(note => extractTags(note.content));
        folders.forEach(folder => folder.notes?.forEach(note => extractTags(note.content)));

        return Array.from(tags).sort();
    }, [folders, rootNotes]);

    const allNotes = [
        ...rootNotes,
        ...folders.flatMap(f => f.notes || [])
    ];

    const filteredNotes = query ? allNotes.filter(note =>
        note.title?.toLowerCase().includes(query.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(query.toLowerCase()))
    ) : [];

    const filteredFolders = query ? folders.filter(folder =>
        folder.name.toLowerCase().includes(query.toLowerCase())
    ) : [];

    return (
        <aside className="w-72 flex-shrink-0 bg-gray-50 dark:bg-surface-dark flex flex-col border-r border-gray-300 dark:border-gray-800/50">
            <div className="p-4 border-b border-gray-200 dark:border-white/5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Search</h2>
                <div className="relative">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                        placeholder="Search notes & folders..."
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {!query && allTags.length > 0 && (
                    <div className="mb-6 px-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setQuery(tag)}
                                    className="px-2 py-1 rounded bg-gray-200 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-white/10 cursor-pointer transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {query && filteredNotes.length === 0 && filteredFolders.length === 0 && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                        No results found.
                    </div>
                )}

                {query && (
                    <div className="space-y-0.5">
                        {/* Folders */}
                        {filteredFolders.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</h3>
                                {filteredFolders.map(folder => (
                                    <div key={folder.id} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md group">
                                        <span className="material-icons text-primary/80 text-lg">folder</span>
                                        <span>{folder.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Notes */}
                        {filteredNotes.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</h3>
                                {filteredNotes.map(note => (
                                    <Link
                                        key={note.id}
                                        href={`/notes/${note.id}`}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md group"
                                    >
                                        <span className="material-icons-outlined text-gray-400 text-lg">description</span>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate">{note.title || 'Untitled'}</span>
                                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                Match found
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!query && (
                    <div className="text-center text-sm text-gray-400 mt-8">
                        Type to search your notes...
                    </div>
                )}
            </div>
        </aside>
    );
}
