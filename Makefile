# Makefile para facilitar comandos Docker do projeto Escola de Idiomas

.PHONY: help build up down restart logs clean test migrate seed sonar

# Cores para output
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Mostra esta ajuda
	@echo "${GREEN}Comandos disponíveis:${NC}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${YELLOW}%-20s${NC} %s\n", $$1, $$2}'

build: ## Constroi todos os containers
	@echo "${GREEN}Construindo containers...${NC}"
	docker-compose build

up: ## Sobe todos os serviços
	@echo "${GREEN}Subindo serviços...${NC}"
	docker-compose up -d
	@echo "${GREEN}Serviços disponíveis:${NC}"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"
	@echo "PostgreSQL: localhost:5432"
	@echo "SonarQube: http://localhost:9000"

down: ## Para todos os serviços
	@echo "${YELLOW}Parando serviços...${NC}"
	docker-compose down

restart: ## Reinicia todos os serviços
	@echo "${YELLOW}Reiniciando serviços...${NC}"
	docker-compose restart

logs: ## Mostra logs de todos os serviços
	docker-compose logs -f

logs-backend: ## Mostra logs apenas do backend
	docker-compose logs -f backend

logs-frontend: ## Mostra logs apenas do frontend
	docker-compose logs -f frontend

logs-db: ## Mostra logs apenas do banco
	docker-compose logs -f postgres

clean: ## Remove containers, volumes e imagens
	@echo "${RED}Removendo containers, volumes e imagens...${NC}"
	docker-compose down -v --rmi all
	docker system prune -f

# Comandos de desenvolvimento
dev: ## Sobe ambiente de desenvolvimento
	@echo "${GREEN}Subindo ambiente de desenvolvimento...${NC}"
	docker-compose up -d postgres
	@sleep 5
	docker-compose up -d backend frontend

# Comandos de banco de dados
migrate: ## Executa migrations do banco
	@echo "${GREEN}Executando migrations...${NC}"
	docker-compose exec backend npm run migrate

seed: ## Popula banco com dados de exemplo
	@echo "${GREEN}Populando banco com dados de exemplo...${NC}"
	docker-compose exec backend npm run seed

db-reset: ## Reseta banco de dados
	@echo "${YELLOW}Resetando banco de dados...${NC}"
	docker-compose down postgres
	docker volume rm escola_postgres_data
	docker-compose up -d postgres

# Comandos de teste
test: ## Executa todos os testes
	@echo "${GREEN}Executando testes...${NC}"
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

test-backend: ## Executa testes do backend
	@echo "${GREEN}Executando testes do backend...${NC}"
	docker-compose exec backend npm test

test-frontend: ## Executa testes do frontend
	@echo "${GREEN}Executando testes do frontend...${NC}"
	docker-compose exec frontend npm test

test-e2e: ## Executa testes E2E
	@echo "${GREEN}Executando testes E2E...${NC}"
	docker-compose --profile testing up -d tests
	docker-compose exec tests npm run test:e2e

test-api: ## Executa testes de API com Robot Framework
	@echo "${GREEN}Executando testes de API...${NC}"
	docker-compose --profile testing up -d tests
	docker-compose exec tests npm run test:api

# Análise de código
sonar: ## Executa análise SonarQube
	@echo "${GREEN}Executando análise SonarQube...${NC}"
	docker-compose up -d sonarqube
	@sleep 30
	docker-compose exec backend npm run sonar
	docker-compose exec frontend npm run sonar
	@echo "${GREEN}Relatório disponível em: http://localhost:9000${NC}"

lint: ## Executa linting do código
	@echo "${GREEN}Executando linting...${NC}"
	docker-compose exec backend npm run lint
	docker-compose exec frontend npm run lint

lint-fix: ## Corrige problemas de linting automaticamente
	@echo "${GREEN}Corrigindo problemas de linting...${NC}"
	docker-compose exec backend npm run lint:fix
	docker-compose exec frontend npm run lint:fix

# Comandos de monitoramento
status: ## Mostra status dos containers
	docker-compose ps

stats: ## Mostra estatísticas dos containers
	docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Backup e restore
backup-db: ## Faz backup do banco de dados
	@echo "${GREEN}Fazendo backup do banco...${NC}"
	docker-compose exec postgres pg_dump -U postgres escola_idiomas > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restaura backup do banco (usar: make restore-db FILE=backup.sql)
	@echo "${GREEN}Restaurando backup do banco...${NC}"
	docker-compose exec -T postgres psql -U postgres escola_idiomas < $(FILE)

# Comandos úteis
shell-backend: ## Acessa shell do container backend
	docker-compose exec backend sh

shell-frontend: ## Acessa shell do container frontend
	docker-compose exec frontend sh

shell-db: ## Acessa shell do PostgreSQL
	docker-compose exec postgres psql -U postgres escola_idiomas

install-deps: ## Instala dependências dos projetos
	@echo "${GREEN}Instalando dependências...${NC}"
	cd backend && npm install
	cd frontend && npm install