# 🚀 PR Checker — Automated Pull Request Analysis & Code Quality Insights  

<div align="center">
  <img src="https://raw.githubusercontent.com/Godse-07/MergeMind/master/frontend/public/Merge_Mind.jpg" 
       alt="PR Checker hero" width="200" height="200" style="border-radius:50%; margin-bottom:10px">
</div>

[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/API-Express.js-black?logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://merge-mind.vercel.app/)


**Live URL:** 🔗 [https://mergemind.me](https://mergemind.me/)

---

## 🧠 Overview

**PR Checker** is an AI-powered platform that automatically analyzes GitHub pull requests using the Gemini API.  
It helps developers improve **code quality**, **documentation**, and **consistency** through actionable insights and health scoring.

---

## 🧰 Tech Stack

### **Frontend**
- ⚛️ React (Vite)
- 🎨 Tailwind CSS
- 🔄 Axios
- 🌐 Deployed on Vercel

### **Backend**
- 🟩 Node.js + Express.js
- 🍃 MongoDB (Mongoose)
- 🔐 JWT Authentication
- 🤖 Gemini AI API
- ☁️ Deployed on Render
- ⚙️ GitHub OAuth + Webhooks Integration

---

## 🌟 Features

- 🔐 **GitHub OAuth Authentication**
- 🤖 **AI-powered PR Analysis (Gemini)**
- 📊 **Interactive Dashboard**
- 📈 **PR Health Scoring System**
- 📬 **GitHub Webhooks for Auto Analysis**
- ⚙️ **Configurable Analysis Rules (Working on)**
- 📤 **Export / Copy Reports (Working on)**
- 📢 **Email & Slack Notifications (Working on)**

---

## ⚙️ Environment Variables

### 🧩 **Backend (.env)**
```env
MONGO_URL=
JWT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
BACKEND_URL=
FRONTEND_URL=
GEMINI_API_KEY=
```

## 💻 Frontend (.env)
```env
VITE_GITHUB_CLIENT_ID=
VITE_GITHUB_REDIRECT_URI=
VITE_BASEURL=
```
---

### 🛠️ Setup Instructions
```bash
# 1️⃣ Clone the Repository
git clone https://github.com/Godse-07/MergeMind
cd MergeMind

cd backend
npm install

cd frontend
npm install
```

```bash
# 2️⃣ Create a .env file in backend/ using the variables above, then run:
node index.js / nodemon index.js

# Backend runs at 👉 http://localhost:3000
```

```bash
# 3️⃣ Setup Frontend

# Create a .env file in frontend/ using the variables above, then run:
npm run dev

# Frontend runs at 👉 http://localhost:5173
```

### 🧩 Project Structure

```text
pr-checker/
├── backend/
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── test/
│   ├── utils/
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   └── .env
│
└── README.md
```

### 🛠️ Setup Instructions
``` bash
1️⃣ Sign in using your GitHub account  
2️⃣ Connect your repositories  
3️⃣ Click “Analyze PRs” on any repository  

The app will:
- Fetch PRs from GitHub  
- Analyze them using the Gemini API  
- Display health scores and suggestions  

✅ View, export, or copy analysis results (working on)
```

## 🔌 API Endpoints

### **Auth Routes**
| Method | Endpoint                       | Description                                      | Middleware   |
|--------|--------------------------------|--------------------------------------------------|-------------|
| POST   | `/login`                        | User login                                       | —           |
| POST   | `/signup`                       | User signup                                      | —           |
| GET    | `/logout`                       | User logout                                      | —           |
| GET    | `/connectGithub/callback`       | GitHub OAuth callback                            | —           |
| GET    | `/disconnectGithub`             | Disconnect GitHub account                        | `isLoggedIn`|
| GET    | `/me`                           | Get logged-in user details                       | `isLoggedIn`|

---

### **Dashboard Routes**
| Method | Endpoint      | Description                        | Middleware   |
|--------|---------------|------------------------------------|-------------|
| GET    | `/stats`      | Get dashboard statistics           | `isLoggedIn`|

---

### **Repository Routes**
| Method | Endpoint      | Description                        | Middleware   |
|--------|---------------|------------------------------------|-------------|
| GET    | `/repos`      | Get list of connected repositories | `isLoggedIn`|

---

### **Pull Request (PR) Routes**
| Method | Endpoint                          | Description                       | Middleware   |
|--------|-----------------------------------|-----------------------------------|-------------|
| GET    | `/:repoId/prs`                     | Get all PRs for a repository      | `isLoggedIn`|
| GET    | `/:repoId/prs/:prNumber`           | Get details of a specific PR      | `isLoggedIn`|
| POST   | `/:repoId/prs/:prNumber/analyze`  | Trigger PR analysis               | `isLoggedIn`|

---

### **Webhook Routes**
| Method | Endpoint                  | Description                                   | Middleware   |
|--------|---------------------------|-----------------------------------------------|-------------|
| POST   | `/github`                 | GitHub webhook listener                        | —           |
| POST   | `/register/:repoId`       | Register a new webhook for a repository       | —           |


## 📝 Contribution & Pull Request Guidelines

We welcome contributions to **PR Checker**! Please follow these guidelines to ensure a smooth review process.

---

### 1️⃣ Create a Branch
- Always create a **new branch** for your work.
- Branch naming convention:  
  name/(fix|refactor|feat)/<short-description>

**Examples:**  
pushan/feat/github-oauth  
pushan/fix/dashboard-bug  
pushan/refactor/pr-analysis

---

### 2️⃣ Clear & Descriptive Title
- Use a **concise and understandable PR title**.
- Title should clearly describe what the PR does.  
**Example:**  
Add GitHub OAuth login flow  
Fix bug in dashboard stats calculation  
Refactor PR analysis controller

---

### 3️⃣ Add Description
- Always include a **detailed description** of what your PR does.
- Include **screenshots** if your changes affect UI or require testing visuals.
- Mention any **linked issues or tasks**.

---

### 4️⃣ Testing
- Make sure your code is **tested before creating a PR**.
- If applicable, attach **screenshots, GIFs, or logs** showing the test results.
- Ensure all backend routes and frontend features work as expected.

---

### 5️⃣ Code Quality
- Follow **consistent coding style** (Prettier / ESLint).
- Keep your code **clean, modular, and readable**.
- Write **meaningful commit messages**.

---

### 6️⃣ Pull Request Checklist
Before submitting your PR, make sure:
- [ ] Branch is up-to-date with `main`.
- [ ] Code is tested and working.
- [ ] Descriptive PR title and description is provided.
- [ ] Screenshots or demo if UI changes are made.
- [ ] No console logs or unnecessary comments remain.
- [ ] Proper commit messages and branch naming convention followed.

---

### 7️⃣ Review & Merge
- PRs will be **reviewed by maintainers**.
- Only approved PRs will be **merged into `main`**.
- Minor fixes or typos may be merged immediately.

---

### 8️⃣ Additional Notes
- For large features, **split into multiple PRs** if possible.
- If a PR requires discussion, use **comments to clarify** your approach.
- Be respectful and collaborative in **code review discussions**.


