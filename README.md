# Video Conferencing App

A full-stack video conferencing application built with React (frontend), NestJS (backend), and PostgreSQL. Features real-time video calls, chat functionality, user authentication, and a blogging system.

## 🚀 Features

- **🔐 Authentication System** - JWT-based user registration and login
- **📹 Video Conferencing** - Real-time video calls with WebRTC
- **💬 Real-time Chat** - Socket.io powered messaging system
- **📝 Blogging Platform** - Create and manage blog posts
- **👥 User Management** - User profiles and administration
- **📊 Metrics & Monitoring** - Application performance tracking
- **🔍 API Documentation** - Swagger/OpenAPI documentation

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components
- **Socket.io Client** for real-time communication
- **React Hook Form** with Zod validation

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** with TypeORM
- **Socket.io** for real-time features
- **JWT Authentication** with Passport
- **OpenTelemetry** for observability
- **Swagger** for API documentation

### Infrastructure
- **Docker** and **Docker Compose**
- **pgAdmin** for database management
- **Nginx** for frontend serving

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Start All Services
```bash
# Build and start all services
./scripts/build.sh all

# Or start specific services
./scripts/build.sh frontend backend postgres pgadmin
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## ♻️ Development Workflow

### Rebuild Services
Use the rebuild script with two modes:

```bash
# For config/env updates → SOFT (no image build)
./scripts/rebuild.sh <service|all> soft

# For code/Dockerfile changes → HARD (rebuild image)
./scripts/rebuild.sh <service|all> hard
```

**Examples:**
```bash
# After backend code edits
./scripts/rebuild.sh backend hard

# Recreate frontend to pick up env/static content changes
./scripts/rebuild.sh frontend soft
```

**Supported services**: `frontend`, `backend`, `postgres`, `pgadmin`. Use `all` for everything.

## 🧑‍💻 Local Development

### Frontend Development
```bash
cd frontend
yarn install
yarn dev   # http://localhost:3000
```

### Backend Development
```bash
cd backend
yarn install
yarn start:dev   # http://localhost:8080
```

### Database Access
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)
- **Direct Connection**: Host `postgres`, Port `5432` (inside Docker)
- **Local Connection**: Host `localhost`, Port `5432`

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Socket.io     │    │   pgAdmin       │
│   (Reverse      │    │   (Real-time    │    │   (DB Admin)    │
│    Proxy)       │    │    Chat/Video)  │    │   Port: 5050    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Module Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Auth      │  │   Users     │  │   Blogs     │         │
│  │   Module    │  │   Module    │  │   Module    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Chat      │  │  Meetings   │  │  Metrics    │         │
│  │   Module    │  │   Module    │  │   Module    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ TypeORM     │  │ OpenTelemetry│  │   JWT      │         │
│  │ (Database)  │  │ (Tracing)   │  │ (Auth)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Entity Relationship Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │     blogs       │    │   conversations │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │◄───┤ title           │    │ created_at      │
│ email (UNIQUE)  │    │ content         │    └─────────────────┘
│ password        │    │ author_id (FK)  │             │
│ age             │    │ created_at      │             │
│ is_active       │    └─────────────────┘             │
│ created_at      │                                   │
│ updated_at      │                                   │
└─────────────────┘                                   │
                                                      │
┌─────────────────┐    ┌─────────────────┐            │
│   messages      │    │conversation_    │            │
├─────────────────┤    │participants     │            │
│ id (PK)         │    ├─────────────────┤            │
│ conversation_id │◄───┤ conversation_id │◄───────────┘
│ sender_id (FK)  │    │ user_id (FK)    │
│ content         │    └─────────────────┘
│ created_at      │             │
└─────────────────┘             │
         │                      │
         │                      │
         └──────────────────────┘
                │
                ▼
┌─────────────────┐
│    meetings     │
├─────────────────┤
│ id (PK)         │
│ created_at      │
└─────────────────┘
```

