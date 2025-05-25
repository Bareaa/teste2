const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { verificarToken, verificarAdmin } = require("../middleware/auth")

// Rota de login
router.post("/login", authController.login)

// Rota para registrar novo usuário (apenas admin)
router.post("/registrar", [verificarToken, verificarAdmin], authController.registrar)

// Rota para verificar usuário atual
router.get("/me", verificarToken, authController.verificarUsuario)

module.exports = router
