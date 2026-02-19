'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function Section({ title, subtitle, children }: SectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-6"
        >
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </header>

            <div className="w-full">
                {children}
            </div>
        </motion.div>
    );
}
