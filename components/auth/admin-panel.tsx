"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { UserProfile } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, CheckCircle } from "lucide-react"

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmingUser, setConfirmingUser] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      console.log("[v0] Admin: Loading users from API")
      const response = await fetch("/api/admin/list-users")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao carregar usuários")
      }

      console.log("[v0] Admin: Loaded", result.users.length, "users")
      setUsers(result.users || [])
    } catch (error: any) {
      console.log("[v0] Admin: Error loading users:", error.message)
      if (!error.message.includes("SERVICE_ROLE_KEY")) {
        setError("Erro ao carregar usuários: " + error.message)
      }
      setUsers([]) // Show empty list on error
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Admin: Starting user creation for:", newUserEmail)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          full_name: newUserName,
        }),
        signal: controller.signal, // Add abort signal
      })

      clearTimeout(timeoutId) // Clear timeout if request completes

      const result = await response.json()
      console.log("[v0] Admin: API response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar usuário")
      }

      setSuccess(result.message)
      setNewUserEmail("")
      setNewUserName("")
      setNewUserPassword("")
      await loadUsers()
      console.log("[v0] Admin: User creation completed successfully")
    } catch (error: any) {
      console.log("[v0] Admin: Error creating user:", error.message)

      if (error.name === "AbortError") {
        setError("Erro ao criar usuário: Tempo limite excedido. Tente novamente.")
      } else if (error.message.includes("SERVICE_ROLE_KEY")) {
        setError("Erro de configuração: Execute os scripts SQL primeiro.")
      } else {
        setError("Erro ao criar usuário: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmUser = async (email: string) => {
    setConfirmingUser(email)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Admin: Confirming user:", email)

      const response = await fetch("/api/admin/confirm-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao confirmar usuário")
      }

      setSuccess(result.message)
      await loadUsers()
      console.log("[v0] Admin: User confirmed successfully")
    } catch (error: any) {
      console.log("[v0] Admin: Error confirming user:", error.message)
      setError("Erro ao confirmar usuário: " + error.message)
    } finally {
      setConfirmingUser(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  placeholder="Nome da pessoa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                placeholder="Senha que o usuário usará para entrar"
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Usuário"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Cadastrados
            {users.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {users.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{user.full_name || "Sem nome"}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Criado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  {user.email_confirmed_at ? (
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      Email confirmado
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 mt-1">Email não confirmado</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!user.email_confirmed_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => confirmUser(user.email)}
                      disabled={confirmingUser === user.email}
                    >
                      {confirmingUser === user.email ? "Confirmando..." : "Confirmar Email"}
                    </Button>
                  )}
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "Usuário"}
                  </Badge>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">Crie o primeiro usuário usando o formulário acima</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
