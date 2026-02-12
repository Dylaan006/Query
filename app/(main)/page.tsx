import React from 'react';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <span className="material-icons text-6xl mb-4 opacity-50">edit_note</span>
            <p className="text-lg">Select a note to view</p>
        </div>
    );
}
