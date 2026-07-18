# MeuOrça

Gerador de orçamentos online simples, moderno e extremamente fácil de usar para autônomos e pequenas empresas.

## Funcionalidades

- **Autenticação** — Login, cadastro, recuperação de senha e logout (Supabase Auth)
- **Dashboard** — Total de clientes, orçamentos, orçamentos do mês e valor total orçado
- **Clientes** — CRUD completo com busca em tempo real
- **Orçamentos** — Criação com itens ilimitados, cálculo automático e numeração sequencial
- **PDF** — Exportação profissional com logo, dados da empresa e rodapé "Gerado com MeuOrça"
- **Histórico** — Filtros por cliente e data, duplicar e excluir orçamentos
- **Perfil da Empresa** — Logo, dados de contato e endereço
- **Dark Mode** — Tema claro e escuro
- **Responsivo** — Funciona perfeitamente em celular e desktop

## Tecnologias

- React 19 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage)
- React Router + React Hook Form + Zod
- jsPDF + Lucide Icons
- Deploy: Vercel

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (para deploy)
- Conta no [GitHub](https://github.com) (para versionamento)

## Links do Projeto

| Serviço | URL |
|---------|-----|
| **App (Produção)** | https://meu-orca.vercel.app |
| **GitHub** | https://github.com/opengrafica/meu-orca |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/qtjzlivsebmamyppqawc |
| **Vercel Dashboard** | https://vercel.com/robsons-projects-a9a49b5e/meu-orca |

## Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/meu-orca.git
cd meu-orca

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

## Configuração do Supabase

### 1. Criar projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Copie a **URL** e a **anon key** em Settings → API

### 2. Executar migration

No Supabase Dashboard, vá em **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/migrations/001_initial_schema.sql
```

Isso cria:
- Tabelas: `profiles`, `clients`, `quotes`, `quote_items`
- Row Level Security (RLS) em todas as tabelas
- Trigger para criar perfil automaticamente no cadastro
- Bucket `company-logos` para upload de logos

### 3. Configurar Auth

Em **Authentication → URL Configuration**, adicione:
- Site URL: `https://meu-orca.vercel.app`
- Redirect URLs:
  - `https://meu-orca.vercel.app/login`
  - `http://localhost:5173/login`

### 4. Storage

O bucket `company-logos` é criado automaticamente pela migration. Verifique em **Storage** se está ativo e público.

## Deploy na Vercel

```bash
# Instale a CLI da Vercel (opcional)
npm i -g vercel

# Deploy
vercel
```

Ou conecte o repositório GitHub diretamente na Vercel:

1. Importe o projeto no [vercel.com/new](https://vercel.com/new)
2. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

O arquivo `vercel.json` já configura o roteamento SPA.

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # shadcn/ui
│   ├── layout/       # AppLayout, Sidebar
│   └── common/       # PageHeader, SearchInput, EmptyState
├── pages/            # Todas as páginas
├── hooks/            # useDebounce
├── services/         # auth, clients, quotes, profile, storage
├── lib/              # supabase, formatters, pdfGenerator, utils
├── types/            # TypeScript interfaces
└── contexts/         # Auth, Theme
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Lint com oxlint |

## Páginas

| Rota | Descrição |
|------|-----------|
| `/login` | Login |
| `/register` | Cadastro |
| `/forgot-password` | Recuperar senha |
| `/` | Dashboard |
| `/clients` | Clientes |
| `/quotes/new` | Novo orçamento |
| `/quotes/:id/edit` | Editar orçamento |
| `/history` | Histórico |
| `/profile` | Perfil da empresa |
| `/settings` | Configurações |

## Licença

MIT

---

Desenvolvido para que qualquer pessoa crie um orçamento profissional em menos de 30 segundos.
