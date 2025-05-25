"use client"

import { useState, useEffect, useCallback } from "react" // Adicionado useCallback
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InserirEstudanteModal } from "@/components/inserir-estudante-modal"
import { Pencil, Trash2, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

// Defina a URL base da sua API.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api";
const WHATSAPP_BASE_URL = process.env.NEXT_PUBLIC_REACT_APP_WHATSAPP_BASE_URL || "https://api.whatsapp.com/send/?phone=";

export default function GestaoEstudantesPage() {
  const [estudantes, setEstudantes] = useState([]) // Começa vazio, será preenchido pela API
  const [busca, setBusca] = useState("")
  const [modalAberta, setModalAberta] = useState(false)
  const [estudanteEditando, setEstudanteEditando] = useState(null)
  const [loading, setLoading] = useState(true) // Novo estado de carregamento
  const [error, setError] = useState(null)     // Novo estado de erro
  const router = useRouter()

  // Função para buscar estudantes do backend
  // Usamos useCallback para que esta função não seja recriada a cada render
  const fetchEstudantes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwtToken"); // Obtenha o token JWT do localStorage

    try {
      const response = await fetch(`${API_URL}/estudantes`, {
        headers: {
          'Authorization': `Bearer ${token}` // Incluir token JWT se sua API exigir
        }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/"); // Redireciona para login se não autenticado/autorizado
          throw new Error("Não autorizado. Faça login novamente.");
        }
        throw new Error("Falha ao buscar estudantes.");
      }
      const data = await response.json();
      setEstudantes(data);
    } catch (err) {
      console.error("Erro ao carregar estudantes:", err);
      setError(err.message || "Erro ao carregar dados dos estudantes.");
    } finally {
      setLoading(false);
    }
  }, [router]); // router como dependência do useCallback

  // Efeito para verificar a role e buscar dados na montagem
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "ADMINISTRADOR") {
      router.push("/");
    } else {
      fetchEstudantes(); // Chama a função para buscar estudantes
    }
  }, [router, fetchEstudantes]); // fetchEstudantes como dependência

  const estudantesFiltrados = estudantes
    .filter((estudante) => estudante.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const abrirModal = (estudante = null) => {
    setEstudanteEditando(estudante)
    setModalAberta(true)
  }

  const fecharModal = () => {
    setModalAberta(false)
    setEstudanteEditando(null)
    fetchEstudantes(); // <--- IMPORTANTE: Recarrega os estudantes quando o modal fecha
  }

  // A função salvarEstudante agora faz a chamada à API
  const salvarEstudante = async (estudanteData) => {
    const token = localStorage.getItem("jwtToken"); // Obtenha o token JWT

    try {
      let response;
      if (estudanteEditando) { // Se estiver editando
        response = await fetch(`${API_URL}/estudantes/${estudanteEditando.id}`, { // PUT para editar
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(estudanteData),
        });
      } else { // Se estiver criando
        response = await fetch(`${API_URL}/estudantes`, { // POST para criar
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(estudanteData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar estudante na API.');
      }

      alert("Estudante salvo com sucesso!");
      fecharModal(); // Fecha o modal e dispara fetchEstudantes para recarregar
    } catch (err) {
      console.error("Erro ao salvar estudante:", err);
      alert(`Erro ao salvar estudante: ${err.message}`);
    }
  };

  // A função excluirEstudante agora faz a chamada à API
  const excluirEstudante = async (id) => {
  console.log("Tentando excluir estudante com ID:", id);
  if (confirm("Tem certeza que deseja excluir este estudante?")) {
    console.log("Confirmação de exclusão aceita para ID:", id);
    const token = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(`${API_URL}/estudantes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          throw new Error("Não autorizado. Faça login novamente.");
        }
        throw new Error("Falha ao excluir estudante.");
      }

      alert("Estudante excluído com sucesso!");
      fetchEstudantes(); // Recarrega a lista após excluir
    } catch (err) {
      console.error("Erro ao excluir estudante:", err);
      alert(`Erro ao excluir estudante: ${err.message}`);
    }
  } else {
    console.log("Confirmação de exclusão CANCELADA para ID:", id);
  }
}

  const formatarWhatsApp = (whatsapp) => {
    const numeroLimpo = whatsapp.replace(/\D/g, "")
    return `${WHATSAPP_BASE_URL}${numeroLimpo}`
  }

  const irParaAgendamentos = (estudanteId) => { // Pode ser útil passar o ID do estudante
    router.push(`/admin/agendamentos?estudanteId=${estudanteId}`); // Navega para a página de agendamentos
  }

  return (
    <Layout title="Gestão de Estudantes" backLink="/admin" currentRole="admin">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Pesquisar Estudantes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => abrirModal()}>Inserir Estudante</Button>
        </div>

        <div className="border rounded-md">
          {loading ? (
            <p className="text-center py-4">Carregando estudantes...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">Erro: {error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudantesFiltrados.length > 0 ? (
                  estudantesFiltrados.map((estudante) => (
                    <TableRow key={estudante.id}>
                      <TableCell>{estudante.nome}</TableCell>
                      <TableCell>
                        <a
                          href={formatarWhatsApp(estudante.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {estudante.whatsapp}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => abrirModal(estudante)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => excluirEstudante(estudante.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => irParaAgendamentos(estudante.id)}>
                            <Calendar className="h-4 w-4" />
                            <span className="sr-only">Agendar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      Nenhum estudante encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <InserirEstudanteModal
        isOpen={modalAberta}
        onClose={fecharModal}
        onSave={salvarEstudante} // onSave agora chama a função que faz a requisição
        estudante={estudanteEditando}
        estudantesExistentes={estudantes} // Ainda útil para validação de CPF único no frontend
      />
    </Layout>
  )
}