# Guia de Integração do Back-end com o Front-end

Este guia explica como integrar o back-end Node.js/Express com o front-end Next.js do Sistema de Gestão Escolar.

## 🚀 Visão Geral

A integração envolve:

1. Configurar o cliente HTTP no front-end
2. Implementar autenticação JWT
3. Substituir os dados mockados por chamadas à API
4. Gerenciar estados e erros

## 📋 Pré-requisitos

- Back-end configurado e rodando (ver README.md na pasta back-end)
- Front-end Next.js funcionando

## 🛠️ Passos para Integração

### 1. Instalar dependências no front-end

\`\`\`bash
cd sistema-gestao-escolar
npm install axios js-cookie
\`\`\`

### 2. Configurar cliente HTTP

Crie um arquivo `lib/api.js` para configurar o Axios:

\`\`\`javascript
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
\`\`\`

### 3. Implementar autenticação

Crie um arquivo `lib/auth.js` para gerenciar autenticação:

\`\`\`javascript
import Cookies from 'js-cookie';
import api from './api';

// Duração do token: 1 dia
const TOKEN_DURATION = 1;

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    const { token, usuario } = response.data;
    
    // Salvar token e dados do usuário
    Cookies.set('token', token, { expires: TOKEN_DURATION });
    localStorage.setItem('userRole', usuario.role);
    localStorage.setItem('userName', usuario.nome);
    
    return usuario;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer login');
  }
};

export const logout = () => {
  Cookies.remove('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
};

export const verificarAutenticacao = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    logout();
    throw new Error('Sessão expirada');
  }
};

export const isAuthenticated = () => {
  return !!Cookies.get('token');
};
\`\`\`

### 4. Criar serviços para cada entidade

#### Serviço de Estudantes (`lib/services/estudanteService.js`):

\`\`\`javascript
import api from '../api';

export const listarEstudantes = async () => {
  try {
    const response = await api.get('/estudantes');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar estudantes');
  }
};

export const buscarEstudantes = async (termo) => {
  try {
    const response = await api.get(`/estudantes/buscar?termo=${termo}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar estudantes');
  }
};

export const obterEstudante = async (id) => {
  try {
    const response = await api.get(`/estudantes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao obter estudante');
  }
};

export const criarEstudante = async (estudante) => {
  try {
    const response = await api.post('/estudantes', estudante);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao criar estudante');
  }
};

export const atualizarEstudante = async (id, estudante) => {
  try {
    const response = await api.put(`/estudantes/${id}`, estudante);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar estudante');
  }
};

export const excluirEstudante = async (id) => {
  try {
    const response = await api.delete(`/estudantes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir estudante');
  }
};
\`\`\`

#### Serviço de Professores (`lib/services/professorService.js`):

\`\`\`javascript
import api from '../api';

export const listarProfessores = async () => {
  try {
    const response = await api.get('/professores');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar professores');
  }
};

export const listarProfessoresAtivos = async () => {
  try {
    const response = await api.get('/professores/ativos');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar professores ativos');
  }
};

export const buscarProfessores = async (termo) => {
  try {
    const response = await api.get(`/professores/buscar?termo=${termo}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar professores');
  }
};

export const obterProfessor = async (id) => {
  try {
    const response = await api.get(`/professores/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao obter professor');
  }
};

export const criarProfessor = async (professor) => {
  try {
    const response = await api.post('/professores', professor);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao criar professor');
  }
};

export const atualizarProfessor = async (id, professor) => {
  try {
    const response = await api.put(`/professores/${id}`, professor);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar professor');
  }
};

export const excluirProfessor = async (id) => {
  try {
    const response = await api.delete(`/professores/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir professor');
  }
};
\`\`\`

#### Serviço de Agendamentos (`lib/services/agendamentoService.js`):

\`\`\`javascript
import api from '../api';

export const listarAgendamentos = async () => {
  try {
    const response = await api.get('/agendamentos');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar agendamentos');
  }
};

export const obterAgendamento = async (id) => {
  try {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao obter agendamento');
  }
};

export const listarAulasProfessor = async (professorId) => {
  try {
    const response = await api.get(`/agendamentos/professor/${professorId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar aulas do professor');
  }
};

export const criarAgendamento = async (agendamento) => {
  try {
    const response = await api.post('/agendamentos', agendamento);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao criar agendamento');
  }
};

export const atualizarAgendamento = async (id, agendamento) => {
  try {
    const response = await api.put(`/agendamentos/${id}`, agendamento);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar agendamento');
  }
};

export const cancelarAgendamento = async (id) => {
  try {
    const response = await api.patch(`/agendamentos/${id}/cancelar`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao cancelar agendamento');
  }
};

export const finalizarAula = async (id, observacoes) => {
  try {
    const response = await api.patch(`/agendamentos/${id}/finalizar`, { observacoes });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao finalizar aula');
  }
};
\`\`\`

### 5. Modificar a página de login

Atualize o arquivo `app/page.js` para usar a autenticação real:

\`\`\`javascript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const usuario = await login(username, password)
      
      // Redirecionar com base no perfil
      if (usuario.role === "ADMINISTRADOR") {
        router.push("/admin")
      } else if (usuario.role === "PROFESSOR") {
        router.push("/professor")
      }
    } catch (error) {
      toast({
        title: "Erro de autenticação",
        description: error.message || "Credenciais inválidas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-bold">Sistema de Gestão Escolar</h1>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
