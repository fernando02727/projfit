import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Starting user confirmation process")

    const { email } = await request.json()
    console.log("[v0] API: Confirming user for email:", email)

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Supabase environment variables not configured")
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get user by email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()

    if (getUserError) {
      throw new Error(getUserError.message)
    }

    const user = users.users.find((u) => u.email === email)

    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    // Update user to mark as confirmed
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      email_confirmed_at: new Date().toISOString(),
    })

    if (updateError) {
      throw new Error(updateError.message)
    }

    console.log("[v0] API: User confirmed successfully:", email)

    return NextResponse.json({
      success: true,
      message: `Usuário ${email} confirmado com sucesso!`,
    })
  } catch (error: any) {
    console.log("[v0] API: Error confirming user:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
