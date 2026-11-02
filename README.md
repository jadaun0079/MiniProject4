# FinVortex — Futuristic Financial Intelligence & Expense Tracker

> A production-ready, full-stack financial command center built with **React 19**, **Vite**, **Express 5**, **MongoDB**, **JWT authentication**, and **Google Gemini GenAI**.

Live Netlify Frontend: [https://nimble-klepon-4875f3.netlify.app/](https://nimble-klepon-4875f3.netlify.app/)

---

## 🌟 Key Features

1. **Authentication & Session Security**
   - JWT-based authentication with cryptographically hashed passwords (`bcryptjs`).
   - Strict server-side user data isolation (zero cross-user data leakage).
   - Real-time password strength meter and show/hide password controls.
   - Protected routes and session recovery with automatic logout on token expiration.

2. **Main Command Center (Dashboard)**
   - Authoritative database-calculated balances: Net Balance, Total Inflows, Total Outflows, and Savings Rate.
   - Interactive Recharts cash flow comparisons (Income vs Expense bar chart).
   - Donut breakdown by spending categories with percentage allocations.
   - Live budget guardrails progress tracking.
   - AI Financial Insights powered by Google Gemini (with smart rule-based fallback).
   - Dynamic time filters: All Time, This Month, Last 30 Days.

3. **Transactions & Ledger Management**
   - Full CRUD operations for both Income and Expenses.
   - Multi-facet search across titles and notes.
   - Filter pills: Type (Income/Expense/All), Category dropdown, Payment Method, and Date Ranges.
   - Sorting by Date and Amount.
   - Pagination and instant CSV export of authorized user records.

4. **Category Budget Guardrails**
   - Create, edit, and delete monthly budget ceilings per category.
   - Real-time calculation of actual spending vs allocated limit.
   - Visual alert badges: `Healthy` (<75%), `75%+ Utilized` (75-99%), and `Over Budget!` (≥100%).

5. **Deep Analytics & Reports**
   - Daily spending velocity and trajectory area graphs.
   - Payment method channel allocations.
   - Ranked category expenditure leaderboard.

6. **Settings & Customization**
   - Global currency configuration (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`, `JPY`, `CHF`, `CNY`).
   - Theme toggle: Fintech Midnight Navy Dark Mode & Crisp Light Mode.
   - Date formatting preferences (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`).
   - Password update with verification.
   - Account termination & permanent data purge.

7. **Strict "Zero Dummy Data" Policy**
   - No mock numbers, simulated balances, or hardcoded sample datasets in production.
   - Fresh user accounts receive clean onboarding states until real transactions are logged.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express 5, MongoDB / Mongoose 9, JWT, Nodemailer, Google GenAI.
- **Deployment**: Netlify (Frontend SPA with `_redirects`), Render / Railway (Backend API).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Installation
Install dependencies for both backend and frontend:
```bash
# Backend dependencies
cd Backend
npm install
cd ..

# Frontend dependencies
cd Frontend
npm install
cd ..
```

### 2. Environment Variables Configuration

**Backend (`Backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
# Optional: GEMINI_API_KEY=your_gemini_api_key
# Optional: EMAIL_USER=your_email@gmail.com
# Optional: EMAIL_PASS=your_email_app_password
```

**Frontend (`Frontend/.env`):**
```env
VITE_API_URL=/api
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend (Port 5000)
cd Backend
npm run dev
<<<<<<< HEAD
Open https://ephemeral-cannoli-9810c0.netlify.app in your browser.
=======
>>>>>>> 567c499 (Upgrading)

# Terminal 2: Start Frontend (Port 5173)
cd Frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

### Run Backend Integration & Security Tests
Verify all 13 automated endpoints, data isolation, and calculation checks:
```bash
cd Backend
node test/api.test.js
```

### Production Build Verification
```bash
cd Frontend
npm run build
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and health status |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Private | Update name, currency, or theme |
| `PUT` | `/api/auth/password` | Private | Change password |
| `DELETE` | `/api/auth/account` | Private | Purge account & all records |
| `GET` | `/api/expenses` | Private | List transactions (search, filter, sort, paginate) |
| `POST` | `/api/expenses` | Private | Create income or expense record |
| `PUT` | `/api/expenses/:id` | Private | Update existing transaction |
| `DELETE` | `/api/expenses/:id` | Private | Delete transaction |
| `GET` | `/api/expenses/summary` | Private | Authoritative calculated totals & savings rate |
| `GET` | `/api/expenses/analytics`| Private | Time-series and category aggregation |
| `GET` | `/api/expenses/export` | Private | Export transactions to RFC 4180 CSV |
| `GET` | `/api/expenses/insights`| Private | AI-driven financial analysis (Gemini API) |
| `GET` | `/api/budgets` | Private | List category budgets with live spending |
| `POST` | `/api/budgets` | Private | Set monthly category budget ceiling |
| `PUT` | `/api/budgets/:id` | Private | Update budget limit |
| `DELETE` | `/api/budgets/:id` | Private | Delete category budget |

---

## 🌐 Netlify Deployment Guide

1. The repository includes `netlify.toml` configured with `base = "Frontend"`, `publish = "dist"`, and SPA redirect rules.
2. In your Netlify Site Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `Frontend/dist`
   - **Environment Variable**: `VITE_API_URL` set to your deployed backend URL (e.g. `https://expense-tracker-backend.onrender.com/api`).
3. Whenever code is committed to GitHub, Netlify automatically triggers the production build.

---

## 📄 License
Licensed under the [MIT License](LICENSE).
