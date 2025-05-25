"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InserirProfessorModal } from "@/components/inserir-professor-modal"
import { Pencil, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Dados de exemplo
const professoresIniciais = [
  { id: 1, nome: "Roberto Castro", especialidade: "Inglês", status: true },
  { id: 2, nome: "Pedro da Silva", especialidade: "", status: true },
  { id: 3, nome: "Joana Oliveira", especialidade: "Francês", status: false },
]

export default function GestaoProfessoresPage() {
  const [professores, setProfessores] = useState(professoresIniciais)
  const [busca, setBusca] = useState("")
  const [modalAberta, setModalAberta] = useState(false)
  const [professorEditando, setProfessorEditando] = useState<any>(null)

  const professoresFiltrados = professores.filter(
    (professor) =>
      professor.nome.toLowerCase().includes(busca.toLowerCase()) ||
      professor.especialidade.toLowerCase().includes(busca.toLowerCase()),
  )

  const abrirModal = (professor = null) => {
    setProfessorEditando(professor)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setProfessorEditando(null)
  }

  const salvarProfessor = (professor: any) => {
    if (professorEditando) {
      setProfessores(
        professores.map((p) => (p.id === professorEditando.id ? { ...professor, id: professorEditando.id } : p)),
      )
    } else {
      setProfessores([...professores, { ...professor, id: Date.now() }])
    }
    fecharModal()
  }

  const excluirProfessor = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      setProfessores(professores.filter((p) => p.id !== id))
    }
  }

  return (
    <Layout title="Gestão de Professores" backLink="/admin" currentRole="admin">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Pesquisar Professores..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => abrirModal()}>Inserir Professor</Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professoresFiltrados.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell>{professor.nome}</TableCell>
                  <TableCell>{professor.especialidade || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={professor.status ? "default" : "secondary"}>
                      {professor.status ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrirModal(professor)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => excluirProfessor(professor.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Visualizar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {professoresFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Nenhum professor encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <InserirProfessorModal
        isOpen={modalAberta}
        onClose={fecharModal}
        onSave={salvarProfessor}
        professor={professorEditando}
      />
    </Layout>
  )
}
