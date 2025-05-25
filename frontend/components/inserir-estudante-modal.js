// inserir-estudante-modal.js
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Defina a URL base da sua API.
// Ela deve estar configurada no seu arquivo .env.local (para desenvolvimento)
// e acessível no container via NEXT_PUBLIC_REACT_APP_API_URL.
const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL || "http://localhost:3001/api";

export function InserirEstudanteModal({ isOpen, onClose, onSave, estudante, estudantesExistentes = [] }) {
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    dataNascimento: "",
    cep: "",
    logradouro: "", 
    numero: "",
    bairro: "",
    estado: "",
    cidade: "",
    telefone: "",
    whatsapp: "",
    email: "",
  })

  const [errors, setErrors] = useState({})
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [cepError, setCepError] = useState("")

  // Função para validar CPF (mantida como estava)
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '')
    
    if (cpf.length !== 11) return false
    
    // Verifica CPFs com dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false
    
    let soma = 0
    let resto
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i)
    }
    
    resto = (soma * 10) % 11
    if ((resto === 10) || (resto === 11)) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false
    
    soma = 0
    // Segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i)
    }
    
    resto = (soma * 10) % 11
    if ((resto === 10) || (resto === 11)) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11))) return false
    
    return true
  }

  useEffect(() => {
    if (estudante) {
      setFormData({
        cpf: estudante.cpf || "",
        nome: estudante.nome || "",
        dataNascimento: estudante.dataNascimento || "",
        cep: estudante.cep || "",
        logradouro: estudante.logradouro || "",
        numero: estudante.numero || "",
        bairro: estudante.bairro || "",
        estado: estudante.estado || "",
        cidade: estudante.cidade || "",
        telefone: estudante.telefone || "",
        whatsapp: estudante.whatsapp || "",
        email: estudante.email || "",
      })
    } else {
      setFormData({
        cpf: "",
        nome: "",
        dataNascimento: "",
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        estado: "",
        cidade: "",
        telefone: "",
        whatsapp: "",
        email: "",
      })
    }
    setErrors({})
    setCepError("")
  }, [estudante, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'cpf') {
      let cpf = value.replace(/\D/g, '')
      if (cpf.length > 11) {
        cpf = cpf.slice(0, 11)
      }
      if (cpf.length <= 11) {
        cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
      }
      setFormData(prev => ({ ...prev, [name]: cpf }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const buscarCep = async (cep) => {
    if (cep.length === 8) {
      setBuscandoCep(true)
      setCepError("")

      try {
        // Usa a variável de ambiente REACT_APP_VIACEP_API_URL para a API Externa
        const viacepApiUrl = process.env.NEXT_PUBLIC_VIACEP_API_URL || "https://viacep.com.br/ws";
        const response = await fetch(`${viacepApiUrl}/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          setCepError("CEP não encontrado")
          setFormData((prev) => ({
            ...prev,
            logradouro: "",
            bairro: "",
            estado: "",
            cidade: "",
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            estado: data.uf || "",
            cidade: data.localidade || "",
          }))
          setCepError("")
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
        setCepError("Erro ao buscar CEP. Verifique sua conexão.")
        setFormData((prev) => ({
          ...prev,
          logradouro: "",
          bairro: "",
          estado: "",
          cidade: "",
        }))
      }
      setBuscandoCep(false)
    }
  }

  const handleCepChange = (e) => {
    let cep = e.target.value.replace(/\D/g, "")

    if (cep.length > 8) {
      cep = cep.slice(0, 8)
    }

    if (cep.length > 5) {
      cep = cep.replace(/(\d{5})(\d{1,3})/, "$1-$2")
    }

    setFormData((prev) => ({ ...prev, cep }))

    const cepNumeros = cep.replace(/\D/g, "")
    if (cepNumeros.length === 8) {
      buscarCep(cepNumeros)
    } else {
      if (cepNumeros.length < 8) {
        setFormData((prev) => ({
          ...prev,
          logradouro: "",
          bairro: "",
          estado: "",
          cidade: "",
        }))
        setCepError("")
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!validarCPF(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = "CPF inválido"
    }

    if (formData.cpf && !estudante) { // Só verifica duplicidade se for um novo estudante
      const cpfExiste = estudantesExistentes.some((e) => e.cpf === formData.cpf)
      if (cpfExiste) {
        newErrors.cpf = "Este CPF já está cadastrado no sistema"
      }
    }

    if (!formData.nome) newErrors.nome = "Nome é obrigatório"
    if (!formData.cep) newErrors.cep = "CEP é obrigatório"
    if (!formData.cidade) newErrors.cidade = "Cidade é obrigatória"
    if (!formData.whatsapp) newErrors.whatsapp = "WhatsApp é obrigatório"

    if (formData.cep && cepError) {
      newErrors.cep = cepError
    }

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

      if (estudante && estudante.id) { // Se 'estudante' existe e tem 'id', é edição
        response = await fetch(`${API_URL}/estudantes/${estudante.id}`, { // Ex: PUT /api/estudantes/:id
          method: 'PUT', // Ou 'PATCH'
          headers: {
            'Content-Type': 'application/json',
            // Adicione Authorization Bearer Token aqui se a API exigir autenticação
            // 'Authorization': `Bearer ${seuTokenJWT}` 
          },
          body: JSON.stringify(payload), 
        });
      } else { // Caso contrário, é uma nova criação
        response = await fetch(`${API_URL}/estudantes`, { // Ex: POST /api/estudantes
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
        throw new Error(errorData.message || 'Erro ao salvar estudante no backend.');
      }

      const savedEstudante = await response.json(); // Opcional: obter a resposta do backend
      
      onClose(); // Fecha o modal
      // Chama a função onSave passada pelo componente pai (se ele precisar atualizar a lista de estudantes)
      if (onSave) {
          onSave(savedEstudante); 
      }
      alert("Estudante salvo com sucesso!"); // Alerta após sucesso da API

    } catch (error) {
      console.error("Erro ao salvar estudante:", error);
      alert(`Erro ao salvar estudante: ${error.message}`); // Exibe o erro para o usuário
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{estudante ? "Editar Estudante" : "Inserir Estudante"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                disabled={!!estudante}
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
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Endereço Domiciliar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">
                  CEP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cep"
                  name="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleCepChange}
                  disabled={buscandoCep}
                  className={errors.cep || cepError ? "border-red-500" : ""}
                />
                {buscandoCep && <p className="text-xs text-blue-500">Buscando CEP...</p>}
                {cepError && <p className="text-xs text-red-500">{cepError}</p>}
                {errors.cep && <p className="text-xs text-red-500">{errors.cep}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  name="logradouro"
                  placeholder="Digite o logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número da casa</Label>
                <Input
                  id="numero"
                  name="numero"
                  placeholder="Digite o número (ou SN)"
                  value={formData.numero}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  placeholder="Digite o bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  placeholder="Digite o estado"
                  value={formData.estado}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cidade"
                  name="cidade"
                  placeholder="Digite a cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className={errors.cidade ? "border-red-500" : ""}
                />
                {errors.cidade && <p className="text-xs text-red-500">{errors.cidade}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Contatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone/Celular</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="Digite o telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="Digite o WhatsApp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className={errors.whatsapp ? "border-red-500" : ""}
                />
                {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite o e-mail"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={buscandoCep}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}