const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'estudantes_db',
  password: 'sua_senha',
  port: 5432,
})

// Listar todos os estudantes
exports.listarEstudantes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudantes ORDER BY nome')
    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao listar estudantes:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Obter um estudante específico
exports.obterEstudante = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudantes WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Estudante não encontrado" })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao obter estudante:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Criar novo estudante
exports.criarEstudante = async (req, res) => {
  try {
    const { cpf, nome, dataNascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email } = req.body

    // Verificar se o CPF já existe
    const cpfCheck = await pool.query('SELECT * FROM estudantes WHERE cpf = $1', [cpf])
    if (cpfCheck.rows.length > 0) {
      return res.status(400).json({ message: "CPF já cadastrado" })
    }

    const result = await pool.query(
      `INSERT INTO estudantes (cpf, nome, data_nascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [cpf, nome, dataNascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Erro ao criar estudante:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Atualizar estudante
exports.atualizarEstudante = async (req, res) => {
  try {
    const { nome, dataNascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email } = req.body

    const result = await pool.query(
      `UPDATE estudantes 
       SET nome = $1, data_nascimento = $2, cep = $3, logradouro = $4, numero = $5, 
           bairro = $6, cidade = $7, estado = $8, telefone = $9, whatsapp = $10, email = $11
       WHERE id = $12 RETURNING *`,
      [nome, dataNascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Estudante não encontrado" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar estudante:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Excluir estudante
exports.excluirEstudante = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM estudantes WHERE id = $1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Estudante não encontrado" })
    }
    res.json({ message: "Estudante excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir estudante:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Buscar estudantes por nome ou CPF
exports.buscarEstudantes = async (req, res) => {
  try {
    const { termo } = req.query

    if (!termo) {
      return res.status(400).json({ message: "Termo de busca não fornecido" })
    }

    const result = await pool.query(
      `SELECT * FROM estudantes 
       WHERE nome ILIKE $1 OR cpf ILIKE $1 
       ORDER BY nome`,
      [`%${termo}%`]
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar estudantes:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}
