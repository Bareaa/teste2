const { Pool } = require('pg')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

// Configuração da conexão com PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'seu_banco',
  password: 'sua_senha',
  port: 5432,
})

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Verificar se o usuário existe
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username])
    const usuario = result.rows[0]
    
    if (!usuario) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, usuario.password)
    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    // Gerar token JWT
    const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET || "sua_chave_secreta", {
      expiresIn: "24h",
    })

    // Retornar dados do usuário e token
    res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nome: usuario.nome,
        role: usuario.role,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Registrar novo usuário (apenas para administradores)
exports.registrar = async (req, res) => {
  try {
    const { username, password, nome, role, professorId } = req.body

    // Verificar se o usuário já existe
    const userExists = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Usuário já existe" })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar novo usuário
    await pool.query(
      'INSERT INTO usuarios (username, password, nome, role, professor_id) VALUES ($1, $2, $3, $4, $5)',
      [username, hashedPassword, nome, role, role === "PROFESSOR" ? professorId : null]
    )

    res.status(201).json({ message: "Usuário criado com sucesso" })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Verificar token e retornar dados do usuário
exports.verificarUsuario = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, nome, role FROM usuarios WHERE id = $1', [req.usuario.id])
    const usuario = result.rows[0]
    
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json(usuario)
  } catch (error) {
    console.error("Erro ao verificar usuário:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}
