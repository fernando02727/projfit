import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] API: Listing users from Supabase auth")

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

    // List users from Supabase auth
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.log("[v0] API: Error listing users:", error.message)
      throw new Error(error.message)
    }

    console.log("[v0] API: Found", users.length, "users")

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        role: user.user_metadata?.role || "user",
        created_at: user.created_at,
      })),
    })
  } catch (error: any) {
    console.log("[v0] API: Error listing users:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
