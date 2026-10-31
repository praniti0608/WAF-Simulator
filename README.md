# WAF Simulator Dashboard

A full-stack educational Web Application Firewall simulator built around the supplied backend and a React dashboard.

## Stack

- React + Vite
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- Helmet + CORS + rate limiting
- Regex signature detection for SQL injection, XSS and path traversal

## Project structure

```text
WAF-Simulator-Full/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── waf/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── package.json
```

## Requirements

Install Node.js 18+ (Node 20+ recommended) and have MongoDB running locally, or use a MongoDB Atlas connection string.

## 1. Configure backend

Open the `backend` folder in VS Code.

Copy:

`backend/.env.example` → `backend/.env`

For local MongoDB use:

`MONGO_URI=mongodb://127.0.0.1:27017/waf_simulator`

For Atlas, replace it with your Atlas connection string.

## 2. Install dependencies

Open a terminal at the project root:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## 3. Start backend

Terminal 1:

```bash
npm --prefix backend run dev
```

You should see:

`MongoDB connected`

and:

`Server: http://localhost:5000`

Test:

`http://localhost:5000/api/health`

## 4. Start frontend

Terminal 2:

```bash
npm --prefix frontend run dev
```

Open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

## 5. Test the WAF

Use the **Attack Simulator** buttons:

- SQL Injection → `1 OR 1=1`
- XSS → `<script>alert(1)</script>`
- Path Traversal → `../../etc/passwd`
- Safe Request → `hello world`

The malicious requests should return HTTP 403 from the backend.

At the same time:

1. The attack is saved in MongoDB.
2. Socket.IO emits `attack:blocked`.
3. The dashboard updates without a page refresh.
4. The attack appears in Live Attack Stream.

## API endpoints

### Health

`GET /api/health`

### Demo endpoints

`GET /api/demo/search?q=...`

`POST /api/demo/comment`

`GET /api/demo/file?name=...`

### Dashboard

`GET /api/dashboard/stats`

`GET /api/dashboard/attacks?limit=50`

`GET /api/dashboard/rules`

## Architecture

```text
Browser / Demo Client
        |
        v
 React Dashboard <---- Socket.IO ---- Express Server
        |                                  |
        |                           WAF Middleware
        |                                  |
        |                    +-------------+-------------+
        |                    |                           |
        |               Safe request              Attack detected
        |                    |                           |
        |                    v                           v
        |              Demo route                 Log to MongoDB
        |                                                |
        +---------------- REST API <---------------------+
                              |
                              v
                       Live Dashboard
```

## Important note

This is an educational WAF simulator, not a production replacement for mature WAF products. Regex signatures can create false positives and can miss obfuscated or novel attacks. A production WAF normally combines multiple detection techniques, strict request validation, managed rule sets, rate controls, monitoring and extensive testing.

Only use the demo endpoints and security testing against systems you own or are authorized to test.
