import React from 'react';
import SidebarController from '@/components/Sidebar/SidebarController';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let folders = [];
    let rootNotes = [];

    try {
        const supabase = await createClient()

        const { data: foldersData } = await supabase
            .from('folders')
            .select('*, notes(*)')
            .order('created_at', { ascending: true })

        if (foldersData) folders = foldersData;

        const { data: rootNotesData } = await supabase
            .from('notes')
            .select('*')
            .is('folder_id', null)
            .order('created_at', { ascending: true })

        if (rootNotesData) rootNotes = rootNotesData;
    } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        // Fallback to empty states to prevent crash
    }

    return (
        <main className="flex h-full w-full">
            <SidebarController folders={folders || []} rootNotes={rootNotes || []} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark relative">
                {children}
            </div>
        </main>
    );
}
