/**
 * Database types generated from Supabase schema
 * These match the SQL schema exactly
 */

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
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          amount: number
          frequency: 'monthly' | 'biweekly'
          payday_rule: '15_30' | 'custom'
          custom_day: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          frequency: 'monthly' | 'biweekly'
          payday_rule: '15_30' | 'custom'
          custom_day?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          frequency?: 'monthly' | 'biweekly'
          payday_rule?: '15_30' | 'custom'
          custom_day?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          type: 'fixed' | 'variable'
          priority: 'needs' | 'wants'
          due_day: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          type: 'fixed' | 'variable'
          priority: 'needs' | 'wants'
          due_day?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          type?: 'fixed' | 'variable'
          priority?: 'needs' | 'wants'
          due_day?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          priority: number
          type: 'emergency' | 'investment' | 'general'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          priority?: number
          type: 'emergency' | 'investment' | 'general'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          priority?: number
          type?: 'emergency' | 'investment' | 'general'
          created_at?: string
          updated_at?: string
        }
      }
      expense_payments: {
        Row: {
          id: string
          user_id: string
          expense_id: string
          month: number
          year: number
          paid_date: string | null
          actual_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expense_id: string
          month: number
          year: number
          paid_date?: string | null
          actual_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expense_id?: string
          month?: number
          year?: number
          paid_date?: string | null
          actual_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

