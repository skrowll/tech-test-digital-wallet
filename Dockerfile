# Dockerfile simples para aplicação Digital Wallet
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat dumb-init

# Criar usuário não-root PRIMEIRO
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs prisma/ ./prisma/

# Instalar dependências
RUN npm ci --frozen-lockfile

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY --chown=nextjs:nodejs . .

# Build da aplicação
RUN npm run build

# Trocar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["dumb-init", "npm", "start"]
