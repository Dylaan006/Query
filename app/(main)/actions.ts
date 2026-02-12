'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createFolder() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase.from('folders').insert({
        name: 'New Folder',
        user_id: user.id
    })

    if (error) {
        console.error('Error creating folder:', error)
        return { error: 'Failed to create folder' }
    }

    revalidatePath('/', 'layout')
}

export async function createNote(folderId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // If no folderId, maybe create in a default folder or handle it (for now, specific folder required logic or root notes logic)
    // The schema requires folder_id? No, schema says folder_id references folders on delete cascade, but doesn't say NOT NULL.
    // Wait, let's check schema. Step 75: folder_id uuid references folders... (nullable by default).

    const { data, error } = await supabase.from('notes').insert({
        title: 'Untitled Note',
        user_id: user.id,
        folder_id: folderId || null
    }).select().single()

    if (error) {
        console.error('Error creating note:', error)
        return { error: 'Failed to create note' }
    }

    revalidatePath('/', 'layout')
    if (data) {
        redirect(`/notes/${data.id}`)
    }
}

export async function updateNoteContent(noteId: string, content: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('notes').update({
        content,
        // Schema in step 75: id, created_at, title, content, folder_id, user_id.
        // I should create a migration for updated_at if I want it, but for now just content.
    }).eq('id', noteId)

    if (error) {
        return { error: 'Failed to update note' }
    }

    revalidatePath('/', 'layout')
}

export async function updateNoteTitle(noteId: string, title: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('notes').update({
        title
    }).eq('id', noteId)

    revalidatePath('/', 'layout')
}

export async function moveNoteToFolder(noteId: string, folderId: string | null) {
    const supabase = await createClient()

    const { error } = await supabase.from('notes').update({
        folder_id: folderId
    }).eq('id', noteId)

    if (error) {
        console.error('Error moving note:', error)
        return { error: 'Failed to move note' }
    }

    revalidatePath('/', 'layout')
}

export async function deleteNote(noteId: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('notes').delete().eq('id', noteId)

    if (error) {
        console.error('Error deleting note:', error)
        return { error: 'Failed to delete note' }
    }

    revalidatePath('/', 'layout')
}

export async function deleteFolder(folderId: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('folders').delete().eq('id', folderId)

    if (error) {
        console.error('Error deleting folder:', error)
        return { error: 'Failed to delete folder' }
    }

    revalidatePath('/', 'layout')
}

export async function renameFolder(folderId: string, name: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('folders').update({ name }).eq('id', folderId)

    if (error) {
        console.error('Error renaming folder:', error)
        return { error: 'Failed to rename folder' }
    }

    revalidatePath('/', 'layout')
}
