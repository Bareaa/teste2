// realizar-aula-modal.js
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Defina a URL base da sua API.
// Ela deve estar configurada no seu arquivo .env.local (para desenvolvimento)
// e acessível no container via NEXT_PUBLIC_REACT_APP_API_URL.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api"; 

export function RealizarAulaModal({ isOpen, onClose, aula }) {
  const [observacoes, setObservacoes] = useState("")
  const [finalizada, setFinalizada] = useState(false)
  const [error, setError] = useState("")

  // Note: Se você quiser carregar observações e status de aulas existentes para edição,
  // precisaria de um useEffect aqui, similar aos outros modais,
  // usando os dados da prop 'aula' para pré-preencher os campos.
  // Exemplo:
  // useEffect(() => {
  //   if (aula) {
  //     setObservacoes(aula.observacoes || "");
  //     setFinalizada(aula.status === "FINALIZADA"); // Ajuste conforme o enum do seu banco
  //   } else {
  //     setObservacoes("");
  //     setFinalizada(false);
  //   }
  //   setError("");
  // }, [aula, isOpen]);


  const handleSubmit = async (e) => { // Tornar a função assíncrona para usar await
    e.preventDefault()

    if (!observacoes.trim()) {
      setError("O campo de observações é obrigatório")
      return
    }

    // O status da aula no banco de dados é um ENUM ('AGENDADO', 'FINALIZADA', 'CANCELADO')
    // Mapeie o checkbox 'finalizada' para o valor esperado pelo backend.
    const novoStatus = finalizada ? "FINALIZADA" : "AGENDADO"; // Ou "EM_ANDAMENTO" se tiver essa opção no seu enum

    const dadosParaAtualizar = {
      observacoes: observacoes,
      status: novoStatus,
      // Se houver outros campos que podem ser atualizados na "realização" da aula, inclua aqui.
      // Ex: dataRealizacao: new Date().toISOString(),
    }

    try {
      // Endpoint para atualizar um agendamento existente
      // Presume-se que você tenha um endpoint PUT/PATCH para '/agendamentos/:id'
      const response = await fetch(`${API_URL}/agendamentos/${aula.id}`, { // Assumindo que 'aula.id' é o ID do agendamento a ser atualizado
        method: 'PUT', // Ou 'PATCH', dependendo de como sua API foi construída para atualizações parciais
        headers: {
          'Content-Type': 'application/json',
          // Se houver autenticação (JWT_SECRET), adicione o token:
          // 'Authorization': `Bearer ${seuTokenJWT}` 
        },
        body: JSON.stringify(dadosParaAtualizar),
      });

      if (!response.ok) {
        // Se a resposta não for OK (status 4xx ou 5xx), tenta ler a mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido ao salvar a aula no backend.');
      }

      // Opcional: Se o backend retornar o objeto atualizado, você pode usá-lo
      // const aulaAtualizada = await response.json();

      alert("Aula salva com sucesso!"); // Alerta para o usuário após o sucesso da API
      onClose(); // Fecha o modal após o sucesso da API
      // Sugestão: O componente pai que abriu este modal deve recarregar a lista de aulas
      // para exibir as observações e o status atualizados.

    } catch (apiError) {
      console.error("Erro ao salvar a aula:", apiError);
      alert(`Erro ao salvar a aula: ${apiError.message}`); // Exibir erro para o usuário
      setError(`Falha ao salvar: ${apiError.message}`); // Mostrar erro no formulário também
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {aula.titulo} - {aula.estudante} {/* Assumindo que 'aula' tem 'titulo' e 'estudante' */}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Insira notas e comentários sobre o desempenho do estudante"
              value={observacoes}
              onChange={(e) => {
                setObservacoes(e.target.value)
                if (e.target.value.trim()) setError("")
              }}
              className={`min-h-[150px] ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="finalizada"
              checked={finalizada}
              onCheckedChange={(checked) => setFinalizada(checked === true)}
            />
            <Label htmlFor="finalizada">Marcar aula como Finalizada</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}