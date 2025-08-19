# 🎯 RequestCenter - Sistema de Solicitações com IA

Sistema completo de gerenciamento de solicitações com análise de imagens por IA, chat em tempo real e interface desktop usando Next.js + Tauri.

## 🚀 Funcionalidades Principais

### 📋 Sistema de Solicitações
- **Criação de solicitações** com múltiplos arquivos de imagem
- **Análise automática de imagens** usando Google Gemini AI
- **Sistema de prioridades** (Baixa, Média, Alta, Crítica)
- **Status de acompanhamento** (Aberta, Em Atendimento, Finalizada, Cancelada)
- **QR Code** para acesso rápido às solicitações

### 💬 Chat em Tempo Real
- **WebSocket** com Socket.IO para mensagens instantâneas
- **Janela flutuante** de chat (estilo Discord)
- **Histórico de mensagens** persistente
- **Notificações** de novas mensagens

### 🖥️ Interface Desktop (Tauri)
- **Aplicação nativa** para Windows/macOS/Linux
- **Janela principal** com todas as funcionalidades
- **Janela flutuante** de chat transparente
- **Always on top** para o chat

### 🤖 Processamento de Imagens com IA
- **Worker assíncrono** para análise de imagens
- **Google Gemini AI** para inspeção de qualidade
- **Sistema de filas** com BullMQ e Redis
- **Retry automático** em caso de falhas

### 👥 Sistema de Autenticação
- **NextAuth.js** com credenciais
- **Dois tipos de usuário**: Solicitante e Atendente
- **Middleware** de proteção de rotas
- **Sessões JWT** seguras

## 📋 Pré-requisitos

### Obrigatórios
- **Node.js** (v18 ou superior)
- **PostgreSQL** (banco de dados principal)
- **Redis** (para filas de processamento)
- **Rust** (para compilação do Tauri)

### Para Windows
- **Microsoft C++ Build Tools**
- **WebView2** (geralmente já instalado)

### Instalação do Rust
```bash
# Windows
# Baixe e execute: https://rustup.rs/

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/requestcenter"
SHADOW_DATABASE_URL="postgresql://usuario:senha@localhost:5432/requestcenter_shadow"

# Servidor
PORTA=3001
NODE_ENV=development

# NextAuth
NEXTAUTH_SECRET="seu-secret-muito-seguro-aqui"
NEXTAUTH_URL="http://localhost:3001"

# URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
URL_WEBSOCKET="http://localhost:3001"
URL_TAURI="http://localhost:3001"

# Google AI
GOOGLE_API_KEY="sua-chave-do-google-gemini"
```

### 2. Configuração do Banco de Dados
```bash
# Instalar dependências
npm install

# Executar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate
```

### 3. Configuração do Redis
```bash
# Instalar Redis (Windows com Chocolatey)
choco install redis-64

# Ou usar Docker
docker run -d -p 6379:6379 redis:alpine

# Verificar se está rodando
redis-cli ping
```

## 🚀 Como Executar

### Desenvolvimento Web
```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Ou executar frontend e backend separadamente
npm run dev:frontend  # Next.js na porta 3000
npm run dev:backend   # Servidor na porta 3001
```

### Desenvolvimento Desktop (Tauri)
```bash
# Configurar Tauri
npm run tauri:config

# Executar em modo desenvolvimento
npm run tauri:dev
```

### Worker de Processamento de Imagens
```bash
# Em um terminal separado, executar o worker
node src/workers/imageWorker.js
```

### Produção
```bash
# Build do Next.js
npm run build

# Executar servidor de produção
npm start

# Build do Tauri (desktop)
npm run tauri:build
```

## 🔧 Componentes do Sistema

### 📁 Estrutura do Projeto
```
RequestCenter/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── (SOLICITANTE)/     # Rotas do solicitante
│   │   ├── (ATENDENTE)/       # Rotas do atendente
│   │   ├── chat-window/       # Janela flutuante de chat
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilitários e configurações
│   ├── hooks/                 # Custom hooks
│   └── workers/               # Workers de processamento
├── src-tauri/                 # Configuração Tauri
├── prisma/                    # Schema e migrações do banco
└── public/                    # Arquivos estáticos
```

