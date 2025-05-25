-- database/migrations/01_init_database.sql
-- Migration inicial para criação das tabelas do sistema de escola de idiomas

-- REMOVIDO: CREATE DATABASE IF NOT EXISTS sonarqube; -- Esta linha causava erro no PostgreSQL

-- Enum para tipos de usuário
CREATE TYPE user_type AS ENUM ('ADMINISTRADOR', 'PROFESSOR');

-- Enum para status de agendamento
CREATE TYPE appointment_status AS ENUM ('AGENDADO', 'FINALIZADA', 'CANCELADO');

-- Tabela de usuários (administradores e professores)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo user_type NOT NULL,
    ativo BOOLEAN DEFAULT true,
    data_nascimento DATE,
    especialidade VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estudantes
CREATE TABLE estudantes (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    
    -- Endereço
    cep VARCHAR(8),
    logradouro VARCHAR(200),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Contatos
    telefone VARCHAR(15),
    whatsapp VARCHAR(15) NOT NULL,
    email VARCHAR(150),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    estudante_id INTEGER NOT NULL REFERENCES estudantes(id) ON DELETE CASCADE,
    professor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data_aula TIMESTAMP NOT NULL,
    conteudo_aula TEXT NOT NULL,
    status appointment_status DEFAULT 'AGENDADO',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_estudantes_cpf ON estudantes(cpf);
CREATE INDEX idx_estudantes_nome ON estudantes(nome, sobrenome);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_aula);
CREATE INDEX idx_agendamentos_professor ON agendamentos(professor_id);
CREATE INDEX idx_agendamentos_estudante ON agendamentos(estudante_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estudantes_updated_at BEFORE UPDATE ON estudantes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
-- Usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (cpf, nome, sobrenome, email, senha, tipo, especialidade) VALUES
('12345678901', 'Admin', 'Sistema', 'admin@escola.com', '$2b$10$rQvNhkH7f5Zx6kF8mP9TJeY7QwE1R2T3U4I5O6P7A8S9D0F1G2H3J4', 'ADMINISTRADOR', 'Gestão'),
('98765432109', 'Maria', 'Silva', 'maria@escola.com', '$2b$10$rQvNhkH7f5Zx6kF8mP9TJeY7QwE1R2T3U4I5O6P7A8S9D0F1G2H3J4', 'PROFESSOR', 'Inglês'),
('11122233344', 'João', 'Santos', 'joao@escola.com', '$2b$10$rQvNhkH7f5Zx6kF8mP9TJeY7QwE1R2T3U4I5O6P7A8S9D0F1G2H3J4', 'PROFESSOR', 'Espanhol');

-- Estudantes de exemplo
INSERT INTO estudantes (cpf, nome, sobrenome, data_nascimento, cep, logradouro, numero, bairro, cidade, estado, telefone, whatsapp, email) VALUES
('55566677788', 'Ana', 'Costa', '2000-05-15', '01310100', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '11987654321', '11987654321', 'ana@email.com'),
('99988877766', 'Pedro', 'Oliveira', '2010-08-20', '04038001', 'Rua Augusta', '500', 'Consolação', 'São Paulo', 'SP', '11912345678', '11912345678', 'pedro@email.com');

-- Agendamentos de exemplo
INSERT INTO agendamentos (estudante_id, professor_id, data_aula, conteudo_aula, status) VALUES
(1, 2, '2025-05-26 14:00:00', 'Aula de conversação básica em inglês', 'AGENDADO'),
(2, 3, '2025-05-26 16:00:00', 'Introdução ao vocabulário em espanhol', 'AGENDADO');