```markdown
# Back-end do Sistema de Gestão Escolar

API RESTful para o Sistema de Gestão Escolar, desenvolvida com Node.js, Express e MongoDB.
npm install bcryptjs
API RESTful para o Sistema de Gestão Escolar, desenvolvida com Node.js, Express e PostgreSQL.

## 🚀 Funcionalidades

- Autenticação JWT
- CRUD completo para estudantes, professores e agendamentos
- CRUD completo para estudantes, professores e agendamentos 
- Validações de regras de negócio
- Controle de acesso baseado em perfis (Administrador/Professor)
- Validações de regras de negócio 
- Integração com MongoDB

- Integração com PostgreSQL
- Sistema de notificações por email
- Geração de relatórios em PDF
- Cache com Redis
- Logs de auditoria
- Upload de arquivos
## 📋 Pré-requisitos

- Node.js 14+ instalado
- MongoDB instalado e rodando (local ou remoto)
- npm ou yarn
- Node.js 16+ instalado
- MongoDB 6+ instalado e rodando (local ou remoto)
- Redis 6+ para cache
- PostgreSQL 14+ instalado e rodando (local ou remoto)

- Conta de email para envio de notificações
- npm ou yarn
## 🗄️ Configuração do MongoDB Local

### Instalação do MongoDB

## 🗄️ Configuração do PostgreSQL Local
#### Windows:
### Instalação do PostgreSQL

1. Baixe o MongoDB Community Server em: https://www.mongodb.com/try/download/community
2. Execute o instalador e siga as instruções
1. Baixe o PostgreSQL em: https://www.postgresql.org/download/windows/
3. Durante a instalação, marque a opção "Install MongoDB as a Service"
4. Instale também o MongoDB Compass (interface gráfica) se desejar

3. Durante a instalação, defina uma senha para o usuário postgres
4. Instale também o pgAdmin (interface gráfica) se desejar
#### macOS:
\`\`\`bash
# Usando Homebrew
```bash
```bash
brew tap mongodb/brew
brew install mongodb-community

brew install postgresql@14
# Iniciar o serviço
brew services start mongodb/brew/mongodb-community
\`\`\`

arkdown
brew services start postgresql@14
# Back-end do Sistema de Gestão Escolar
#### Linux (Ubuntu/Debian):
\`\`\`bash
# Importar chave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

API RESTful para o Sistema de Gestão Escolar, desenvolvida com Node.js, Express e MongoDB.
# Adicionar repositório
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

API RESTful para o Sistema de Gestão Escolar, desenvolvida com Node.js, Express e PostgreSQL.
## 🚀 Funcionalidades
# Instalar MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

- Autenticação JWT
- CRUD completo para estudantes, professores e agendamentos
- Validações de regras de negócio 
- Controle de acesso baseado em perfis (Administrador/Professor)
- CRUD completo para estudantes, professores e agendamentos 
- Validações de regras de negócio
- Integração com MongoDB
- Sistema de notificações por email
- Integração com PostgreSQL
- Geração de relatórios em PDF
- Cache com Redis
- Logs de auditoria
- Upload de arquivos
# Iniciar serviço
sudo systemctl start mongod
sudo systemctl enable mongod
\`\`\`

## 📋 Pré-requisitos

- Node.js 16+ instalado
- PostgreSQL 14+ instalado e rodando (local ou remoto)
- Redis 6+ para cache
- npm ou yarn
- Conta de email para envio de notificações

## 🗄️ Configuração do PostgreSQL Local

### Instalação do PostgreSQL

#### Windows:
1. Baixe o PostgreSQL em: https://www.postgresql.org/download/windows/
2. Execute o instalador e siga as instruções
3. Durante a instalação, defina uma senha para o usuário postgres
4. Instale também o pgAdmin (interface gráfica) se desejar

## 📋 Pré-requisitos
### Verificar Instalação

- Node.js 16+ instalado
- MongoDB 6+ instalado e rodando (local ou remoto)
- Redis 6+ para cache
- npm ou yarn
- Conta de email para envio de notificações
Após a instalação, verifique se o MongoDB está rodando:

## 🗄️ Configuração do MongoDB Local
\`\`\`bash
# Verificar status do serviço
# Windows: Verifique no Gerenciador de Serviços se "MongoDB" está rodando
# macOS/Linux:
sudo systemctl status mongod

### Instalação do MongoDB
# Testar conexão
mongosh
# ou (versões mais antigas)
mongo
\`\`\`

### Configuração do Banco Local

1. **Criar diretório de dados** (se necessário):
\`\`\`bash
# Windows
mkdir C:\data\db

# macOS/Linux
sudo mkdir -p /data/db
sudo chown -R $USER /data/db
#### Windows:
1. Baixe o MongoDB Community Server em: https://www.mongodb.com/try/download/community
2. Execute o instalador e siga as instruções
3. Durante a instalação, marque a opção "Install MongoDB as a Service"
4. Instale também o MongoDB Compass (interface gráfica) se desejar
\`\`\`

2. **Iniciar MongoDB manualmente** (se não estiver como serviço):
\`\`\`bash
mongod --dbpath /data/db
\`\`\`

3. **Conectar ao banco**:
\`\`\`bash
mongosh
# ou
mongo
\`\`\`

4. **Criar banco de dados**:
\`\`\`javascript
// No shell do MongoDB
use gestao-escolar
db.createCollection("test")
show dbs
\`\`\`

### Configuração no Projeto

No arquivo `.env`, use a URL local:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/gestao-escolar
\`\`\`

### Comandos Úteis do MongoDB

\`\`\`bash
# Conectar ao banco específico
mongosh gestao-escolar

# Listar bancos
show dbs

# Listar coleções
show collections

# Ver documentos de uma coleção
db.usuarios.find()
db.estudantes.find()
db.professores.find()
db.agendamentos.find()

# Limpar uma coleção
db.usuarios.deleteMany({})

# Fazer backup
mongodump --db gestao-escolar --out backup/

# Restaurar backup
mongorestore --db gestao-escolar backup/gestao-escolar/
\`\`\`

## 🛠️ Instalação e Configuração

### 1. Instalar dependências

\`\`\`bash
cd back-end
npm install
\`\`\`

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do diretório `back-end` baseado no arquivo `.env.example`:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo `.env` com suas configurações:

\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gestao-escolar
JWT_SECRET=sua_chave_secreta_muito_segura
\`\`\`

### 3. Popular o banco de dados com dados iniciais (opcional)

\`\`\`bash
npm run seed
\`\`\`

### 4. Iniciar o servidor

\`\`\`bash
# Modo de desenvolvimento (com hot-reload)
npm run dev

# Modo de produção
npm start
\`\`\`

O servidor estará rodando em `http://localhost:5000`.

