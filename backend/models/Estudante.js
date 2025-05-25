// Definição da tabela Estudante para PostgreSQL
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajuste o caminho conforme necessário

const Estudante = sequelize.define('Estudante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataNascimento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endereco_cep: {
    type: DataTypes.STRING
  },
  endereco_logradouro: {
    type: DataTypes.STRING
  },
  endereco_numero: {
    type: DataTypes.STRING
  },
  endereco_bairro: {
    type: DataTypes.STRING
  },
  endereco_cidade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endereco_estado: {
    type: DataTypes.STRING
  },
  contato_telefone: {
    type: DataTypes.STRING
  },
  contato_whatsapp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contato_email: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'estudantes',
  timestamps: true
});

// Hook para atualizar updatedAt
Estudante.beforeUpdate(async (estudante) => {
  estudante.updatedAt = new Date();
});

module.exports = Estudante;
