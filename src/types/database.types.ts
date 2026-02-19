export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            habits: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    description: string | null
                    color: string | null
                    icon: string | null
                    user_id: string | null
                    is_archived: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    description?: string | null
                    color?: string | null
                    icon?: string | null
                    user_id?: string | null
                    is_archived?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    description?: string | null
                    color?: string | null
                    icon?: string | null
                    user_id?: string | null
                    is_archived?: boolean
                }
            }
            habit_logs: {
                Row: {
                    id: string
                    created_at: string
                    habit_id: string
                    date: string // ISO date string YYYY-MM-DD
                    completed: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    habit_id: string
                    date: string
                    completed?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    habit_id?: string
                    date?: string
                    completed?: boolean
                }
            }
            notes: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    content: string | null // HTML/JSON content from Tiptap
                    title: string | null
                    user_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    content?: string | null
                    title?: string | null
                    user_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    content?: string | null
                    title?: string | null
                    user_id?: string | null
                }
            }
        }
    }
}
