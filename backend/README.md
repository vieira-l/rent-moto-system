# Backend — Sistema de Gestão de Motos

API real (Node + Express + Prisma + Postgres) para substituir o armazenamento
local do frontend. Autenticação com senha criptografada (bcrypt) + sessão via
JWT em cookie httpOnly, autorização por papel (ADMIN/MANAGER/EMPLOYEE)
aplicada no servidor, e log de auditoria.

## Aviso importante sobre esta entrega

Este código foi escrito e teve a **sintaxe verificada** (`node --check` em
todos os arquivos), mas eu **não consegui rodar a migração/subir a API de
ponta a ponta neste ambiente**, porque:
- O ambiente onde eu rodo tem acesso de rede restrito e bloqueia o domínio
  que o Prisma usa para baixar seu motor (`binaries.prisma.sh`) — isso não é
  um problema do código, é uma restrição só deste sandbox.
- Não há um Postgres real disponível aqui para eu testar contra um banco de
  verdade.

Ou seja: o código segue padrões testados e amplamente usados, mas você (ou
eu, numa próxima sessão com acesso à internet completa) precisa rodar os
passos abaixo pelo menos uma vez para confirmar que tudo sobe corretamente
na prática.

## 1. Rodar localmente

```bash
cd backend
cp .env.example .env
# edite o .env: gere um JWT_SECRET forte e defina SEED_ADMIN_PASSWORD

docker compose up -d        # sobe um Postgres local (requer Docker instalado)
npm install
npm run prisma:migrate      # cria as tabelas
npm run seed                # cria o primeiro usuário administrador
npm run dev                 # sobe a API em http://localhost:4000
```

Teste rápido:
```bash
curl -i http://localhost:4000/health
curl -i -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"SUA_SENHA_DO_SEED"}'
```

## 2. Gerar build de produção

Este backend não precisa de "build" (é Node puro). Para produção, rode:
```bash
npm ci --omit=dev
npm run prisma:deploy   # aplica migrations existentes, sem gerar novas
npm start
```

## 3. Deploy recomendado

- **API**: Railway ou Render (ambos têm plano gratuito/baixo custo,
  deploy direto do GitHub, variáveis de ambiente pelo painel).
- **Banco**: Neon ou Supabase (Postgres gerenciado, com backup automático
  no plano pago e SSL por padrão).
- **Frontend**: Vercel (o app React atual pode continuar lá, apontando para
  a URL da API via `CORS_ORIGIN`/variável de ambiente do frontend).

Passo a passo Railway (API):
1. Crie conta em railway.app e conecte seu repositório GitHub com esta pasta `backend/`.
2. Em "Variables", adicione: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`.
3. Em "Deploy", defina o comando de start: `npm run prisma:deploy && npm start`.
4. Gere o domínio público (Railway fornece um `*.up.railway.app` com HTTPS automático).

Passo a passo Neon (banco):
1. Crie conta em neon.tech, crie um projeto Postgres.
2. Copie a connection string (já vem com `sslmode=require`) e cole em `DATABASE_URL`.
3. Backup automático diário já vem habilitado no Neon.

## 4. Variáveis de ambiente (produção)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | connection string do Postgres (Neon/Supabase/Railway) |
| `JWT_SECRET` | string aleatória longa (nunca reaproveitar a de dev) |
| `CORS_ORIGIN` | URL exata do frontend em produção (ex: `https://app.suaempresa.com`) |
| `NODE_ENV` | `production` |
| `PORT` | definido automaticamente pela maioria dos provedores |

## 5. Segurança já implementada no código

- Senhas com hash bcrypt (nunca texto puro).
- Sessão via JWT em cookie `httpOnly` + `secure` (produção) + `sameSite=lax`.
- Autorização por papel checada **no backend** (`requireRole`), não só na tela.
- **Não existe rota pública de cadastro** — só um ADMIN autenticado cria usuários (`POST /users`).
- Rate limit no login (mitiga força bruta) e geral na API.
- CORS restrito a um único domínio configurável.
- Helmet (cabeçalhos HTTP de segurança).
- Erros nunca vazam stack trace/detalhes internos ao cliente.
- Log de auditoria (`AuditLog`) para login/logout e criação/edição/exclusão.

## 6. O que ainda falta você decidir/fazer

- HTTPS: automático se você usar Railway/Render/Vercel (eles emitem
  certificado sozinhos). Só é manual se você mesmo hospedar em uma VPS.
- Domínio próprio: comprar e apontar DNS para o provedor escolhido.
- Conectar o frontend atual a esta API (hoje ele salva tudo localmente via
  `window.storage`; para usar este backend, as chamadas de salvar/ler
  precisam ser trocadas por `fetch` para estas rotas — posso fazer isso na
  próxima etapa).
- Backups: ativar no painel do provedor de banco escolhido (geralmente um
  botão/checkbox, não exige código).
