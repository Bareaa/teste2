const express = require("express")
const router = express.Router()
const agendamentoController = require("../controllers/agendamentoController")
const { verificarAdmin, verificarProfessorOuAdmin } = require("../middleware/auth")

// Rotas para agendamentos (todas requerem autenticação via middleware em server.js)

// Listar todos os agendamentos
router.get("/", agendamentoController.listarAgendamentos)

// Obter um agendamento específico
router.get("/:id", agendamentoController.obterAgendamento)

// Listar aulas de um professor específico
router.get("/professor/:professorId", verificarProfessorOuAdmin, agendamentoController.listarAulasProfessor)

// Criar novo agendamento (apenas admin)
router.post("/", verificarAdmin, agendamentoController.criarAgendamento)

// Atualizar agendamento (apenas admin)
router.put("/:id", verificarAdmin, agendamentoController.atualizarAgendamento)

// Cancelar agendamento (apenas admin)
router.patch("/:id/cancelar", verificarAdmin, agendamentoController.cancelarAgendamento)

// Finalizar aula (professor ou admin)
router.patch("/:id/finalizar", verificarProfessorOuAdmin, agendamentoController.finalizarAula)

module.exports = router