## 📚 Estrutura do Projeto

\`\`\`
back-end/
├── controllers/       # Controladores das rotas
├── middleware/        # Middleware de autenticação e autorização
├── models/            # Modelos do MongoDB
├── routes/            # Rotas da API
├── seeds/             # Scripts para popular o banco de dados
├── .env.example       # Exemplo de variáveis de ambiente
├── package.json       # Dependências e scripts
├── server.js          # Ponto de entrada da aplicação
└── README.md          # Documentação
\`\`\`

## 🔑 Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para acessar rotas protegidas, é necessário incluir o token no header da requisição:

\`\`\`
x-auth-token: seu_token_jwt
\`\`\`

## 🔄 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/registrar` - Registrar novo usuário (requer admin)
- `GET /api/auth/me` - Obter dados do usuário atual

### Estudantes

- `GET /api/estudantes` - Listar todos os estudantes
- `GET /api/estudantes/buscar?termo=valor` - Buscar estudantes por nome ou CPF
- `GET /api/estudantes/:id` - Obter um estudante específico
- `POST /api/estudantes` - Criar novo estudante (requer admin)
- `PUT /api/estudantes/:id` - Atualizar estudante (requer admin)
- `DELETE /api/estudantes/:id` - Excluir estudante (requer admin)

### Professores

- `GET /api/professores` - Listar todos os professores
- `GET /api/professores/ativos` - Listar apenas professores ativos
- `GET /api/professores/buscar?termo=valor` - Buscar professores por nome, CPF ou especialidade
- `GET /api/professores/:id` - Obter um professor específico
- `POST /api/professores` - Criar novo professor (requer admin)
- `PUT /api/professores/:id` - Atualizar professor (requer admin)
- `DELETE /api/professores/:id` - Excluir professor (requer admin)

### Agendamentos

- `GET /api/agendamentos` - Listar todos os agendamentos
- `GET /api/agendamentos/:id` - Obter um agendamento específico
- `GET /api/agendamentos/professor/:professorId` - Listar aulas de um professor
- `POST /api/agendamentos` - Criar novo agendamento (requer admin)
- `PUT /api/agendamentos/:id` - Atualizar agendamento (requer admin)
- `PATCH /api/agendamentos/:id/cancelar` - Cancelar agendamento (requer admin)
- `PATCH /api/agendamentos/:id/finalizar` - Finalizar aula (professor ou admin)

## 🔒 Controle de Acesso

A API implementa controle de acesso baseado em perfis:

- **ADMINISTRADOR**: Acesso completo a todas as funcionalidades
- **PROFESSOR**: Acesso limitado às suas próprias aulas e finalização de aulas

## 📝 Dados de Exemplo

O script de seed cria os seguintes usuários:

- **Administrador**:
  - Username: `admin`
  - Senha: `admin`

- **Professor**:
  - Username: `professor`
  - Senha: `professor`
