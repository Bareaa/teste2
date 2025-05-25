"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AgendarAulaModal } from "@/components/agendar-aula-modal"
import { Pencil, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Dados de exemplo
const agendamentosIniciais = [
  {
    id: 1,
    conteudo: "Verbs To Be",
    status: "Em andamento",
    estudante: "Paulo Costa",
  },
  {
    id: 2,
    conteudo: "Numbers",
    status: "Cancelada",
    estudante: "Pedro Silva",
  },
  {
    id: 3,
    conteudo: "Alphabet",
    status: "Finalizada",
    estudante: "Maria Medeiros",
  },
]

export default function GestaoAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais)
  const [busca, setBusca] = useState("")
  const [modalAberta, setModalAberta] = useState(false)
  const [agendamentoEditando, setAgendamentoEditando] = useState<any>(null)

  const agendamentosFiltrados = agendamentos.filter(
    (agendamento) =>
      agendamento.conteudo.toLowerCase().includes(busca.toLowerCase()) ||
      agendamento.estudante.toLowerCase().includes(busca.toLowerCase()),
  )

  const abrirModal = (agendamento = null) => {
    setAgendamentoEditando(agendamento)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setAgendamentoEditando(null)
  }

  const salvarAgendamento = (agendamento: any) => {
    if (agendamentoEditando) {
      setAgendamentos(
        agendamentos.map((a) => (a.id === agendamentoEditando.id ? { ...agendamento, id: agendamentoEditando.id } : a)),
      )
    } else {
      setAgendamentos([...agendamentos, { ...agendamento, id: Date.now(), status: "Em andamento" }])
    }
    fecharModal()
  }

  const cancelarAgendamento = (id: number) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      setAgendamentos(agendamentos.map((a) => (a.id === id ? { ...a, status: "Cancelada" } : a)))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em andamento":
        return <Badge variant="default">Em andamento</Badge>
      case "Cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      case "Finalizada":
        return <Badge variant="secondary">Finalizada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Layout title="Gestão de Agendamentos" backLink="/admin" currentRole="admin">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Pesquisar Aulas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => abrirModal()}>Agendar</Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conteúdo da Aula</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nome do Estudante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentosFiltrados.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell>{agendamento.conteudo}</TableCell>
                  <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                  <TableCell>{agendamento.estudante}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModal(agendamento)}
                        disabled={agendamento.status === "Finalizada"}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelarAgendamento(agendamento.id)}
                        disabled={agendamento.status !== "Em andamento"}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancelar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {agendamentosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Nenhum agendamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AgendarAulaModal
        isOpen={modalAberta}
        onClose={fecharModal}
        onSave={salvarAgendamento}
        agendamento={agendamentoEditando}
      />
    </Layout>
  )
}
