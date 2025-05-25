// Definição da tabela Professor para PostgreSQL
const createProfessorTable = `
  CREATE TABLE IF NOT EXISTS professor (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    especialidade VARCHAR(255),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Trigger para atualizar updated_at automaticamente
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER update_professor_updated_at
    BEFORE UPDATE ON professor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = createProfessorTable;
