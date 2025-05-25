const jwt = require("jsonwebtoken")

// Middleware para verificar token JWT
exports.verificarToken = (req, res, next) => {
  // Obter token do header
  const token = req.header("x-auth-token")

  // Verificar se o token existe
  
  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." })
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sua_chave_secreta")

    // Adicionar dados do usuário ao request
    req.usuario = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Token inválido" })
  }
}

// Middleware para verificar se é administrador
exports.verificarAdmin = (req, res, next) => {
  if (req.usuario.role !== "ADMINISTRADOR") {
    return res.status(403).json({ message: "Acesso negado. Permissão insuficiente." })
  }
  next()
}

// Middleware para verificar se é professor ou administrador
exports.verificarProfessorOuAdmin = (req, res, next) => {
  if (req.usuario.role !== "PROFESSOR" && req.usuario.role !== "ADMINISTRADOR") {
    return res.status(403).json({ message: "Acesso negado. Permissão insuficiente." })
  }
  next()
}
