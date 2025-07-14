# Testes Unitários - Tech Test Digital Wallet

Este documento descreve a estrutura de testes unitários criada para a aplicação de carteira digital.

## 📋 Visão Geral

Foi criada uma suíte completa de testes unitários cobrindo as principais funcionalidades da aplicação:

### 🧪 Testes Implementados

1. **Utils/Currency** - Testes para funções de formatação de moeda
2. **Validations/Schemas** - Testes para validação de dados com Zod
3. **Services/UserService** - Testes para lógica de negócio de usuários
4. **Controllers/UserController** - Testes para controllers de API
5. **Models/UserModel** - Testes para operações de banco de dados
6. **Hooks/Accounts** - Testes para hooks React customizados
7. **Components/BalanceCard** - Testes para componentes React

## 🚀 Como Executar

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com coverage
```bash
npm run test:coverage
```

### Executar testes para CI/CD
```bash
npm run test:ci
```

### Executar testes específicos
```bash
# Apenas testes de currency
npm test -- __tests__/utils/currency-simple.test.ts

# Apenas testes de validação
npm test -- __tests__/validations/additional-schemas.test.ts

# Apenas testes que funcionam atualmente
npm test -- __tests__/utils/ __tests__/validations/ __tests__/schemas.test.ts
```

## 📁 Estrutura dos Testes

```
__tests__/
├── components/
│   └── BalanceCard.test.tsx           # Testes de componentes React
├── controllers/
│   └── user.controller.test.ts        # Testes de controllers
├── hooks/
│   └── accounts.test.ts               # Testes de hooks customizados
├── models/
│   └── user.model.test.ts             # Testes de models
├── services/
│   └── user.service.test.ts           # Testes de services
├── utils/
│   ├── currency.test.ts               # Testes de utilities
│   └── currency-simple.test.ts        # Testes simples de currency
├── validations/
│   └── additional-schemas.test.ts     # Testes de validação
└── schemas.test.ts                    # Testes de schemas existentes
```

## ✅ Testes Funcionais

### Currency Utils (✅ Funcionando)
- ✅ `applyCurrencyMask` - Formatação de máscaras de moeda
- ✅ `currencyToNumber` - Conversão de moeda para número
- ✅ `formatCurrency` - Formatação para exibição

### Validations (✅ Funcionando)
- ✅ `withdrawSchema` - Validação de saques
- ✅ `transferSchema` - Validação de transferências
- ✅ `validateFormField` - Validação de campos individuais
- ✅ Edge cases e transformações de dados

### Schemas Existentes (✅ Funcionando)
- ✅ `loginSchema` - Validação de login
- ✅ `registerSchema` - Validação de registro
- ✅ Validações de email e senhas

## ⚠️ Testes Pendentes

Alguns testes precisam de configuração adicional para funcionar:

### Services/Controllers/Models
- Requerem mocks mais complexos do Prisma e NextAuth
- Dependem de APIs do Next.js que não estão disponíveis no ambiente de teste

### Components/Hooks
- Requerem mocks dos hooks SWR e contextos React
- Dependem de bibliotecas de terceiros

## 🔧 Configuração

### Jest Configuration
- **Framework**: Jest + Testing Library
- **Environment**: jsdom para testes React
- **Setup**: jest.setup.ts para configurações globais
- **Coverage**: Configurado para gerar relatórios HTML e LCOV

### Scripts Disponíveis
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --watchAll=false"
}
```

## 📊 Coverage

A configuração atual coleta coverage de:
- `src/**/*.{js,jsx,ts,tsx}`
- Exclui arquivos gerados, configurações e tipos
- Gera relatórios em HTML e LCOV

## 🎯 Benefícios Implementados

1. **Qualidade**: Garantia de que as funções utilitárias funcionam corretamente
2. **Documentação**: Os testes servem como documentação de como usar as funções
3. **Regressão**: Evita quebras em funcionalidades já testadas
4. **Confiança**: Permite refatorações com segurança
5. **Coverage**: Métricas de cobertura de código

## 🔄 Execução Contínua

Para desenvolvimento, recomenda-se:

```bash
# Deixar rodando durante o desenvolvimento
npm run test:watch
```

Isso executará automaticamente os testes relevantes quando arquivos forem modificados.

## 🚀 Próximos Passos

Para expandir a cobertura de testes:

1. **Mocks mais robustos**: Configurar mocks completos do Prisma e NextAuth
2. **Testes de integração**: Testes end-to-end com banco de dados de teste
3. **Testes de API**: Testes das rotas da API com supertest
4. **Testes visuais**: Snapshot testing para componentes React

---

💡 **Dica**: Execute `npm run test:coverage` para ver um relatório detalhado da cobertura de testes!