### 🗄️ Banco de Dados (PostgreSQL)
- **User**: Usuários do sistema (Solicitante/Atendente)
- **Solicitacao**: Solicitações com status e prioridade
- **Mensagem**: Chat entre usuários
- **ArquivoSolicitacao**: Imagens com análise de IA

### 🔄 Worker de Processamento
O worker `imageWorker.js` processa imagens em background:
- Conecta ao Redis para receber jobs
- Analisa imagens com Google Gemini AI
- Salva resultados no banco de dados
- Sistema de retry automático

### 🌐 WebSocket (Socket.IO)
Comunicação em tempo real:
- Mensagens de chat instantâneas
- Notificações de novas solicitações
- Atualizações de status

## 🎨 Interface Desktop (Tauri)

### Janela Principal
- Interface completa do sistema
- Todas as funcionalidades disponíveis
- Decorações normais do sistema

### Janela Flutuante de Chat
- Sem decorações do sistema operacional
- Fundo transparente com blur
- Sempre no topo (always on top)
- Barra de título customizada arrastável
- Botões customizados (minimizar/fechar)

### Configuração do Tauri
```json
{
  "windows": [
    {
      "label": "chat-window",
      "decorations": false,
      "transparent": true,
      "alwaysOnTop": true,
      "width": 400,
      "height": 600
    }
  ]
}
```

## 🤖 Configuração da IA (Google Gemini)

### 1. Obter API Key
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Adicione no arquivo `.env`

### 2. Configuração do Worker
O worker analisa imagens para:
- Identificar defeitos e danos
- Classificar problemas (estético/funcional)
- Sugerir causas prováveis
- Gerar relatórios em português

## 🔐 Autenticação e Permissões

### Tipos de Usuário
- **SOLICITANTE**: Cria e acompanha solicitações
- **ATENDENTE**: Gerencia e responde solicitações

### Rotas Protegidas
- Middleware automático de autenticação
- Redirecionamento baseado em permissões
- Sessões JWT seguras

## 📱 Funcionalidades Especiais

### QR Code
- Geração automática para cada solicitação
- Acesso rápido via mobile
- Compartilhamento fácil

### Upload de Múltiplas Imagens
- Drag & drop interface
- Análise automática por IA
- Preview das imagens
- Relatórios de análise

### Chat em Tempo Real
- Mensagens instantâneas
- Histórico persistente
- Indicadores de leitura
- Suporte a arquivos

## 🐛 Troubleshooting

### Problemas Comuns

**Worker não processa imagens:**
```bash
# Verificar Redis
redis-cli ping

# Verificar API Key do Google
echo $GOOGLE_API_KEY

# Executar worker manualmente
node src/workers/imageWorker.js
```

**Tauri não compila:**
```bash
# Verificar Rust
rustc --version
cargo --version

# Reinstalar dependências
npm run tauri:config
```

**Banco de dados:**
```bash
# Reset do banco
npx prisma migrate reset

# Recriar migrações
npx prisma migrate dev
```

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run dev:frontend     # Apenas Next.js
npm run dev:backend      # Apenas servidor

# Tauri
npm run tauri:dev        # Desenvolvimento desktop
npm run tauri:build      # Build desktop
npm run tauri:config     # Gerar configuração

# Produção
npm run build            # Build Next.js
npm start                # Servidor produção
npm run lint             # Verificar código
```

## 🔗 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **Desktop**: Tauri, Rust
- **Real-time**: Socket.IO, WebSocket
- **Queue**: BullMQ, Redis
- **AI**: Google Gemini AI
- **Auth**: NextAuth.js, JWT
- **UI**: Radix UI, Framer Motion, Lucide Icons

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ para otimizar o gerenciamento de solicitações com tecnologia de ponta.**