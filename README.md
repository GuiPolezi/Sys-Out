# 🖥️ Monitor de Sites

Sistema de monitoramento de disponibilidade de sites em tempo real, construído com **Next.js**, **Supabase** e **TypeScript**.

---

## ✨ Funcionalidades

- ✅ Cadastro de sites para monitoramento
- ⚡ Verificação de status em tempo real (com paralelismo em lotes)
- 📊 Dashboard com métricas: total, online, fora do ar e pendentes
- 🔒 Autenticação de usuários via Supabase
- ⏳ Timeout automático de 5s por requisição
- 🚀 Uso de `HEAD` requests para verificações mais rápidas

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [Next.js 14+](https://nextjs.org/) | Framework fullstack (App Router) |
| [Supabase](https://supabase.com/) | Banco de dados e autenticação |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com/)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/monitor-de-sites.git
cd monitor-de-sites
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

> Você encontra esses valores em **Project Settings → API** no painel do Supabase.

### 4. Configure o banco de dados

Execute o seguinte SQL no **SQL Editor** do Supabase:

```sql
create table websites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  created_at timestamp with time zone default now()
);

-- Habilita Row Level Security
alter table websites enable row level security;

-- Usuário só acessa os próprios sites
create policy "Usuário acessa apenas seus sites"
  on websites for all
  using (auth.uid() = user_id);
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   └── check/
│   │       └── route.ts        # Endpoint de verificação de status
│   ├── dashboard/
│   │   └── page.tsx            # Página principal do dashboard
│   └── login/
│       └── page.tsx            # Página de autenticação
├── utils/
│   └── supabase/
│       └── client.ts           # Cliente Supabase
├── .env.local                  # Variáveis de ambiente (não commitar)
└── README.md
```

---

## ⚙️ Como funciona a verificação

1. O frontend envia a URL para o endpoint `POST /api/check`
2. O backend faz uma requisição `HEAD` para o site alvo com timeout de **5 segundos**
3. O status HTTP retornado é interpretado e uma mensagem é exibida
4. Sites são verificados em **lotes de 10 em paralelo** para máxima performance

### Códigos de status tratados

| Código | Significado |
|---|---|
| 200 / 201 | ✅ Online e operando normalmente |
| 400 | ⚠️ Requisição inválida |
| 401 / 403 | 🔒 Acesso negado |
| 404 | ❌ Página não encontrada |
| 500 | 🔥 Erro interno no servidor |
| 502 | 🔥 Bad Gateway |
| 503 | 🚧 Serviço indisponível |
| 504 | ⏳ Gateway Timeout |
| 0 | 💀 Site inacessível ou URL inválida |

---

## 🔐 Autenticação

A autenticação é gerenciada pelo Supabase Auth. Cada usuário só tem acesso aos sites que ele mesmo cadastrou, garantido por **Row Level Security (RLS)** no banco de dados.

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
