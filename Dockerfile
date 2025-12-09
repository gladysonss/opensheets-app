# Dockerfile para Next.js 16 com multi-stage build otimizado

# ============================================
# Stage 1: Instalação de dependências
# ============================================
FROM node:22-alpine AS deps

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar apenas arquivos de dependências para aproveitar cache
COPY package.json pnpm-lock.yaml* ./

# Instalar dependências (production + dev para o build)
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build da aplicação
# ============================================
FROM node:22-alpine AS builder

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar dependências instaladas do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo o código fonte
COPY . .

# Variáveis de ambiente necessárias para o build
# DATABASE_URL será fornecida em runtime, mas precisa estar definida para validação
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build da aplicação Next.js
# Nota: Se houver erros de tipo, ajuste typescript.ignoreBuildErrors no next.config.ts
RUN pnpm build

# Stage 2.5 removido: Instalação direta no runner economiza espaço

# ============================================
# Stage 3: Runtime (produção)
# ============================================


# ============================================
# Stage 2.5: Dependências leves para migração
# ============================================
FROM node:22-alpine AS migration-deps
WORKDIR /deps
# Instalar apenas o necessário para rodar o script de migrate.js
RUN npm init -y && \
    npm install drizzle-orm pg dotenv

# ============================================
# Stage 3: Runtime (produção)
# ============================================
FROM node:22-alpine AS runner

# Instalar wget para healthcheck (garantia)
RUN apk add --no-cache wget

# Instalar pnpm globalmente (para setup, embora não usaremos para install pesado)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar apenas arquivos necessários para produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copiar arquivos de build do Next.js (standalone já inclui node_modules podados)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar dependências extras de migração para pasta isolada
COPY --from=migration-deps --chown=nextjs:nodejs /deps/node_modules ./migration_node_modules

# Definir NODE_PATH para encontrar módulos extras se não estiverem no node_modules principal
ENV NODE_PATH=/app/migration_node_modules

# Copiar arquivos do Drizzle (migrations e schema)
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/db ./db

# Copiar script de migração leve
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.js ./scripts/migrate.js

# Definir variáveis de ambiente de produção
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Expor porta
EXPOSE 3000

# Ajustar permissões para o usuário nextjs
RUN chown -R nextjs:nodejs /app

# Mudar para usuário não-root
USER nextjs

# Health check usando wget (aumentei start-period para 30s)
HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Comando de inicialização
# Nota: Em produção com standalone build, o servidor é iniciado pelo arquivo server.js
CMD ["node", "server.js"]
