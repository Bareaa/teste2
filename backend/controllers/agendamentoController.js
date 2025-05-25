const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agendamentos',
  password: 'postgres',
  port: 5432,
})

// Listar todos os agendamentos
exports.listarAgendamentos = async (req, res) => {
  try {
    const query = `
      SELECT a.*, p.nome as professor_nome, p.especialidade, e.nome as estudante_nome
      FROM agendamentos a
      INNER JOIN professores p ON a.professor_id = p.id 
      INNER JOIN estudantes e ON a.estudante_id = e.id
      ORDER BY a.data DESC, a.hora ASC
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Obter um agendamento específico
exports.obterAgendamento = async (req, res) => {
  try {
    const query = `
      SELECT a.*, p.nome as professor_nome, p.especialidade, e.nome as estudante_nome
      FROM agendamentos a
      INNER JOIN professores p ON a.professor_id = p.id
      INNER JOIN estudantes e ON a.estudante_id = e.id
      WHERE a.id = $1
    `
    const { rows } = await pool.query(query, [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Agendamento não encontrado" })
    }

    res.json(rows[0])
  } catch (error) {
    console.error("Erro ao obter agendamento:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Criar novo agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const { data, hora, professorId, estudanteId, conteudo } = req.body

    // Verificar se o professor existe
    const professorQuery = 'SELECT * FROM professores WHERE id = $1'
    const professorResult = await pool.query(professorQuery, [professorId])
    if (professorResult.rows.length === 0) {
      return res.status(404).json({ message: "Professor não encontrado" })
    }

    // Verificar se o estudante existe
    const estudanteQuery = 'SELECT * FROM estudantes WHERE id = $1'
    const estudanteResult = await pool.query(estudanteQuery, [estudanteId])
    if (estudanteResult.rows.length === 0) {
      return res.status(404).json({ message: "Estudante não encontrado" })
    }

    // Verificar antecedência mínima de 24 horas
    const dataAgendamento = new Date(`${data.split("/").reverse().join("-")}T${hora}`)
    const agora = new Date()
    const diferencaHoras = (dataAgendamento - agora) / (1000 * 60 * 60)

    if (diferencaHoras < 24) {
      return res.status(400).json({
        message: "Agendamentos devem ser feitos com pelo menos 24 horas de antecedência",
      })
    }

    // Verificar disponibilidade do professor
    const disponibilidadeQuery = `
      SELECT COUNT(*) as total
      FROM agendamentos 
      WHERE professor_id = $1 
      AND DATE(data) = DATE($2)
    `
    const disponibilidadeResult = await pool.query(disponibilidadeQuery, [professorId, dataAgendamento])
    if (disponibilidadeResult.rows[0].total >= 8) {
      return res.status(400).json({
        message: "Professor já possui o máximo de aulas agendadas para este dia",
      })
    }

    // Criar novo agendamento
    const insertQuery = `
      INSERT INTO agendamentos (data, hora, professor_id, estudante_id, conteudo, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const values = [dataAgendamento, hora, professorId, estudanteId, conteudo, 'Em andamento']
    const { rows } = await pool.query(insertQuery, values)

    // Retornar agendamento com dados populados
    const agendamentoQuery = `
      SELECT a.*, p.nome as professor_nome, p.especialidade, e.nome as estudante_nome
      FROM agendamentos a
      INNER JOIN professores p ON a.professor_id = p.id
      INNER JOIN estudantes e ON a.estudante_id = e.id
      WHERE a.id = $1
    `
    const agendamentoResult = await pool.query(agendamentoQuery, [rows[0].id])
    
    res.status(201).json(agendamentoResult.rows[0])
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { data, hora, professorId, estudanteId, conteudo, status } = req.body

    // Verificar se o agendamento existe
    const agendamentoQuery = 'SELECT * FROM agendamentos WHERE id = $1'
    const agendamentoResult = await pool.query(agendamentoQuery, [req.params.id])
    
    if (agendamentoResult.rows.length === 0) {
      return res.status(404).json({ message: "Agendamento não encontrado" })
    }

    const agendamento = agendamentoResult.rows[0]

    // Verificar se o agendamento já foi finalizado
    if (agendamento.status === "Finalizada") {
      return res.status(400).json({ message: "Não é possível editar um agendamento finalizado" })
    }

    // Se estiver alterando a data/hora, verificar antecedência
    if (data && hora) {
      const dataAgendamento = new Date(`${data.split("/").reverse().join("-")}T${hora}`)
      const agora = new Date()
      const diferencaHoras = (dataAgendamento - agora) / (1000 * 60 * 60)

      if (diferencaHoras < 24) {
        return res.status(400).json({
          message: "Agendamentos devem ser alterados com pelo menos 24 horas de antecedência",
        })
      }
    }

    // Atualizar agendamento
    const updateQuery = `
      UPDATE agendamentos 
      SET data = $1,
          hora = $2,
          professor_id = $3,
          estudante_id = $4,
          conteudo = $5,
          status = $6
      WHERE id = $7
      RETURNING *
    `
    const values = [
      data ? new Date(`${data.split("/").reverse().join("-")}`) : agendamento.data,
      hora || agendamento.hora,
      professorId || agendamento.professor_id,
      estudanteId || agendamento.estudante_id,
      conteudo || agendamento.conteudo,
      status || agendamento.status,
      req.params.id
    ]

    const { rows } = await pool.query(updateQuery, values)

    // Retornar agendamento atualizado com dados populados
    const agendamentoAtualizadoQuery = `
      SELECT a.*, p.nome as professor_nome, p.especialidade, e.nome as estudante_nome
      FROM agendamentos a
      INNER JOIN professores p ON a.professor_id = p.id
      INNER JOIN estudantes e ON a.estudante_id = e.id
      WHERE a.id = $1
    `
    const agendamentoAtualizado = await pool.query(agendamentoAtualizadoQuery, [rows[0].id])

    res.json(agendamentoAtualizado.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Cancelar agendamento
exports.cancelarAgendamento = async (req, res) => {
  try {
    const query = 'SELECT * FROM agendamentos WHERE id = $1'
    const { rows } = await pool.query(query, [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ message: "Agendamento não encontrado" })
    }

    if (rows[0].status === "Finalizada") {
      return res.status(400).json({ message: "Não é possível cancelar um agendamento finalizado" })
    }

    const updateQuery = `
      UPDATE agendamentos 
      SET status = 'Cancelada'
      WHERE id = $1
      RETURNING *
    `
    const result = await pool.query(updateQuery, [req.params.id])

    res.json({ message: "Agendamento cancelado com sucesso", agendamento: result.rows[0] })
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Finalizar aula
exports.finalizarAula = async (req, res) => {
  try {
    const { observacoes } = req.body

    if (!observacoes) {
      return res.status(400).json({ message: "Observações são obrigatórias para finalizar uma aula" })
    }

    const query = 'SELECT * FROM agendamentos WHERE id = $1'
    const { rows } = await pool.query(query, [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ message: "Agendamento não encontrado" })
    }

    if (rows[0].status !== "Em andamento") {
      return res.status(400).json({ message: "Apenas aulas em andamento podem ser finalizadas" })
    }

    const updateQuery = `
      UPDATE agendamentos 
      SET status = 'Finalizada',
          observacoes = $1
      WHERE id = $2
      RETURNING *
    `
    const result = await pool.query(updateQuery, [observacoes, req.params.id])

    res.json({ message: "Aula finalizada com sucesso", agendamento: result.rows[0] })
  } catch (error) {
    console.error("Erro ao finalizar aula:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}

// Listar aulas do professor
exports.listarAulasProfessor = async (req, res) => {
  try {
    const { professorId } = req.params

    // Verificar se o professor existe
    const professorQuery = 'SELECT * FROM professores WHERE id = $1'
    const professorResult = await pool.query(professorQuery, [professorId])
    
    if (professorResult.rows.length === 0) {
      return res.status(404).json({ message: "Professor não encontrado" })
    }

    // Obter data atual (início do dia)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Buscar aulas do dia
    const aulasHojeQuery = `
      SELECT a.*, e.nome as estudante_nome, e.contato_whatsapp
      FROM agendamentos a
      INNER JOIN estudantes e ON a.estudante_id = e.id
      WHERE a.professor_id = $1
      AND DATE(a.data) = CURRENT_DATE
      AND a.status = 'Em andamento'
      ORDER BY a.hora ASC
    `
    const aulasHoje = await pool.query(aulasHojeQuery, [professorId])

    // Buscar histórico de aulas
    const historicoQuery = `
      SELECT a.*, e.nome as estudante_nome
      FROM agendamentos a
      INNER JOIN estudantes e ON a.estudante_id = e.id
      WHERE a.professor_id = $1
      AND (DATE(a.data) < CURRENT_DATE OR a.status = 'Finalizada')
      ORDER BY a.data DESC
      LIMIT 10
    `
    const historicoAulas = await pool.query(historicoQuery, [professorId])

    res.json({
      aulasHoje: aulasHoje.rows,
      historicoAulas: historicoAulas.rows,
    })
  } catch (error) {
    console.error("Erro ao listar aulas do professor:", error)
    res.status(500).json({ message: "Erro no servidor" })
  }
}
