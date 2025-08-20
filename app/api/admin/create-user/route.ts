import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Starting user creation process")

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 10000) // 10 second timeout
    })

    const createUserPromise = async () => {
      const { email, password, full_name } = await request.json()
      console.log("[v0] API: Creating user for email:", email)

      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured")
      }

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured")
      }

      // Create admin client with service role key
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      console.log("[v0] API: Supabase admin client created")

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation
        email_confirmed_at: new Date().toISOString(), // Mark as confirmed immediately
        user_metadata: {
          full_name,
        },
      })

      if (authError) {
        console.log("[v0] API: Auth error:", authError.message)
        throw new Error(authError.message)
      }

      console.log("[v0] API: User created in auth, ID:", authData.user.id)

      // Create user profile in our custom table (if tables exist)
      try {
        const { error: profileError } = await supabaseAdmin.from("user_profiles").insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          role: "user",
        })

        if (profileError) {
          console.log("[v0] API: Profile creation failed (tables may not exist yet):", profileError.message)
        } else {
          console.log("[v0] API: Profile created successfully")
        }
      } catch (profileError: any) {
        console.log("[v0] API: Profile table not available yet:", profileError.message)
      }

      return {
        success: true,
        message: `Usuário ${email} criado com sucesso!`,
        user: authData.user,
      }
    }

    const result = await Promise.race([createUserPromise(), timeoutPromise])
    console.log("[v0] API: User creation completed successfully")

    return NextResponse.json(result)
  } catch (error: any) {
    console.log("[v0] API: Error creating user:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
