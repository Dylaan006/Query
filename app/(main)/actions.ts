'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createFolder() {
    try {
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
    } catch (error) {
        console.error('Unexpected error in createFolder:', error)
        return { error: 'Unexpected error occurred' }
    }
}

export async function createNote(folderId?: string) {
    let newNoteId: string | null = null;
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Unauthorized' }
        }

        const { data, error } = await supabase.from('notes').insert({
            title: 'Untitled Note',
            user_id: user.id,
            folder_id: folderId || null
        }).select().single()

        if (error) {
            console.error('Error creating note:', error)
            return { error: 'Failed to create note' }
        }

        newNoteId = data.id;
    } catch (error) {
        console.error('Unexpected error in createNote:', error)
        return { error: 'Unexpected error occurred' }
    }

    if (newNoteId) {
        revalidatePath('/', 'layout')
        redirect(`/notes/${newNoteId}`)
    }
}

export async function updateNoteContent(noteId: string, content: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('notes').update({
            content,
        }).eq('id', noteId)

        if (error) {
            return { error: 'Failed to update note' }
        }

        revalidatePath('/', 'layout')
    } catch (error) {
        console.error('Unexpected error in updateNoteContent:', error)
        return { error: 'Unexpected error occurred' }
    }
}

export async function updateNoteTitle(noteId: string, title: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('notes').update({
            title
        }).eq('id', noteId)

        if (error) {
            return { error: 'Failed to update title' }
        }

        revalidatePath('/', 'layout')
    } catch (error) {
        console.error('Unexpected error in updateNoteTitle:', error)
        return { error: 'Unexpected error occurred' }
    }
}

export async function moveNoteToFolder(noteId: string, folderId: string | null) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('notes').update({
            folder_id: folderId
        }).eq('id', noteId)

        if (error) {
            console.error('Error moving note:', error)
            return { error: 'Failed to move note' }
        }

        revalidatePath('/', 'layout')
    } catch (error) {
        console.error('Unexpected error in moveNoteToFolder:', error)
        return { error: 'Unexpected error occurred' }
    }
}

export async function deleteNote(noteId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('notes').delete().eq('id', noteId)

        if (error) {
            console.error('Error deleting note:', error)
            return { error: 'Failed to delete note' }
        }

        revalidatePath('/', 'layout')
    } catch (error) {
        console.error('Unexpected error in deleteNote:', error)
        return { error: 'Unexpected error occurred' }
    }
}

export async function deleteFolder(folderId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('folders').delete().eq('id', folderId)

        if (error) {
            console.error('Error deleting folder:', error)
            return { error: 'Failed to delete folder' }
        }

        revalidatePath('/', 'layout')
    } catch (error) {
        console.error('Unexpected error in deleteFolder:', error)
        return { error: 'Unexpected error occurred' }
    }
}

export async function renameFolder(folderId: string, name: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('folders').update({ name }).eq('id', folderId)

        if (error) {
            console.error('Error renaming folder:', error)
            return { error: 'Failed to rename folder' }
        }

        revalidatePath('/', 'layout')
    } catch (error) {
        console.error('Unexpected error in renameFolder:', error)
        return { error: 'Unexpected error occurred' }
    }
}
