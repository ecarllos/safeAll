# safeAll 🛡️ - Gerenciador de Senhas Criptografado & Open-Source

> **Nunca mais perca ou salve suas senhas no WhatsApp!**  
> `safeAll` é um gerenciador de senhas moderno, desenvolvido com **NestJS**, **Prisma ORM**, **PostgreSQL** e **React**, focado em segurança de ponta a ponta, busca instantânea e **linha do tempo com histórico de revisões de senhas**.

---

## ✨ Principais Funcionalidades

- 🔒 **Criptografia Autenticada AES-256-GCM**: Senhas de bancos, servidores, infraestrutura e aplicativos são criptografadas antes de serem salvas. O banco de dados **nunca** armazena senhas em texto puro.
- 🔑 **Derivação de Chave via Senha Mestra (PBKDF2)**: Apenas quem possui a Senha Mestra consegue descriptografar os segredos.
- 📜 **Histórico e Versionamento de Senhas**: Cada vez que você atualiza a senha de um serviço, a versão anterior é salva em uma timeline cronológica. Nunca mais esqueça qual era a senha anterior!
- 🔍 **Busca Rápida e Categorias**: Organize suas credenciais por Bancos, Dev & Infraestrutura, Aplicativos e Notas Secretas.
- 🎲 **Gerador de Senhas Fortes**: Crie senhas aleatórias e personalizadas com 1 clique.
- 📋 **Cópia Segura para Área de Transferência**: Copie senhas com 1 clique e limpeza automática da memória em 30 segundos.
- 🐳 **Pronto para o GitHub & Docker**: Suba a aplicação completa (PostgreSQL + API NestJS + Frontend Web) com **1 único comando**.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (Node.js + TypeScript)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **Criptografia & Autenticação**: Módulo Nativo `crypto` (AES-256-GCM + PBKDF2), Passport JWT e Bcrypt

### Frontend
- **Interface Web**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + TypeScript
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## 🚀 Como Executar o Projeto

### Opção 1: Via Docker Compose (Recomendado para Usuários do GitHub)

Se você tem o **Docker** instalado em seu computador, você pode rodar todo o sistema com 1 comando:

```bash
# 1. Clone o repositório
git clone https://github.com/ecarllos/safeAll.git
cd safeAll

# 2. Inicie os containers (PostgreSQL + Backend + Frontend)
docker compose up --build
```

Acesse a aplicação no seu navegador:
- **Interface Web**: [http://localhost:5173](http://localhost:5173)
- **Documentação da API (Swagger)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

### Opção 2: Execução Local para Desenvolvimento (Sem Docker)

#### Pré-requisitos
- Node.js v18+ instalado
- PostgreSQL rodando localmente (ex: porta `5432`)

#### 1. Configurar e Iniciar o Backend (NestJS)

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações do Prisma no PostgreSQL
npx prisma db push

# Iniciar o backend em modo de desenvolvimento
npm run start:dev
```

#### 2. Configurar e Iniciar o Frontend (React)

Em outro terminal:

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o frontend web
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no seu navegador.

---

## 🔒 Arquitetura de Criptografia & Segurança

1. Ao criar sua conta, o sistema registra uma **Senha Mestra (Master Password)** e gera um `salt` único.
2. Cada credencial inserida no cofre tem sua senha criptografada usando **AES-256-GCM** com uma chave derivada por **PBKDF2** (100.000 iterações com SHA-256).
3. Ao alterar uma senha, o registro antigo é movido para o histórico (`VaultItemHistory`), garantindo auditabilidade e recuperação de credenciais passadas.

---

## 🧪 Testes

Para rodar a suíte de testes de criptografia no backend:

```bash
cd backend
npm test
```

---

## 📄 Licença

Este projeto é open-source e está licenciado sob a licença [MIT](LICENSE). Sinta-se à vontade para utilizar, colaborar ou fazer um fork!