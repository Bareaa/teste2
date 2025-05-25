"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { GraduationCap, Calendar, Users } from "lucide-react"
import { useEffect } from "react"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "ADMINISTRADOR") {
      router.push("/")
    }
  }, [router])

  return (
    <Layout title="Dashboard Administrativo" showLogout={true} currentRole="admin">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Gestão de Estudantes
            </CardTitle>
            <CardDescription>Gerencie registros e informações dos estudantes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <Button onClick={() => router.push("/admin/estudantes")}>Acessar</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Gestão de Agendamentos
            </CardTitle>
            <CardDescription>Visualize e gerencie os agendamentos de aulas.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <Button onClick={() => router.push("/admin/agendamentos")}>Acessar</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestão de Professores
            </CardTitle>
            <CardDescription>Visualize e gerencie perfis de professores.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <Button onClick={() => router.push("/admin/professores")}>Acessar</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
