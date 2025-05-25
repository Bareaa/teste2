// Definição do modelo Agendamento para PostgreSQL
const AgendamentoSchema = {
  data: {
    type: 'DATE',
    required: true,
  },
  hora: {
    type: 'VARCHAR',
    required: true,
  },
  professor_id: {
    type: 'INTEGER',
    required: true,
    references: 'professor(id)'
  },
  estudante_id: {
    type: 'INTEGER', 
    required: true,
    references: 'estudante(id)'
  },
  conteudo: {
    type: 'TEXT',
    required: true,
  },
  status: {
    type: 'VARCHAR',
    defaultValue: 'Em andamento',
    check: "status IN ('Em andamento', 'Cancelada', 'Finalizada')"
  },
  observacoes: {
    type: 'TEXT'
  },
  created_at: {
    type: 'TIMESTAMP',
    defaultValue: 'CURRENT_TIMESTAMP'
  },
  updated_at: {
    type: 'TIMESTAMP',
    defaultValue: 'CURRENT_TIMESTAMP'
  }
}

// Função para verificar disponibilidade do professor
const verificarDisponibilidadeProfessor = async (pool, professorId, data) => {
  const inicio = new Date(data)
  inicio.setHours(0, 0, 0, 0)

  const fim = new Date(data)
  fim.setHours(23, 59, 59, 999)

  const query = {
    text: `SELECT COUNT(*) 
           FROM agendamento 
           WHERE professor_id = $1 
           AND data BETWEEN $2 AND $3
           AND status = 'Em andamento'`,
    values: [professorId, inicio, fim]
  }

  const result = await pool.query(query)
  return result.rows[0].count < 2 // Limite de 2 aulas por dia
}

module.exports = {
  AgendamentoSchema,
  verificarDisponibilidadeProfessor
}
