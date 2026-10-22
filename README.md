# GaurivaAI

GaurivaAI is a production-ready, AI-powered workspace built using a microservices architecture. It combines multiple specialized AI agents behind a single conversational interface, enabling users to chat, generate code, create PDFs and PowerPoint presentations, perform web search, analyze files with Retrieval-Augmented Generation (RAG), and generate images.

The platform uses LangGraph for intelligent agent orchestration, Firebase Authentication for secure login, Redis for session management, Razorpay for billing, Qdrant as a vector database for semantic retrieval, and Amazon S3 for file storage.

---

## ✨ Features

- 🤖 Multi-Agent AI Architecture
- 🧠 Automatic Agent Routing with LangGraph
- 💬 AI Chat Assistant
- 💻 AI Coding Assistant
- 🌐 AI Web Search
- 📄 AI PDF Generator
- 📊 AI PowerPoint Generator
- 🎨 AI Image Generation
- 📚 PDF RAG using Qdrant
- 📝 Cross-Conversation Memory
- 🔐 Google Authentication with Firebase
- 💳 Credit-Based Billing with Razorpay
- ⚡ Redis Session Management
- 📂 File Upload & Analysis
- ☁️ AWS S3 File Storage
- 💬 Conversation History
- 🏗️ Microservices Architecture

---

## 🛠 Tech Stack

### Frontend

- React 19
- Vite
- Redux Toolkit
- Tailwind CSS
- Firebase Authentication
- Razorpay Checkout

### Backend

- Node.js
- Express.js
- LangGraph
- LangChain
- MongoDB
- Redis
- Qdrant
- AWS S3

### AI Models & APIs

- Google Gemini
- Groq
- Tavily Search API

### DevOps

- Docker
- Docker Compose

---

## 🏛 Architecture

```text
Browser (React + Vite)
          |
          ▼
    API Gateway :3000
          |
  +-------+--------+---------+----------+
  |       |        |         |          |
Auth    Chat     Agents    Billing    Redis
:8001   :8002     :8003     :8004      :6379
  |       |        |         |
  +-------+--------+---------+
                 |
      MongoDB · Qdrant · AWS S3 · AI APIs
```

---

## 🔄 Request Flow

```text
React Frontend
        │
        ▼
   API Gateway
        │
 ┌──────┼───────────────┐
 ▼      ▼        ▼      ▼
Auth   Chat   Agents  Billing
 │       │        │       │
 └───────┼────────┼───────┘
         ▼
      MongoDB

Agents
   │
   ├── LangGraph
   ├── Gemini
   ├── Groq
   ├── Tavily
   ├── Qdrant
   └── AWS S3

Redis
 ├── Sessions
 └── Cache
```

---

## 🚀 Available Agents

| Agent | Purpose |
|--------|---------|
| Chat | General conversation |
| Coding | Code generation, debugging, explanation |
| Search | AI-powered web search |
| PDF | AI PDF generation |
| PPT | AI PowerPoint generation |
| Image | AI image generation |
| File Analysis | PDF RAG and document understanding |

---

## 📂 Project Structure

```text
frontend/
backend/
├── gateway/
├── services/
│   ├── auth/
│   ├── chat/
│   ├── agents/
│   └── billing/
├── shared/
└── docker-compose.yml
```

---

## 🔐 Authentication

- Google Sign-In using Firebase Authentication
- Session-based authentication
- Redis session storage
- HTTP-only cookies
- Protected API Gateway routes

---

## 💳 Billing

- Razorpay payment integration
- Credit-based subscription system
- Starter & Pro plans
- Automatic credit deduction
- Secure payment verification

---

## 🧠 AI Capabilities

- Multi-Agent Routing
- Context-Aware Chat
- Cross-Conversation Memory
- PDF Retrieval-Augmented Generation (RAG)
- AI Document Generation
- AI Presentation Generation
- AI Image Generation
- AI Code Generation
- Web Search with Citations

---

## ⚙️ Development

```bash
# Install dependencies
npm install

# Start all services
npm run dev

# Build frontend
npm run build --prefix frontend

# Lint frontend
npm run lint --prefix frontend
```

---

## 🌍 Environment Variables

Each service maintains its own `.env` file.

- Frontend
- Gateway
- Auth Service
- Chat Service
- Agent Service
- Billing Service

Refer to the environment configuration section below for all required variables.

---

## 📡 Main Endpoints

| Service | Port |
|---------|------|
| Gateway | 3000 |
| Auth | 8001 |
| Chat | 8002 |
| Agents | 8003 |
| Billing | 8004 |

Main endpoint:

```http
POST /agent/chat
```

Supports:

- Prompt
- Conversation ID
- Agent selection
- Multiple file uploads
- PDF RAG
- Image generation

---

## 🚀 Deployment

Production deployment recommendations:

- Managed MongoDB
- Managed Redis
- Qdrant Cloud
- AWS S3
- HTTPS
- Secure Cookies
- Environment Secret Management

---

## 🗺️ Roadmap

- [ ] Voice Chat
- [ ] AI Interview Agent
- [ ] Team Collaboration
- [ ] Workflow Automation
- [ ] Plugin Marketplace
- [ ] Mobile App
- [ ] Local LLM Support
- [ ] Streaming Responses

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
