# Projeto de Estudo - NestJS

Projeto de Estudo.

## 📚 O que é este projeto?

Backend para futura plataforma
- Controller básico com endpoint de saudação
- Service simples
- Estrutura padrão do NestJS
- Configuração de testes

## 🛠️ Como executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run start:dev
```

Acesse: `http://localhost:3000`

## 🧪 Testando

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e
```

## 📖 Conceitos estudados

- [x] Controllers
- [x] Services
- [x] Modules
- [ ] Guards
- [ ] Interceptors
- [ ] Pipes
- [ ] Database integration
- [ ] Authentication

## 📁 Estrutura

```
src/
├── app.controller.ts   # Rotas da aplicação
├── app.service.ts      # Lógica de negócio
├── app.module.ts       # Módulo principal
└── main.ts            # Inicialização da app
```

## 🎯 Próximos passos

- [ ] Adicionar mais endpoints
- [ ] Conectar com banco de dados
- [ ] Implementar validação
- [ ] Adicionar autenticação
- [ ] Criar mais módulos

---

💡 **Dica**: Use `npm run start:dev` para recarregar automaticamente quando fizer mudanças no código!