# Sistema de Gestão de Escola de Idiomas

## 📋 Descrição

Sistema completo para gestão de escola de idiomas, desenvolvido com React (Frontend), Node.js (Backend) e PostgreSQL (Banco de dados), todos executando em containers Docker distintos.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Database      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   SonarQube     │
                    │   (Análise)     │
                    │   Port: 9000    │
                    └─────────────────┘
```

## 🚀 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Pelo menos 4GB de RAM disponível
- Portas livres: 3000, 3001, 5432, 9000, 5050

## 📁 Estrutura do Projeto

```
escola-idiomas/
├── docker-compose.yml          # Configuração dos containers
├── README.md                   # Este arquivo
├── .env.example               # Variáveis de ambiente exemplo
├── .gitignore                 # Arquivos ignorados pelo Git
│
├── frontend/                   # Aplicação React
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   ├── public/
│   ├── cypress/               # Testes E2E
│   └── tests/                 # Testes unitários
│
├── backend/                    # API Node.js
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   ├── tests/                 # Testes unitários e API
│   ├── migrations/            # Migrations do banco
│   
│
├── database/                   # Scripts do banco
│