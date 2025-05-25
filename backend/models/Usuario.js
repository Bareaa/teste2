
const bcrypt = require("bcrypt")
const { DataTypes } = require('sequelize')

// Definição do modelo Usuario usando Sequelize
const Usuario = sequelize.define('Usuario', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMINISTRADOR', 'PROFESSOR'),
    allowNull: false
  },
  professorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Professor', 
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  hooks: {
    // Hook para hash da senha antes de salvar
    beforeSave: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10)
        usuario.password = await bcrypt.hash(usuario.password, salt)
      }
    }
  }
})

// Método para comparar senhas
Usuario.prototype.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.password)
}
module.exports = Usuario
module.exports = Usuario
