# DL Platform

Projeto recentemente iniciado para desenvolvimento de uma plataforma completa.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeScript** - Superset tipado do JavaScript
- **Prisma** - ORM moderno para TypeScript/Node.js
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Argon2** - Hash de senhas
- **Passport** - Middleware de autenticação
- **Class Validator** - Validação de dados

## 📦 Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/                # Autenticação e autorização
│   │   ├── actions/         # Server actions
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── guards/         # Guards de autenticação
│   │   └── interfaces/     # Interfaces e tipos
│   ├── user/               # Gestão de usuários
│   │   ├── dto/           # DTOs do usuário
│   │   ├── interfaces/    # Interfaces do usuário
│   │   └── services/      # Serviços do usuário
│   └── email/             # Serviços de email
├── common/                # Guards, interceptors, decorators
└── prisma/               # Schema e migrações
```

## 🛠️ Instalação e Configuração

```bash
# Clone o repositório
git clone <repository-url>
cd dl-plataform-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações do banco
npx prisma generate
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run start:dev
```

## 🔐 Funcionalidades de Autenticação

- ✅ Registro de usuários com validação
- ✅ Verificação de email obrigatória
- ✅ Login com JWT (Access + Refresh tokens)
- ✅ Renovação automática de tokens
- ✅ Rate limiting para tentativas de login
- ✅ Logout seguro com revogação de tokens
- ✅ Logout de todos os dispositivos
- ✅ Limpeza automática de tokens expirados

## 📧 Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/dlplatform"

# JWT
JWT_SECRET_KEY="your-super-secret-jwt-key"

# API
API_DL_BACKEND_URL="http://localhost:3001"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🗄️ Banco de Dados

### Principais Entidades
- **Users** - Dados dos usuários
- **Tokens** - Refresh tokens ativos
- **Verifications** - Tokens de verificação de email
- **LoginAttempts** - Controle de tentativas de login

### Comandos Úteis do Prisma
```bash
# Visualizar dados no Prisma Studio
npx prisma studio

# Reset do banco (desenvolvimento)
npx prisma db push --force-reset

# Gerar cliente após mudanças no schema
npx prisma generate
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm run test
npm run test:watch
npm run test:e2e

# Linting
npm run lint
npm run lint:fix
```

## 🔒 Segurança Implementada

- **Rate Limiting** - Proteção contra ataques de força bruta
- **JWT Dual Tokens** - Access tokens curtos + Refresh tokens longos
- **Email Verification** - Verificação obrigatória de email
- **Password Hashing** - Argon2 para hash de senhas
- **Token Rotation** - Renovação de refresh tokens
- **Input Validation** - Validação rigorosa com class-validator

## 📄 API Endpoints

### Autenticação
- `POST /auth/sign-up` - Registro de usuário
- `POST /auth/sign-in` - Login
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Logout
- `POST /auth/verify-email` - Verificar email
- `POST /auth/resend-verification` - Reenviar verificação
- `GET /auth/validate` - Validar token

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request