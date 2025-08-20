import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "user"
  created_at: string
  updated_at: string
}

export type DietDay = {
  id: string
  user_id: string
  date: string
  day_type: string
  completed: boolean
  meals_completed: { [key: string]: boolean }
  supplements_completed: boolean[]
  water_intake: number
  created_at: string
  updated_at: string
}

export type MealCustomization = {
  id: string
  user_id: string
  date: string
  meal_name: string
  customizations: { [key: string]: string }
  custom_items: string[]
  created_at: string
  updated_at: string
}
