import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import EditorHeader from '@/components/Editor/EditorHeader';
import NoteEditor from '@/components/Editor/NoteEditor';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()

    const { data: note } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()

    if (!note) {
        notFound()
    }

    return (
        <>
            <EditorHeader />
            <NoteEditor
                noteId={note.id}
                initialTitle={note.title || ''}
                initialContent={note.content || ''}
            />
        </>
    );
}
