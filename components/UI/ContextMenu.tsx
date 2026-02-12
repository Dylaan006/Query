'use client';

import React, { useEffect, useRef } from 'react';

type ContextMenuAction = {
    label: string;
    onClick: () => void;
    icon?: string;
    danger?: boolean;
}

type ContextMenuProps = {
    x: number;
    y: number;
    actions: ContextMenuAction[];
    onClose: () => void;
}

export default function ContextMenu({ x, y, actions, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Simple boundary check could be added here to prevent menu going off screen

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-lg shadow-xl min-w-[160px] py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: y, left: x }}
        >
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => {
                        action.onClick();
                        onClose();
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${action.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}
                >
                    {action.icon && <span className="material-icons-outlined text-sm">{action.icon}</span>}
                    {action.label}
                </button>
            ))}
        </div>
    );
}
