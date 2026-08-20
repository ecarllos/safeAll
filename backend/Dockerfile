FROM node:20-alpine AS builder

WORKDIR /app

# Instalar OpenSSL e ca-certificates no Alpine Linux para o Prisma Engine
RUN apk add --no-cache openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

# Instalar OpenSSL no container de execução
RUN apk add --no-cache openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "until npx prisma db push; do echo 'Aguardando banco de dados PostgreSQL...'; sleep 2; done && node dist/main"]
