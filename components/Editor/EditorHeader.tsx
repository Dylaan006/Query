import React from 'react';

export default function EditorHeader() {
    return (
        <header className="h-16 flex items-center justify-between px-8 border-b border-transparent dark:border-white/5">
            <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>Personal</span>
                <span className="material-icons text-[10px]">arrow_forward_ios</span>
                <span className="text-gray-600 dark:text-gray-300">Project Ideas</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">Last edited 2m ago</span>
                <div className="h-4 w-px bg-gray-300 dark:bg-white/10"></div>
                <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <span className="material-icons-outlined text-xl">more_horiz</span>
                </button>
            </div>
        </header>
    );
}
