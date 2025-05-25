const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'escola',
  password: 'postgres',
  port: 5432,
})

// Listar todos os professores
exports.listarProfessores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores ORDER BY nome ASC')
    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao listar professores:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Obter um professor específico
exports.obterProfessor = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Professor não encontrado" })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao obter professor:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Criar novo professor
exports.criarProfessor = async (req, res) => {
  try {
    const { cpf, nome, dataNascimento, especialidade, status } = req.body

    // Verificar se o CPF já existe
    const existingProf = await pool.query('SELECT * FROM professores WHERE cpf = $1', [cpf])
    if (existingProf.rows.length > 0) {
      return res.status(400).json({ message: "CPF já cadastrado" })
    }

    const result = await pool.query(
      'INSERT INTO professores (cpf, nome, data_nascimento, especialidade, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cpf, nome, dataNascimento, especialidade, status !== undefined ? status : true]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Erro ao criar professor:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Atualizar professor
exports.atualizarProfessor = async (req, res) => {
  try {
    const { nome, dataNascimento, especialidade, status } = req.body

    const result = await pool.query(
      'UPDATE professores SET nome = $1, data_nascimento = $2, especialidade = $3, status = $4 WHERE id = $5 RETURNING *',
      [nome, dataNascimento, especialidade, status, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Professor não encontrado" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar professor:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Excluir professor
exports.excluirProfessor = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM professores WHERE id = $1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Professor não encontrado" })
    }
    res.json({ message: "Professor excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir professor:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Buscar professores por nome, CPF ou especialidade
exports.buscarProfessores = async (req, res) => {
  try {
    const { termo } = req.query

    if (!termo) {
      return res.status(400).json({ message: "Termo de busca não fornecido" })
    }

    const result = await pool.query(
      `SELECT * FROM professores 
       WHERE nome ILIKE $1 
       OR cpf ILIKE $1 
       OR especialidade ILIKE $1 
       ORDER BY nome ASC`,
      [`%${termo}%`]
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar professores:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Listar professores ativos
exports.listarProfessoresAtivos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM professores WHERE status = true ORDER BY nome ASC')
    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao listar professores ativos:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}
