"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useState, useEffect, useCallback } from "react" // Adicionado useCallback
import { RealizarAulaModal } from "@/components/realizar-aula-modal"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

// Defina a URL base da sua API.
// Ela deve estar configurada no seu arquivo .env.local (para desenvolvimento)
// e acessível no container via NEXT_PUBLIC_REACT_APP_API_URL.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api";
const WHATSAPP_BASE_URL = process.env.NEXT_PUBLIC_REACT_APP_WHATSAPP_BASE_URL || "https://api.whatsapp.com/send/?phone=";

export default function ProfessorPage() {
  const [aulasHoje, setAulasHoje] = useState([]) // Agora será preenchido pela API
  const [historicoAulas, setHistoricoAulas] = useState([]) // Agora será preenchido pela API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [aulaAtual, setAulaAtual] = useState(null)
  const [modalAberta, setModalAberta] = useState(false)
  const router = useRouter()

  // Função para buscar as aulas do backend
  // Usamos useCallback para que esta função não seja recriada a cada render
  const fetchAulas = useCallback(async () => {
    setLoading(true)
    setError(null)
    const professorId = localStorage.getItem("userId"); // Assumindo que você guarda o ID do professor no localStorage
    const token = localStorage.getItem("jwtToken"); // Assumindo que você guarda o token JWT no localStorage

    if (!professorId) {
      setError("ID do professor não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      // 1. Buscar Aulas Agendadas para Hoje
      const hoje = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const aulasHojeResponse = await fetch(`${API_URL}/agendamentos?professorId=${professorId}&data=${hoje}&status=AGENDADO`, {
        headers: {
          'Authorization': `Bearer ${token}` // Incluir token JWT se sua API exigir
        }
      });
      if (!aulasHojeResponse.ok) throw new Error("Falha ao buscar aulas de hoje.");
      const aulasHojeData = await aulasHojeResponse.json();
      setAulasHoje(aulasHojeData);

      // 2. Buscar Histórico de Aulas (Finalizadas ou Canceladas)
      const historicoResponse = await fetch(`${API_URL}/agendamentos?professorId=${professorId}&status=FINALIZADA,CANCELADO`, {
        headers: {
          'Authorization': `Bearer ${token}` // Incluir token JWT se sua API exigir
        }
      });
      if (!historicoResponse.ok) throw new Error("Falha ao buscar histórico de aulas.");
      const historicoData = await historicoResponse.json();
      setHistoricoAulas(historicoData);

    } catch (err) {
      console.error("Erro ao carregar aulas:", err);
      setError(err.message || "Erro ao carregar dados das aulas.");
    } finally {
      setLoading(false);
    }
  }, []); // Dependências do useCallback: nenhuma por enquanto, mas pode incluir professorId se ele vier de um state

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "PROFESSOR") {
      router.push("/")
    } else {
      fetchAulas(); // Chama a função para buscar as aulas quando o componente é montado ou o role é confirmado
    }
  }, [router, fetchAulas]) // fetchAulas adicionado como dependência

  const abrirModal = (aula) => {
    setAulaAtual(aula)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setAulaAtual(null)
    fetchAulas(); // <--- IMPORTANTE: Recarrega as aulas quando o modal de "Realizar Aula" é fechado
  }

  const abrirWhatsApp = (whatsapp) => {
    const numeroLimpo = whatsapp.replace(/\D/g, "")
    window.open(`${WHATSAPP_BASE_URL}${numeroLimpo}`, "_blank")
  }

  return (
    <Layout title="Dashboard do Professor" showLogout={true} currentRole="professor">
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <div className="md:col-span-2 text-center py-8">Carregando aulas...</div>
        ) : error ? (
          <div className="md:col-span-2 text-center py-8 text-red-500">Erro: {error}</div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Aulas do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aulasHoje.length > 0 ? (
                    aulasHoje.map((aula) => (
                      <div key={aula.id} className="border rounded-lg p-4">
                        <div className="mb-2">
                          <h3 className="font-medium">{aula.conteudo_aula || aula.titulo}</h3> {/* Ajustado para 'conteudo_aula' do banco */}
                          <p className="text-sm text-muted-foreground">
                            Estudante: {aula.estudante?.nome || aula.estudante} - Data: {new Date(aula.data_aula).toLocaleDateString()}, Hora: {new Date(aula.data_aula).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => abrirModal(aula)}>Realizar Aula</Button>
                          {aula.estudante?.whatsapp && ( // Verifica se o estudante tem whatsapp antes de mostrar o botão
                            <Button
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => abrirWhatsApp(aula.estudante.whatsapp)}
                            >
                              <MessageSquare className="h-4 w-4" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
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
                  {historicoAulas.length > 0 ? (
                    historicoAulas.map((aula) => (
                      <div key={aula.id} className="border rounded-lg p-4">
                        <div className="mb-2">
                          <h3 className="font-medium">
                            {aula.conteudo_aula || aula.titulo} - {aula.estudante?.nome || aula.estudante}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Data: {new Date(aula.data_aula).toLocaleDateString()}, Hora: {new Date(aula.data_aula).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className={`text-sm font-medium ${aula.status === 'FINALIZADA' ? 'text-green-600' : 'text-red-600'}`}>
                            Status: {aula.status}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => abrirModal(aula)}>Visualizar/Editar</Button> {/* Permite abrir o modal para ver detalhes/editar obs */}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Não há histórico de aulas.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {modalAberta && aulaAtual && <RealizarAulaModal aula={aulaAtual} isOpen={modalAberta} onClose={fecharModal} />}
    </Layout>
  )
}