'use client';

import React, { useState, useEffect, useRef } from 'react';

type Folder = {
    id: string;
    name: string;
}

interface MoveFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    folders: Folder[];
    onSelectFolder: (folderId: string | null) => void;
    fileName?: string;
}

export default function MoveFileModal({ isOpen, onClose, folders, onSelectFolder, fileName }: MoveFileModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Flatten options: Root + Folders
    const options = [
        { id: null, name: 'Root ( / )' },
        ...folders.map(f => ({ id: f.id, name: f.name }))
    ].filter(opt =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        // Reset selection when options change due to search
        setSelectedIndex(0);
    }, [searchQuery]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % options.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + options.length) % options.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (options[selectedIndex]) {
                onSelectFolder(options[selectedIndex].id);
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 mb-2 px-1">
                        <span className="text-xs uppercase font-medium tracking-wider">Move {fileName ? `"${fileName}"` : 'File'} to...</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type to search folders..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#2d2d2d] border-none rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 outline-none placeholder-gray-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-2">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No folders found</div>
                    ) : (
                        options.map((option, index) => (
                            <button
                                key={option.id ?? 'root'}
                                className={`w-full px-4 py-2 flex items-center gap-3 text-sm text-left transition-colors
                                    ${index === selectedIndex ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}
                                `}
                                onClick={() => {
                                    onSelectFolder(option.id);
                                    onClose();
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className={`material-icons text-lg ${index === selectedIndex ? 'text-white' : 'text-gray-400'}`}>
                                    {option.id === null ? 'home' : 'folder'}
                                </span>
                                <span>{option.name}</span>
                                {index === selectedIndex && (
                                    <span className="ml-auto text-xs opacity-70">Enter to select</span>
                                )}
                            </button>
                        ))
                    )}
                </div>

                <div className="px-3 py-2 bg-gray-50 dark:bg-[#252525] border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex gap-2">
                        <span><kbd className="font-sans px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑↓</kbd> Navigate</span>
                        <span><kbd className="font-sans px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↵</kbd> Select</span>
                    </div>
                    <span><kbd className="font-sans px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Esc</kbd> Close</span>
                </div>
            </div>
        </div>
    );
}
