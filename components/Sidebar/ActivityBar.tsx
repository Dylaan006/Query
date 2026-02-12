import React from 'react';
import Link from 'next/link';

type ViewType = 'explorer' | 'search' | 'favorites';

export default function ActivityBar({ activeView, onViewChange }: { activeView: ViewType, onViewChange: (view: ViewType) => void }) {
    return (
        <aside className="w-16 flex-shrink-0 bg-gray-200 dark:bg-rail-dark flex flex-col items-center py-6 border-r border-gray-300 dark:border-gray-800/50 z-20">
            {/* Logo/Brand Placeholder */}
            <div className="mb-8 w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 cursor-pointer" onClick={() => onViewChange('explorer')}>
                <span className="material-icons text-xl">edit_note</span>
            </div>

            {/* Navigation Icons */}
            <nav className="flex flex-col gap-4 w-full px-2">
                <button
                    onClick={() => onViewChange('explorer')}
                    className={`group flex items-center justify-center w-full aspect-square rounded-lg shadow-sm transition-all relative ${activeView === 'explorer' ? 'bg-white dark:bg-surface-dark ring-1 ring-gray-900/5 dark:ring-white/10' : 'hover:bg-white/50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                    <span className={`material-icons-outlined text-2xl ${activeView === 'explorer' ? 'text-primary' : ''}`}>folder_open</span>
                    {/* Active Indicator */}
                    {activeView === 'explorer' && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>}
                </button>

                <button
                    onClick={() => onViewChange('search')}
                    className={`group flex items-center justify-center w-full aspect-square rounded-lg shadow-sm transition-all relative ${activeView === 'search' ? 'bg-white dark:bg-surface-dark ring-1 ring-gray-900/5 dark:ring-white/10' : 'hover:bg-white/50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                    <span className={`material-icons-outlined text-2xl ${activeView === 'search' ? 'text-primary' : ''}`}>search</span>
                    {activeView === 'search' && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>}
                </button>

                <button
                    onClick={() => onViewChange('favorites')}
                    className={`group flex items-center justify-center w-full aspect-square rounded-lg shadow-sm transition-all relative ${activeView === 'favorites' ? 'bg-white dark:bg-surface-dark ring-1 ring-gray-900/5 dark:ring-white/10' : 'hover:bg-white/50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                    <span className={`material-icons-outlined text-2xl ${activeView === 'favorites' ? 'text-primary' : ''}`}>star_border</span>
                    {activeView === 'favorites' && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>}
                </button>
            </nav>

            {/* Bottom Icons */}
            <div className="mt-auto flex flex-col gap-4 w-full px-2">
                <button className="group flex items-center justify-center w-full aspect-square rounded-lg hover:bg-white/50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                    <span className="material-icons-outlined text-2xl">settings</span>
                </button>
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 bg-gray-300 flex items-center justify-center overflow-hidden">
                        {/* Placeholder for user avatar if image fails or not provided */}
                        <span className="material-icons text-gray-500 text-sm">person</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
