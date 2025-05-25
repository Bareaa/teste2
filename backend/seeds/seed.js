//
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const Usuario = require("../models/Usuario")
const Professor = require("../models/Professor")
const Estudante = require("../models/Estudante")
const Agendamento = require("../models/Agendamento")

// Configuração
dotenv.config()

// Conexão com o PostgreSQL
const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestao-escolar',
  password: 'postgres',
  port: 5432,
})

// Dados iniciais
const professores = [
  {
    cpf: "11111111111",
    nome: "Roberto Castro",
    dataNascimento: new Date("1980-05-15"),
    especialidade: "Inglês",
    status: true,
  },
  {
    cpf: "22222222222", 
    nome: "Pedro da Silva",
    dataNascimento: new Date("1975-10-20"),
    especialidade: "",
    status: true,
  },
  {
    cpf: "33333333333",
    nome: "Joana Oliveira", 
    dataNascimento: new Date("1985-03-10"),
    especialidade: "Francês",
    status: false,
  },
]

const estudantes = [
  {
    cpf: "12345678901",
    nome: "Alice Johnson",
    dataNascimento: new Date("1990-05-15"),
    endereco: {
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista", 
      cidade: "São Paulo",
      estado: "SP",
    },
    contato: {
      telefone: "+5511888888888",
      whatsapp: "+5511999999999",
      email: "alice@email.com",
    },
  },
  {
    cpf: "98765432109",
    nome: "Carlos Silva",
    dataNascimento: new Date("1985-10-20"),
    endereco: {
      cep: "04038-001",
      logradouro: "Rua Vergueiro",
      numero: "500",
      bairro: "Vila Mariana",
      cidade: "São Paulo",
      estado: "SP",
    },
    contato: {
      telefone: "+5511777777777",
      whatsapp: "+5511888888888",
      email: "carlos@email.com",
    },
  },
]

// Função para criar dados iniciais
const seedDatabase = async () => {
  try {
    const client = await pool.connect()

    // Limpar banco de dados
    await client.query('TRUNCATE usuarios, professores, estudantes, agendamentos CASCADE')

    console.log("Banco de dados limpo")

    // Inserir professores
    const professorValues = professores.map(p => [p.cpf, p.nome, p.dataNascimento, p.especialidade, p.status])
    const professorQuery = 'INSERT INTO professores (cpf, nome, data_nascimento, especialidade, status) VALUES ($1, $2, $3, $4, $5) RETURNING id'
    const professorDocs = await Promise.all(professorValues.map(values => client.query(professorQuery, values)))
    console.log(`${professorDocs.length} professores inseridos`)

    // Inserir estudantes
    const estudanteValues = estudantes.map(e => [
      e.cpf, e.nome, e.dataNascimento,
      e.endereco.cep, e.endereco.logradouro, e.endereco.numero, e.endereco.bairro, e.endereco.cidade, e.endereco.estado,
      e.contato.telefone, e.contato.whatsapp, e.contato.email
    ])
    const estudanteQuery = 'INSERT INTO estudantes (cpf, nome, data_nascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id'
    const estudanteDocs = await Promise.all(estudanteValues.map(values => client.query(estudanteQuery, values)))
    console.log(`${estudanteDocs.length} estudantes inseridos`)

    // Criar usuários
    const salt = await bcrypt.genSalt(10)
    const adminPassword = await bcrypt.hash("admin", salt)
    const professorPassword = await bcrypt.hash("professor", salt)

    const usuarios = [
      {
        username: "admin",
        password: adminPassword,
        nome: "Administrador",
        role: "ADMINISTRADOR",
      },
      {
        username: "professor", 
        password: professorPassword,
        nome: "Roberto Castro",
        role: "PROFESSOR",
        professorId: professorDocs[0].rows[0].id,
      },
    ]

    const usuarioQuery = 'INSERT INTO usuarios (username, password, nome, role, professor_id) VALUES ($1, $2, $3, $4, $5)'
    await Promise.all(usuarios.map(u => client.query(usuarioQuery, [u.username, u.password, u.nome, u.role, u.professorId])))
    console.log(`${usuarios.length} usuários inseridos`)

    // Criar agendamentos
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)

    const agendamentos = [
      {
        data: amanha,
        hora: "10:00",
        professor: professorDocs[0].rows[0].id,
        estudante: estudanteDocs[0].rows[0].id,
        conteudo: "Verbs To Be",
        status: "Em andamento",
      },
      {
        data: amanha,
        hora: "14:00", 
        professor: professorDocs[2].rows[0].id,
        estudante: estudanteDocs[1].rows[0].id,
        conteudo: "Numbers",
        status: "Em andamento",
      },
      {
        data: ontem,
        hora: "16:00",
        professor: professorDocs[0].rows[0].id,
        estudante: estudanteDocs[1].rows[0].id,
        conteudo: "Alphabet",
        status: "Finalizada",
        observacoes: "Aluno teve bom desempenho.",
      },
    ]

    const agendamentoQuery = 'INSERT INTO agendamentos (data, hora, professor_id, estudante_id, conteudo, status, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7)'
    await Promise.all(agendamentos.map(a => client.query(agendamentoQuery, [a.data, a.hora, a.professor, a.estudante, a.conteudo, a.status, a.observacoes])))
    console.log(`${agendamentos.length} agendamentos inseridos`)

    console.log("Dados iniciais criados com sucesso!")
    client.release()
    process.exit(0)
  } catch (error) {
    console.error("Erro ao criar dados iniciais:", error)
    process.exit(1)
  }
}

// Executar seed
seedDatabase()
