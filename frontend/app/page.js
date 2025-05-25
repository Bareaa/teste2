"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()

    if (username.toLowerCase() === "admin" && password === "admin") {
      localStorage.setItem("userRole", "ADMINISTRADOR")
      localStorage.setItem("userName", "Administrador")
      router.push("/admin")
    } else if (username.toLowerCase() === "professor" && password === "professor") {
      localStorage.setItem("userRole", "PROFESSOR")
      localStorage.setItem("userName", "Professor")
      router.push("/professor")
    } else {
      alert("Credenciais inválidas")
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-bold">Sistema de Gestão Escolar</h1>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Use admin/admin para entrar como administrador</p>
            <p>Use professor/professor para entrar como professor</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
