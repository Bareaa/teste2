const express = require("express")
const router = express.Router()
const professorController = require("../controllers/professorController") 
const { verificarAdmin } = require("../middleware/auth")

// Rotas para professores (todas requerem autenticação via middleware em server.js)

// Listar todos os professores
router.get("/", professorController.listarProfessores)

// Listar apenas professores ativos  
router.get("/ativos", professorController.listarProfessoresAtivos)

// Buscar professores por nome, CPF ou especialidade
router.get("/buscar", professorController.buscarProfessores)

// Obter um professor específico
router.get("/:id", professorController.obterProfessor)

// Criar novo professor (apenas admin)
router.post("/", verificarAdmin, professorController.criarProfessor)

// Atualizar professor (apenas admin)
router.put("/:id", verificarAdmin, professorController.atualizarProfessor)

// Excluir professor (apenas admin)
router.delete("/:id", verificarAdmin, professorController.excluirProfessor)

module.exports = router
