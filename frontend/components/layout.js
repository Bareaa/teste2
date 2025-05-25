"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, LogOut } from "lucide-react"

export function Layout({ children, title, backLink, showLogout = false, currentRole }) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const getUserName = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userName") || "Usuário"
    }
    return "Usuário"
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {showLogout && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Olá {getUserName()}!</span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            )}
            {backLink && (
              <Button variant="outline" asChild>
                <Link href={backLink}>Início</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6 px-4">{children}</div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container flex flex-col sm:flex-row justify-between items-center px-4 text-sm text-muted-foreground">
          <div>© 2025 Sistema de Gestão Escolar</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="#" className="hover:underline">
              Contato
            </Link>
            <Link href="#" className="hover:underline">
              Termos de Serviço
            </Link>
            <Link href="#" className="hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
