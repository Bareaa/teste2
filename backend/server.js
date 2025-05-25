const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth")
const estudanteRoutes = require("./routes/estudantes")
const professorRoutes = require("./routes/professores")
const agendamentoRoutes = require("./routes/agendamentos")
const { verificarToken } = require("./middleware/auth")

// Configuração
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Removido: Conexão com o MongoDB

// Rotas
app.use("/api/auth", authRoutes)
app.use("/api/estudantes", verificarToken, estudanteRoutes)
app.use("/api/professores", verificarToken, professorRoutes)
app.use("/api/agendamentos", verificarToken, agendamentoRoutes)

// Rota de teste
app.get("/api", (req, res) => {
  res.json({ message: "API do Sistema de Gestão Escolar funcionando!" })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})