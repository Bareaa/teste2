# Sistema de Gestão Escolar

Sistema web para gestão de matrículas e agendamentos de aulas de uma escola de idiomas, desenvolvido com Next.js 14 e JavaScript.

## 🚀 Funcionalidades

### Dashboard Administrativo
- Gestão completa de estudantes
- Gestão de professores
- Controle de agendamentos de aulas
- Validações de formulários
- Integração com API ViaCEP para preenchimento automático de endereços

### Dashboard do Professor
- Visualização de aulas do dia
- Histórico de aulas realizadas
- Realização e finalização de aulas
- Acesso rápido ao WhatsApp dos estudantes

### Funcionalidades Específicas
- **Controle de acesso por perfil** (Administrador/Professor)
- **Validação de CPF único** para estudantes e professores
- **Agendamento com regras de negócio** (24h de antecedência, limite de aulas por professor)
- **Geração de PDF** para autorização de responsáveis (menores de 16 anos)
- **Links diretos para WhatsApp** dos estudantes
- **Busca e filtros** em todas as listagens
- **Ordenação de tabelas** por colunas

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **JavaScript** (ES6+)
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Lucide React** para ícones
- **date-fns** para manipulação de datas
- **API ViaCEP** para busca de endereços

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🚀 Como Rodar o Projeto Localmente

### 1. Clone o repositório

\`\`\`bash
git clone <url-do-repositorio>
cd sistema-gestao-escolar
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

### 3. Execute o projeto em modo de desenvolvimento

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

### 4. Acesse o sistema

Abra seu navegador e acesse: `http://localhost:3000`

### 5. Credenciais de acesso

**Administrador:**
- Usuário: `admin`
- Senha: `admin`

**Professor:**
- Usuário: `professor`
- Senha: `professor`

## 📁 Estrutura do Projeto

\`\`\`
sistema-gestao-escolar/
├── app/                    # Páginas da aplicação (Next.js App Router)
│   ├── admin/              # Rotas para administradores
│   │   ├── estudantes/     # Gestão de estudantes
│   │   ├── professores/    # Gestão de professores
│   │   ├── agendamentos/   # Gestão de agendamentos
│   │   └── page.js         # Dashboard administrativo
│   ├── professor/          # Rotas para professores
│   │   └── page.js         # Dashboard do professor
│   ├── layout.js           # Layout principal
│   ├── page.js             # Página de login
│   └── globals.css         # Estilos globais
├── components/             # Componentes React reutilizáveis
│   ├── ui/                 # Componentes shadcn/ui
│   ├── layout.js           # Componente de layout
│   ├── inserir-estudante-modal.js
│   ├── inserir-professor-modal.js
│   ├── agendar-aula-modal.js
│   └── realizar-aula-modal.js
├── lib/                    # Utilitários
│   └── utils.js            # Funções auxiliares
├── public/                 # Arquivos estáticos
├── package.json            # Dependências do projeto
├── tailwind.config.js      # Configuração do Tailwind
├── next.config.js          # Configuração do Next.js
└── README.md               # Documentação
\`\`\`

## 🎯 Funcionalidades Implementadas

### ✅ Requisitos Funcionais Atendidos

- **RQF1**: Dashboard dinâmico por perfil de usuário
- **RQF2**: Gestão completa de estudantes (CRUD)
- **RQF3**: Formulário de inserção de estudantes com validações
- **RQF4**: Edição de estudantes (CPF não editável)
- **RQF6**: Agendamento de aulas com validações de negócio
- **RQF8**: Dashboard específico para professores
- **RQF9**: Realização e finalização de aulas
- **RQF10**: Gestão de professores com ordenação e busca
- **RQF11**: Cadastro de professores com validações

### 🔧 Validações Implementadas

- **CPF único** para estudantes e professores
- **Campos obrigatórios** marcados com asterisco (*)
- **Integração ViaCEP** para preenchimento automático de endereços
- **Validação de 24 horas** para agendamentos
- **Limite de 2 aulas por professor** por dia
- **Geração de PDF** para menores de 16 anos
- **Confirmação de exclusão** para todos os registros

### 📱 Recursos de UX/UI

- **Design responsivo** para desktop e mobile
- **Links diretos para WhatsApp** dos estudantes
- **Busca em tempo real** nas listagens
- **Ordenação por colunas** nas tabelas
- **Modais para formulários** com validação em tempo real
- **Feedback visual** para erros e sucessos

## 🔄 Scripts Disponíveis

\`\`\`bash
# Executar em modo de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Executar versão de produção
npm run start

# Verificar código com ESLint
npm run lint
\`\`\`

## 📝 Dados de Exemplo

O sistema vem com dados de exemplo pré-carregados:

### Estudantes
- Alice Johnson (CPF: 12345678901)
- Carlos Silva (CPF: 98765432109)

### Professores
- Roberto Castro (Inglês)
- Pedro da Silva
- Joana Oliveira (Francês)

### Agendamentos
- Aulas em andamento, canceladas e finalizadas

## 🌐 APIs Utilizadas

- **ViaCEP**: `https://viacep.com.br/ws/{cep}/json/`
  - Utilizada para preenchimento automático de endereços
  - Integração transparente no formulário de estudantes

## 🔒 Controle de Acesso

O sistema implementa controle de acesso baseado em perfis:

- **ADMINISTRADOR**: Acesso completo a todas as funcionalidades
- **PROFESSOR**: Acesso apenas ao dashboard e funcionalidades específicas

## 📄 Licença

Este projeto está licenciado sob a licença MIT.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais disponíveis no sistema.
