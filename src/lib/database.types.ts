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
      admin_users: {
        Row: {
          id: string
          user_id: string
          email: string
          role: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          role?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          role?: string
          is_active?: boolean
          created_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          instagram_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          instagram_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          instagram_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string
          title: string
          slug: string
          description: string
          image_url: string | null
          price: number
          currency: string
          max_quantity: number | null
          end_date: string | null
          delivery_delay_text: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          slug: string
          description: string
          image_url?: string | null
          price: number
          currency?: string
          max_quantity?: number | null
          end_date?: string | null
          delivery_delay_text: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          slug?: string
          description?: string
          image_url?: string | null
          price?: number
          currency?: string
          max_quantity?: number | null
          end_date?: string | null
          delivery_delay_text?: string
          is_active?: boolean
          created_at?: string
        }
      }
      preorders: {
        Row: {
          id: string
          product_id: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          address_line1: string | null
          city: string | null
          zip: string | null
          country: string | null
          variant: string | null
          quantity: number
          status: string
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          address_line1?: string | null
          city?: string | null
          zip?: string | null
          country?: string | null
          variant?: string | null
          quantity?: number
          status?: string
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          address_line1?: string | null
          city?: string | null
          zip?: string | null
          country?: string | null
          variant?: string | null
          quantity?: number
          status?: string
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