### Table Definitions

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Blogs Table
```sql
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Chat Tables
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Meetings Table
```sql
CREATE TABLE meetings (
    id VARCHAR(16) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Architecture Flow

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Database   │    │   JWT       │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Login Request  │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 2. Validate User  │                   │
       │                   │──────────────────►│                   │
       │                   │◄──────────────────│                   │
       │                   │ 3. Generate JWT   │                   │
       │                   │──────────────────────────────────────►│
       │                   │◄──────────────────────────────────────│
       │ 4. Return Token   │                   │                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
```

### Real-time Communication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client A  │    │   Server    │    │   Client B  │
│             │    │ (Socket.io) │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Connect        │                   │
       │──────────────────►│                   │
       │                   │ 2. Join Room      │
       │                   │◄──────────────────│
       │                   │                   │ 3. Connect
       │                   │                   │──────────────────►│
       │                   │ 4. Join Room      │                   │
       │                   │◄──────────────────│                   │
       │ 5. Send Message   │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 6. Broadcast      │                   │
       │                   │──────────────────────────────────────►│
       │                   │                   │ 7. Receive Message│
       │                   │                   │◄──────────────────│
```

### Video Conferencing Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client A  │    │ Signaling   │    │   Client B  │
│             │    │   Server    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Join Meeting   │                   │
       │──────────────────►│                   │
       │                   │ 2. Notify Others  │                   │
       │                   │──────────────────────────────────────►│
       │                   │                   │ 3. Join Meeting  │
       │                   │◄──────────────────│                   │
       │ 4. Offer SDP      │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 5. Forward Offer  │                   │
       │                   │──────────────────────────────────────►│
       │                   │                   │ 6. Answer SDP    │
       │                   │◄──────────────────│                   │
       │ 7. ICE Candidate  │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 8. Forward ICE    │                   │
       │                   │──────────────────────────────────────►│
       │                   │                   │ 9. P2P Connection│
       │                   │                   │◄──────────────────│
```

## 📊 Request Flow Diagram

### HTTP Request Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Nginx     │    │   NestJS    │    │ PostgreSQL  │
│             │    │ (Reverse    │    │ (Backend)   │    │ (Database)  │
│             │    │  Proxy)     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. HTTP Request   │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 2. Forward        │                   │
       │                   │──────────────────►│                   │
       │                   │                   │ 3. Process        │
       │                   │                   │──────────────────►│
       │                   │                   │◄──────────────────│
       │                   │ 4. Response       │                   │
       │                   │◄──────────────────│                   │
       │ 5. HTTP Response  │                   │                   │
       │◄──────────────────│                   │                   │
```

### WebSocket Request Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   NestJS    │    │ PostgreSQL  │
│             │    │ (WebSocket  │    │ (Database)  │
│             │    │   Gateway)  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. WebSocket      │                   │
       │    Connection     │                   │
       │──────────────────►│                   │
       │                   │ 2. Authenticate   │
       │                   │──────────────────►│
       │                   │◄──────────────────│
       │ 3. Join Room      │                   │
       │──────────────────►│                   │
       │                   │ 4. Store Session  │
       │                   │──────────────────►│
       │                   │◄──────────────────│
       │ 5. Broadcast      │                   │
       │    Message        │                   │
       │──────────────────►│                   │
       │                   │ 6. Save Message   │
       │                   │──────────────────►│
       │                   │◄──────────────────│
       │ 7. Broadcast to   │                   │
       │    Other Clients  │                   │
       │◄──────────────────│                   │
```

## 📁 Project Structure

```
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── chat/           # Real-time chat
│   │   ├── meetings/       # Video conferencing
│   │   ├── blogs/          # Blogging system
│   │   ├── metrics/        # Application metrics
│   │   └── tracing/        # OpenTelemetry setup
│   └── test/               # Test files
├── database/               # Database initialization
├── scripts/                # Build and utility scripts
└── docker-compose.yml      # Docker services configuration
```

## 🔧 Useful Commands

### Docker Operations
```bash
# View service logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Remove volumes (⚠️ deletes data)
docker compose down -v
```

### API Testing
```bash
# Run API smoke tests
./scripts/test-api.sh.sh

# Health check
curl -s http://localhost:8080/api | jq .

# Test authentication
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Development Tools
```bash
# Frontend linting and formatting
cd frontend && yarn lint && yarn format

# Backend linting
cd backend && yarn lint

# Type checking
cd frontend && yarn type-check
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=test_db
DATABASE_USER=postgres
DATABASE_PASSWORD=password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080
FRONTEND_PORT=3000
```

## 📊 Monitoring & Observability

The application includes comprehensive monitoring:

- **OpenTelemetry** integration for distributed tracing
- **Prometheus metrics** for performance monitoring
- **Structured logging** with correlation IDs
- **Health check endpoints** for service monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Port conflicts**: If ports 3000, 8080, 5432, or 5050 are in use, modify the `docker-compose.yml` file.

**Database connection issues**: Ensure PostgreSQL container is running and healthy:
```bash
docker compose ps postgres
```

**Frontend not connecting to backend**: Check the `VITE_API_URL` environment variable in the frontend container.

**Permission issues**: On Linux/macOS, you might need to run Docker commands with `sudo`.

For more detailed debugging, check the [DEBUG_GUIDE.md](frontend/DEBUG_GUIDE.md) in the frontend directory.