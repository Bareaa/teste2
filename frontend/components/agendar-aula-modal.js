// agendar-aula-modal.js
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Defina a URL base da sua API.
// Ela deve estar configurada no seu arquivo .env.local (para desenvolvimento)
// e acessível no container via NEXT_PUBLIC_REACT_APP_API_URL.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api";

export function AgendarAulaModal({ isOpen, onClose, onSave, agendamento }) {
  const [formData, setFormData] = useState({
    data: "", // Será a data formatada (dd/MM/yyyy)
    hora: "",
    professorId: "",
    estudanteId: "",
    conteudo: "", // Mapeia para 'conteudo_aula' no backend
  })
  const [date, setDate] = useState(undefined)
  const [errors, setErrors] = useState({})
  const [professoresReais, setProfessoresReais] = useState([]); // Armazenará professores do backend
  const [estudantesReais, setEstudantesReais] = useState([]);   // Armazenará estudantes do backend
  const [loadingData, setLoadingData] = useState(true); // Para gerenciar estado de carregamento

  // Efeito para carregar dados de professores e estudantes do backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true);
        // Buscando professores
        const profResponse = await fetch(`${API_URL}/usuarios?tipo=PROFESSOR`); // Assumindo endpoint de usuários com filtro de tipo
        if (!profResponse.ok) throw new Error("Falha ao buscar professores.");
        const profsData = await profResponse.json();
        setProfessoresReais(profsData);

        // Buscando estudantes
        const estResponse = await fetch(`${API_URL}/estudantes`); // Assumindo endpoint de estudantes
        if (!estResponse.ok) throw new Error("Falha ao buscar estudantes.");
        const estsData = await estResponse.json();
        setEstudantesReais(estsData);

      } catch (error) {
        console.error("Erro ao carregar dados para o modal de agendamento:", error);
        alert(`Erro ao carregar dados: ${error.message}`);
      } finally {
        setLoadingData(false);
      }
    }

    if (isOpen) {
      fetchData(); // Busca os dados sempre que o modal abre
      // Resetar formulário e erros ao abrir ou editar
      if (agendamento) {
        setFormData({
          data: agendamento.data ? format(new Date(agendamento.data), "dd/MM/yyyy") : "",
          hora: agendamento.hora || "",
          professorId: agendamento.professorId?.toString() || "", // Convertendo para string para o Select
          estudanteId: agendamento.estudanteId?.toString() || "", // Convertendo para string para o Select
          conteudo: agendamento.conteudo || "",
        });
        setDate(agendamento.data ? new Date(agendamento.data) : undefined);
      } else {
        setFormData({ data: "", hora: "", professorId: "", estudanteId: "", conteudo: "" });
        setDate(undefined);
      }
      setErrors({});
    }
  }, [agendamento, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate)
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy")
      setFormData((prev) => ({ ...prev, data: formattedDate }))

      if (errors.data) {
        setErrors((prev) => ({ ...prev, data: "" }))
      }
    } else {
      setFormData((prev) => ({ ...prev, data: "" }))
    }
  }

  const verificarIdadeEstudante = (estudanteId) => {
    const estudante = estudantesReais.find((e) => e.id.toString() === estudanteId)
    if (estudante && estudante.dataNascimento) { // Verificar se dataNascimento existe
      const hoje = new Date()
      const nascimento = new Date(estudante.dataNascimento)
      const idade = hoje.getFullYear() - nascimento.getFullYear()
      const mesAtual = hoje.getMonth()
      const mesNascimento = nascimento.getMonth()

      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        return idade - 1 < 16
      }
      return idade < 16
    }
    return false // Retorna false se estudante ou dataNascimento não for encontrado
  }

  // NOTE: Esta lógica de limite de professor no dia deve ser verificada no backend!
  // O frontend não tem como saber as aulas agendadas para um professor sem uma API específica.
  // Por enquanto, mantenho a lógica de exemplo, mas saiba que é limitada ao mock.
  const verificarLimiteProfessor = (professorId, dataAula) => {
    // Isso é um MOCK. Você precisaria de um endpoint no backend para verificar aulas agendadas por professor e dia.
    const aulasNoDia = 1 
    return aulasNoDia >= 2
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.data) newErrors.data = "Data é obrigatória"
    if (!formData.hora) newErrors.hora = "Horário é obrigatório" // Adicionado validação de horário
    if (!formData.professorId) newErrors.professorId = "Professor é obrigatório"
    if (!formData.estudanteId) newErrors.estudanteId = "Estudante é obrigatório"
    if (!formData.conteudo) newErrors.conteudo = "Conteúdo da aula é obrigatório"

    if (formData.data && formData.hora) {
      const [dia, mes, ano] = formData.data.split("/").map(Number)
      const dataAula = new Date(ano, mes - 1, dia, parseInt(formData.hora.split(":")[0]), parseInt(formData.hora.split(":")[1]));
      const agora = new Date()
      const diferencaHoras = (dataAula.getTime() - agora.getTime()) / (1000 * 60 * 60) // Corrigido cálculo de diferença de horas

      if (diferencaHoras < 24) {
        newErrors.data = "Agendamentos devem ser feitos com pelo menos 24 horas de antecedência"
      }
    }

    if (formData.professorId && formData.data) {
      if (verificarLimiteProfessor(formData.professorId, formData.data)) {
        newErrors.professorId = "Este professor já possui 2 aulas agendadas para este dia"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const gerarPDFResponsavel = (estudante, aula) => {
    const conteudoPDF = `
      AUTORIZAÇÃO PARA AULA PARTICULAR
      
      Dados do Estudante:
      Nome: ${estudante.nome}
      Data de Nascimento: ${estudante.dataNascimento}
      
      Dados da Aula:
      Data: ${aula.data}
      Horário: ${aula.hora}
      Professor: ${aula.professor}
      Conteúdo: ${aula.conteudo}
      
      Eu, _________________________, responsável pelo(a) menor ${estudante.nome},
      autorizo a participação nas aulas particulares conforme dados acima.
      
      Data: ___/___/______
      
      Assinatura do Responsável: _________________________
    `

    const blob = new Blob([conteudoPDF], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `autorizacao_${estudante.nome.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // --- NOVA FUNÇÃO PARA SALVAR NO BACKEND ---
  const handleSaveToBackend = async (dataToSave) => {
    try {
      let response;
      // Formatar data e hora para um formato que o backend espera (ex: ISO 8601)
      const [dia, mes, ano] = dataToSave.data.split("/");
      const dataHoraCompleta = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), parseInt(dataToSave.hora.split(":")[0]), parseInt(dataToSave.hora.split(":")[1]), 0);
      
      const payload = {
        estudante_id: parseInt(dataToSave.estudanteId),
        professor_id: parseInt(dataToSave.professorId),
        data_aula: dataHoraCompleta.toISOString(), // Envia como ISO string para o backend/DB
        conteudo_aula: dataToSave.conteudo, // Ajustado para corresponder ao nome da coluna no banco
        status: "AGENDADO", // Define o status inicial
        // Não precisamos enviar 'professor' e 'estudante' nomes, apenas os IDs.
        // Observacoes seriam adicionadas na modal de "Realizar Aula"
      };

      if (agendamento && agendamento.id) { // Se 'agendamento' existe e tem 'id', é edição
        response = await fetch(`${API_URL}/agendamentos/${agendamento.id}`, { // Ex: PUT /api/agendamentos/:id
          method: 'PUT', // Ou 'PATCH'
          headers: {
            'Content-Type': 'application/json',
            // Adicione Authorization Bearer Token aqui se a API exigir autenticação
            // 'Authorization': `Bearer ${seuTokenJWT}` 
          },
          body: JSON.stringify(payload), 
        });
      } else { // Caso contrário, é uma nova criação
        response = await fetch(`${API_URL}/agendamentos`, { // Ex: POST /api/agendamentos
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Adicione Authorization Bearer Token aqui se a API exigir autenticação
            // 'Authorization': `Bearer ${seuTokenJWT}` 
          },
          body: JSON.stringify(payload), 
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar agendamento no backend.');
      }

      const savedAgendamento = await response.json(); // Opcional: obter a resposta do backend
      
      onClose(); // Fecha o modal
      // Se onSave for uma prop para atualizar a lista no componente pai, chame-a aqui
      if (onSave) {
          onSave(savedAgendamento); 
      }
      alert("Agendamento salvo com sucesso!"); // Alerta após sucesso da API

    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert(`Erro ao salvar agendamento: ${error.message}`); // Exibir erro para o usuário
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      const professorSelecionado = professoresReais.find((p) => p.id.toString() === formData.professorId);
      const estudanteSelecionado = estudantesReais.find((e) => e.id.toString() === formData.estudanteId);

      // Verificação de idade e geração de PDF (mantido)
      if (verificarIdadeEstudante(formData.estudanteId)) {
        if (
          confirm(
            "Este estudante é menor de 16 anos. Será gerado um documento para assinatura do responsável. Deseja continuar?",
          )
        ) {
          gerarPDFResponsavel(estudanteSelecionado, { // Passa o objeto completo para o PDF
            ...formData,
            professor: professorSelecionado?.nome,
            estudante: estudanteSelecionado?.nome,
          });
        } else {
            return; // Se o usuário cancelar a autorização, não prossegue com o salvamento
        }
      }
      
      handleSaveToBackend(formData); // Chama a função que enviará os dados para a API
    }
  }

  // --- JSX de Renderização ---
  if (loadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Carregando dados...</DialogTitle></DialogHeader>
          <div className="py-4 text-center">Carregando professores e estudantes...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agendar Aula</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">
                Data do agendamento <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        errors.data && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus locale={ptBR} />
                  </PopoverContent>
                </Popover>
                <Input
                  id="hora"
                  name="hora"
                  type="time"
                  value={formData.hora}
                  onChange={handleChange}
                  placeholder="Horário"
                  className={errors.hora ? "border-red-500" : ""}
                />
              </div>
              {errors.data && <p className="text-xs text-red-500">{errors.data}</p>}
              {errors.hora && <p className="text-xs text-red-500">{errors.hora}</p>} {/* Exibe erro de horário */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="professorId">
                Professor <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.professorId} onValueChange={(value) => handleSelectChange("professorId", value)} disabled={loadingData}>
                <SelectTrigger className={errors.professorId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {professoresReais.map((professor) => ( // Usando dados reais
                    <SelectItem key={professor.id} value={professor.id.toString()}>
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.professorId && <p className="text-xs text-red-500">{errors.professorId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estudanteId">
                Estudante <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.estudanteId} onValueChange={(value) => handleSelectChange("estudanteId", value)} disabled={loadingData}>
                <SelectTrigger className={errors.estudanteId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {estudantesReais.map((estudante) => ( // Usando dados reais
                    <SelectItem key={estudante.id} value={estudante.id.toString()}>
                      {estudante.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estudanteId && <p className="text-xs text-red-500">{errors.estudanteId}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="conteudo">
                Conteúdo da aula <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="conteudo"
                name="conteudo"
                placeholder="Insira aqui o conteúdo da sua aula..."
                value={formData.conteudo}
                onChange={handleChange}
                className={cn("min-h-[120px]", errors.conteudo && "border-red-500")}
              />
              {errors.conteudo && <p className="text-xs text-red-500">{errors.conteudo}</p>}
            </div>
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