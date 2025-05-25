"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useState } from "react"
import { RealizarAulaModal } from "@/components/realizar-aula-modal"
import { MessageSquare } from "lucide-react"

// Dados de exemplo
const aulasHoje = [
  {
    id: 1,
    titulo: "Francês Avançado",
    estudante: "João da Silva",
    data: "25/11/2023",
    hora: "10:00",
  },
  {
    id: 2,
    titulo: "Francês Intermediário",
    estudante: "Maria de Souza",
    data: "25/11/2023",
    hora: "14:00",
  },
]

const historicoAulas = [
  {
    id: 3,
    titulo: "Francês Iniciante",
    estudante: "Carlos Pereira",
    data: "24/11/2023",
    hora: "10:00",
  },
  {
    id: 4,
    titulo: "Francês Avançado",
    estudante: "Ana Lima",
    data: "20/11/2023",
    hora: "15:00",
  },
  {
    id: 5,
    titulo: "Francês Intermediário",
    estudante: "Maria de Souza",
    data: "22/11/2023",
    hora: "14:00",
  },
]

export default function ProfessorPage() {
  const [aulaAtual, setAulaAtual] = useState<any>(null)
  const [modalAberta, setModalAberta] = useState(false)

  const abrirModal = (aula: any) => {
    setAulaAtual(aula)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setAulaAtual(null)
  }

  return (
    <Layout title="Bem-vindo PROFESSOR!" showLogout={true} currentRole="professor">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aulas do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aulasHoje.map((aula) => (
                <div key={aula.id} className="border rounded-lg p-4">
                  <div className="mb-2">
                    <h3 className="font-medium">{aula.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      Estudante: {aula.estudante} - Data: {aula.data}, Hora: {aula.hora}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => abrirModal(aula)}>Realizar Aula</Button>
                    <Button variant="outline" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
              {aulasHoje.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Não há aulas agendadas para hoje.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Aulas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historicoAulas.map((aula) => (
                <div key={aula.id} className="border rounded-lg p-4">
                  <div className="mb-2">
                    <h3 className="font-medium">
                      {aula.titulo} - {aula.estudante}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Estudante: {aula.estudante} - Data: {aula.data}, Hora: {aula.hora}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline">Visualizar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {modalAberta && aulaAtual && <RealizarAulaModal aula={aulaAtual} isOpen={modalAberta} onClose={fecharModal} />}
    </Layout>
  )
}
