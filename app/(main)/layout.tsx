import React from 'react';
import SidebarController from '@/components/Sidebar/SidebarController';
import { createClient } from '@/utils/supabase/server';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()

    const { data: folders } = await supabase
        .from('folders')
        .select('*, notes(*)')
        .order('created_at', { ascending: true })

    const { data: rootNotes } = await supabase
        .from('notes')
        .select('*')
        .is('folder_id', null)
        .order('created_at', { ascending: true })

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
