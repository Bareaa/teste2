// inserir-professor-modal.js
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Defina a URL base da sua API.
// Ela deve estar configurada no seu arquivo .env.local (para desenvolvimento)
// e acessível no container via NEXT_PUBLIC_REACT_APP_API_URL.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api"; 

export function InserirProfessorModal({ isOpen, onClose, onSave, professor, professoresExistentes = [] }) {
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    dataNascimento: "",
    especialidade: "", 
    status: true,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (professor) {
      setFormData({
        cpf: professor.cpf || "",
        nome: professor.nome || "",
        dataNascimento: professor.dataNascimento || "",
        especialidade: professor.especialidade || "",
        status: professor.status !== undefined ? professor.status : true,
      })
    } else {
      setFormData({
        cpf: "",
        nome: "",
        dataNascimento: "",
        especialidade: "",
        status: true,
      })
    }
    setErrors({})
  }, [professor, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'cpf') {
      const numericValue = value.replace(/\D/g, '')
      let formattedCPF = numericValue
      if (numericValue.length <= 11) {
        formattedCPF = numericValue
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      }
      setFormData(prev => ({ ...prev, [name]: formattedCPF }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, status: checked }))
  }

  const validateCPF = (cpf) => {
    const strCPF = cpf.replace(/\D/g, '')
    if (strCPF.length !== 11) return false
    
    if (/^(\d)\1{10}$/.test(strCPF)) return false
    
    let sum = 0
    let remainder
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(strCPF.substring(i - 1, i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(strCPF.substring(9, 10))) return false
    
    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(strCPF.substring(i - 1, i)) * (12 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(strCPF.substring(10, 11))) return false
    
    return true
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório"
    } else {
      const cpfNumbers = formData.cpf.replace(/\D/g, '')
      if (cpfNumbers.length !== 11) {
        newErrors.cpf = "CPF deve conter 11 dígitos"
      } else if (!validateCPF(formData.cpf)) {
        newErrors.cpf = "CPF inválido"
      } else if (!professor) { // Apenas valida CPF duplicado se for uma nova inserção
        const cpfExiste = professoresExistentes.some((p) => p.cpf === formData.cpf)
        if (cpfExiste) {
          newErrors.cpf = "Este CPF já está cadastrado no sistema"
        }
      }
    }

    if (!formData.nome) newErrors.nome = "Nome é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // --- NOVA FUNÇÃO PARA SALVAR NO BACKEND ---
  const handleSaveToBackend = async (dataToSave) => {
    try {
      let response;
      // Normaliza o CPF para enviar ao backend (apenas números)
      const payload = {
        ...dataToSave,
        cpf: dataToSave.cpf.replace(/\D/g, ''), // Remove máscara do CPF
        // A data de nascimento deve ser enviada em um formato que o backend espera, ex: ISO 8601
        dataNascimento: dataToSave.dataNascimento ? new Date(dataToSave.dataNascimento).toISOString().split('T')[0] : null,
      };

      // Determina se é uma criação (POST) ou edição (PUT)
      if (professor && professor.id) { // Se 'professor' existe e tem 'id', é edição
        response = await fetch(`${API_URL}/usuarios/${professor.id}`, { // Ex: PUT /api/usuarios/:id
          method: 'PUT', // Ou 'PATCH' dependendo da sua API
          headers: {
            'Content-Type': 'application/json',
            // Adicione Authorization Bearer Token aqui se a API exigir autenticação
            // 'Authorization': `Bearer ${seuTokenJWT}` 
          },
          // Inclui o tipo 'PROFESSOR' para garantir que o backend o associe corretamente
          body: JSON.stringify({ ...payload, tipo: 'PROFESSOR' }), 
        });
      } else { // Caso contrário, é uma nova criação
        response = await fetch(`${API_URL}/usuarios`, { // Ex: POST /api/usuarios
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Adicione Authorization Bearer Token aqui se a API exigir autenticação
            // 'Authorization': `Bearer ${seuTokenJWT}` 
          },
          // Para um novo professor, você precisará enviar uma senha inicial (hasheada pelo backend)
          // e definir explicitamente o tipo como 'PROFESSOR'.
          body: JSON.stringify({ ...payload, tipo: 'PROFESSOR', senha: 'uma_senha_inicial_padrao' }), 
        });
      }

      if (!response.ok) {
        // Se a resposta não for OK (status 4xx ou 5xx), tenta ler a mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar professor no backend.');
      }

      // Opcional: Se o backend retornar o objeto salvo, você pode usá-lo
      const savedProfessor = await response.json(); 
      
      onClose(); // Fecha o modal após o sucesso
      // Chama a função onSave passada pelo componente pai (se ele precisar atualizar a lista de professores)
      if (onSave) {
          onSave(savedProfessor); 
      }
      alert("Professor salvo com sucesso!"); // Alerta após sucesso da API
    } catch (error) {
      console.error("Erro ao salvar professor:", error);
      alert(`Erro ao salvar professor: ${error.message}`); // Exibe o erro para o usuário
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      handleSaveToBackend(formData) // Chama a função que fará a requisição HTTP
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{professor ? "Editar Professor" : "Inserir Professor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">
                CPF <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="Digite o CPF"
                value={formData.cpf}
                onChange={handleChange}
                disabled={!!professor}
                maxLength={14}
                className={errors.cpf ? "border-red-500" : ""}
              />
              {errors.cpf && <p className="text-xs text-red-500">{errors.cpf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome e Sobrenome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Digite o nome e sobrenome"
                value={formData.nome}
                onChange={handleChange}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                name="especialidade"
                placeholder="Inglês, espanhol..."
                value={formData.especialidade}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="status" checked={formData.status} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="status">Ativo</Label>
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