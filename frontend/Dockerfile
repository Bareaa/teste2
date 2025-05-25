# frontend/Dockerfile
FROM node:18-alpine

# Instalar dependências do sistema necessárias para alguns pacotes npm
# Mantenha estas linhas apenas se tiver certeza de que seu projeto Next.js as exige para 'npm install'
# Caso contrário, podem ser removidas para um build mais rápido.
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências. Usar 'npm install' para desenvolvimento,
# pois 'npm ci' é mais para ambientes de CI/CD para instalações limpas.
# A instalação global de 'serve' não é necessária se você vai usar 'npm run dev'
RUN npm install

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança (boa prática!)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

USER nodeuser

# Expor porta
EXPOSE 3000

# Health check - Importante para o Docker Compose saber quando o serviço está pronto
# Ajuste o 'start-period' se o frontend demorar muito para iniciar
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# O comando para iniciar a aplicação em modo de DESENVOLVIMENTO
CMD ["npm", "run", "dev"]

# As linhas para build de produção foram comentadas, pois esta versão é para desenvolvimento.
# Se precisar de um build de produção, você usaria uma abordagem de "multi-stage build"
# e os comandos 'npm run build' e 'serve'.
# # Para build de produção:
# # RUN npm run build
# # CMD ["serve", "-s", "build", "-l", "3000"]