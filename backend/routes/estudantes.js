const express = require("express")
const router = express.Router()
const estudanteController = require("../controllers/estudanteController")
const { verificarAdmin } = require("../middleware/auth")

// Rotas para estudantes (todas requerem autenticação via middleware em server.js)

// Listar todos os estudantes
router.get("/", estudanteController.listarEstudantes)

// Buscar estudantes por nome ou CPF
router.get("/buscar", estudanteController.buscarEstudantes)

// Obter um estudante específico
router.get("/:id", estudanteController.obterEstudante)

// Criar novo estudante (apenas admin)
router.post("/", verificarAdmin, estudanteController.criarEstudante)

// Atualizar estudante (apenas admin)
router.put("/:id", verificarAdmin, estudanteController.atualizarEstudante)

// Excluir estudante (apenas admin)
router.delete("/:id", verificarAdmin, estudanteController.excluirEstudante)

module.exports = router
