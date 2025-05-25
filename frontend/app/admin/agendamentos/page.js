"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AgendarAulaModal } from "@/components/agendar-aula-modal"
import { Pencil, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation" // Adicionado useSearchParams

// Defina a URL base da sua API.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api";

export default function GestaoAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]) // Começa vazio
  const [busca, setBusca] = useState("")
  const [modalAberta, setModalAberta] = useState(false)
  const [agendamentoEditando, setAgendamentoEditando] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams(); // Hook para ler parâmetros da URL

  // Obtém o ID do estudante da URL se houver
  const estudanteIdFromUrl = searchParams.get('estudanteId');

  // Função para buscar agendamentos do backend
  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwtToken");

    try {
      let url = `${API_URL}/agendamentos`;
      // Adiciona filtro por estudanteId se presente na URL
      if (estudanteIdFromUrl) {
        url += `?estudanteId=${estudanteIdFromUrl}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          throw new Error("Não autorizado. Faça login novamente.");
        }
        throw new Error("Falha ao buscar agendamentos.");
      }
      const data = await response.json();
      setAgendamentos(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError(err.message || "Erro ao carregar dados dos agendamentos.");
    } finally {
      setLoading(false);
    }
  }, [router, estudanteIdFromUrl]); // Adicionado estudanteIdFromUrl como dependência

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole !== "ADMINISTRADOR") {
      router.push("/")
    } else {
      fetchAgendamentos(); // Busca agendamentos quando a página é montada
    }
  }, [router, fetchAgendamentos])

  const agendamentosFiltrados = agendamentos.filter(
    (agendamento) =>
      (agendamento.conteudo_aula?.toLowerCase().includes(busca.toLowerCase()) || // Conteúdo da aula
      agendamento.estudante?.nome?.toLowerCase().includes(busca.toLowerCase())) // Nome do estudante
  ).sort((a, b) => new Date(a.data_aula).getTime() - new Date(b.data_aula).getTime()); // Ordenar por data

  const abrirModal = (agendamento = null) => {
    if (agendamento) {
      // Data de agendamento do banco (ex: 2025-05-26T14:00:00.000Z)
      const dataAulaTimestamp = new Date(agendamento.data_aula);
      const agora = new Date();
      const diferencaHoras = (dataAulaTimestamp.getTime() - agora.getTime()) / (1000 * 60 * 60);

      // Permite editar se a diferença for maior que 24h OU se o status não for "AGENDADO"
      // (ex: um admin pode querer editar um agendamento cancelado ou finalizado por algum motivo)
      if (diferencaHoras < 24 && agendamento.status === "AGENDADO") {
        alert("Agendamentos 'AGENDADO' com menos de 24 horas de antecedência não podem ser editados.");
        return;
      }
    }

    setAgendamentoEditando(agendamento)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setAgendamentoEditando(null)
    fetchAgendamentos(); // <--- IMPORTANTE: Recarrega agendamentos após modal fechar
  }

  // A função salvarAgendamento agora faz a chamada à API
  const salvarAgendamento = async (agendamentoData) => { // Dados já tratados pelo modal
    const token = localStorage.getItem("jwtToken");

    try {
      let response;
      if (agendamentoEditando) { // Se estiver editando
        response = await fetch(`${API_URL}/agendamentos/${agendamentoEditando.id}`, {
          method: 'PUT', // Ou 'PATCH'
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(agendamentoData),
        });
      } else { // Se estiver criando
        response = await fetch(`${API_URL}/agendamentos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(agendamentoData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar agendamento na API.');
      }

      alert("Agendamento salvo com sucesso!");
      fecharModal(); // Fecha o modal e recarrega a lista
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      alert(`Erro ao salvar agendamento: ${err.message}`);
    }
  };

  // A função cancelarAgendamento agora faz a chamada à API
  const cancelarAgendamento = async (id) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const token = localStorage.getItem("jwtToken");

      try {
        const response = await fetch(`${API_URL}/agendamentos/${id}`, {
          method: 'PUT', // Ou PATCH, para atualizar o status
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: "CANCELADO" }), // Envia apenas o novo status
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao cancelar agendamento na API.');
        }

        alert("Agendamento cancelado com sucesso!");
        fetchAgendamentos(); // Recarrega a lista de agendamentos
      } catch (err) {
        console.error("Erro ao cancelar agendamento:", err);
        alert(`Erro ao cancelar agendamento: ${err.message}`);
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "AGENDADO": // Mapeia para o ENUM do banco
        return <Badge variant="default">Agendado</Badge>
      case "CANCELADO": // Mapeia para o ENUM do banco
        return <Badge variant="destructive">Cancelado</Badge>
      case "FINALIZADA": // Mapeia para o ENUM do banco
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
          {loading ? (
            <p className="text-center py-4">Carregando agendamentos...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">Erro: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conteúdo da Aula</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estudante</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentosFiltrados.length > 0 ? (
                  agendamentosFiltrados.map((agendamento) => (
                    <TableRow key={agendamento.id}>
                      <TableCell>{agendamento.conteudo_aula}</TableCell> {/* Campo do banco */}
                      <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                      <TableCell>{agendamento.estudante?.nome}</TableCell> {/* Acessando nome do estudante populado */}
                      <TableCell>{agendamento.professor?.nome}</TableCell> {/* Acessando nome do professor populado */}
                      <TableCell>
                        {new Date(agendamento.data_aula).toLocaleDateString('pt-BR')} {/* Formata data */}
                        {" "}
                        {new Date(agendamento.data_aula).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {/* Formata hora */}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModal(agendamento)}
                            // Desabilita edição se a aula já está finalizada ou cancelada
                            disabled={agendamento.status === "FINALIZADA" || agendamento.status === "CANCELADO"}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                            // Desabilita cancelar se não estiver 'AGENDADO'
                            disabled={agendamento.status !== "AGENDADO"}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cancelar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum agendamento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
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