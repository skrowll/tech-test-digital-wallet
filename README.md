# 💰 Digital Wallet - Carteira Digital

Uma aplicação completa de carteira digital desenvolvida com **Next.js 15**, **TypeScript**, **Prisma** e **PostgreSQL**. Sistema moderno e seguro para gerenciamento de transações financeiras.

## 🚀 Funcionalidades

### 💳 Transações Financeiras
- **Depósitos**: Adicione fundos à sua conta com descrição opcional
- **Saques**: Retire valores da conta (permite saldo negativo)
- **Transferências**: Envie dinheiro para outros usuários por email
- **Histórico Completo**: Visualize todas as transações com detalhes

### 🔐 Sistema de Autenticação
- Registro de novos usuários com validação
- Login seguro com NextAuth.js
- Proteção de rotas e middleware de segurança
- Gerenciamento de sessões

### 📊 Interface Moderna
- Design responsivo com Tailwind CSS
- Tema claro/escuro alternável
- Notificações toast em tempo real
- Modais de confirmação para transações
- Máscaras de entrada para valores monetários

### 🛡️ Segurança e Validação
- Validação robusta com Zod
- Logs detalhados de operações
- Tratamento de erros abrangente
- Proteção contra CSRF e outras vulnerabilidades

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **SWR** - Gerenciamento de estado e cache
- **React Toastify** - Notificações
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - Backend integrado
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação
- **bcryptjs** - Hash de senhas

### Desenvolvimento
- **Jest** - Testes unitários e integração
- **ESLint** - Linting de código
- **Docker** - Containerização
- **TypeScript** - Desenvolvimento type-safe

## 🐳 Executando com Docker (Recomendado)

### Pré-requisitos
- Docker e Docker Compose instalados
- Git para clonar o repositório

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/skrowll/tech-test-digital-wallet.git
cd tech-test-digital-wallet
```

2. **Execute o setup completo (mais fácil)**
```bash
npm run docker:setup
```
Este comando irá:
- Construir as imagens Docker
- Inicializar os containers
- Configurar o banco de dados
- Aplicar as migrações do Prisma

3. **Acesse a aplicação**
- Abra seu navegador em [http://localhost:3000](http://localhost:3000)
- O banco PostgreSQL estará disponível na porta `5432`

### Comandos Docker Disponíveis

```bash
# Construir as imagens
npm run docker:build

# Iniciar os containers
npm run docker:up

# Iniciar com build (recomendado para primeira execução)
npm run docker:up:build

# Parar os containers
npm run docker:down

# Ver logs em tempo real
npm run docker:logs

# Reiniciar completamente
npm run docker:restart

# Limpar volumes (reset completo)
npm run docker:clean

# Aplicar migrações do banco
npm run docker:migrate
```

### Estrutura Docker

```yaml
# docker-compose.yml
services:
  app:          # Aplicação Next.js na porta 3000
  db:           # PostgreSQL na porta 5432
```

**Variáveis de Ambiente (Docker)**:
- `DATABASE_URL`: `postgres://postgres:postgres@db:5432/digital_wallet_db`
- `NEXTAUTH_SECRET`: Chave secreta para autenticação
- `NEXTAUTH_URL`: `http://localhost:3000`

## 💻 Executando Localmente

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

### Configuração

1. **Clone e instale dependências**
```bash
git clone https://github.com/skrowll/tech-test-digital-wallet.git
cd tech-test-digital-wallet
npm install
```

2. **Configure o banco de dados**
```bash
# Crie um banco PostgreSQL local
createdb digital_wallet_db

# Configure a variável de ambiente
echo "DATABASE_URL=postgresql://usuario:senha@localhost:5432/digital_wallet_db" > .env.local
echo "NEXTAUTH_SECRET=sua-chave-secreta-aqui" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
```

3. **Execute as migrações**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

### Scripts de Desenvolvimento

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm test             # Executar testes
npm run test:coverage # Testes com cobertura
```

## 📁 Estrutura do Projeto

```
tech-test-digital-wallet/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (protected)/        # Rotas protegidas
│   │   ├── (public)/           # Rotas públicas
│   │   └── api/                # API Routes
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes base
│   │   └── forms/              # Formulários específicos
│   ├── controllers/            # Lógica de controle da API
│   ├── services/               # Regras de negócio
│   ├── models/                 # Modelos do Prisma
│   ├── hooks/                  # React Hooks customizados
│   ├── utils/                  # Utilitários e helpers
│   ├── validations/            # Schemas de validação Zod
│   ├── types/                  # Definições TypeScript
│   └── config/                 # Configurações
├── prisma/                     # Schema e migrações
├── __tests__/                  # Testes automatizados
├── public/                     # Arquivos estáticos
└── docker-compose.yml          # Configuração Docker
```

## 🔑 Como Usar

### 1. Primeiro Acesso
- Acesse [http://localhost:3000](http://localhost:3000)
- Clique em "Registrar" para criar uma conta
- Preencha seus dados pessoais
- Faça login com suas credenciais

### 2. Realizando Transações

**Depósito**
1. Na dashboard, clique em "Depósito"
2. Digite o valor desejado (ex: 100,50)
3. Adicione uma descrição opcional
4. Confirme a operação

**Saque**
1. Clique em "Saque"
2. Digite o valor (permite saldo negativo)
3. Adicione uma descrição opcional
4. Confirme a operação

**Transferência**
1. Clique em "Transferência"
2. Digite o email do destinatário
3. Informe o valor a transferir
4. Adicione uma descrição opcional
5. Confirme os dados e execute

### 3. Visualizando Histórico
- Todas as transações aparecem na lista principal
- Depósitos aparecem em verde (+)
- Saques e transferências enviadas em vermelho (-)
- Transferências recebidas em verde (+)

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm test -- --watch
```

### Cobertura de Testes
O projeto inclui testes para:
- ✅ Componentes React
- ✅ Hooks customizados
- ✅ Serviços de negócio
- ✅ Validações Zod
- ✅ Modelos de dados
- ✅ Utilitários

## 🌐 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/deposit` - Realizar depósito
- `POST /api/withdraw` - Realizar saque
- `POST /api/transfer` - Realizar transferência

### Contas
- `GET /api/accounts` - Listar contas do usuário

## 🚀 Deploy

### Docker Production
```bash
# Build de produção
docker build -t digital-wallet .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="sua-url-do-banco" \
  -e NEXTAUTH_SECRET="sua-chave-secreta" \
  -e NEXTAUTH_URL="https://seu-dominio.com" \
  digital-wallet
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database
NEXTAUTH_SECRET=chave-secreta-muito-segura
NEXTAUTH_URL=https://seu-dominio.com
NODE_ENV=production
```

## 📊 Monitoramento

### Logs
A aplicação gera logs detalhados para:
- Operações de transação
- Erros de autenticação
- Falhas de validação
- Performance de queries

### Health Check
- Endpoint: `GET /api/health`
- Verifica conexão com banco de dados
- Status da aplicação

### Logs úteis
```bash
# Ver logs do container da aplicação
docker logs digital-wallet-app

# Ver logs do PostgreSQL
docker logs digital-wallet-db

# Ver status dos containers
docker-compose ps
```

---

**Desenvolvido por [Lucas Rocha](https://github.com/skrowll)**
