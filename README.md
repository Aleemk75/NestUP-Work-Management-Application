# NestUP - Work Management Application

NestUP is a comprehensive Work Process Tracker designed to streamline task management, dependency tracking, and team collaboration. It features a robust role-based access control system with dedicated dashboards for Admins and Members.

## 🚀 Live Demo Screenshots

### 🔑 Login Page
![Login Page](./working%20SS/Login%20Page.png)

### 📊 Admin Dashboard
![Admin Dashboard](./working%20SS/Admin%20Dashboard.png)

### 👥 Member Dashboard
![Member Dashboard](./working%20SS/Member%20Dashboard.png)

### ➕ Task Management
| Create New Task | Edit Task |
|:---:|:---:|
| ![Create New Task](./working%20SS/Create%20new%20work%20item.png) | ![Edit Task](./working%20SS/Edit%20work%20item.png) |

### 🔗 Dependency Management
![Dependencies](./working%20SS/Dependencies.png)

---

## ✨ Key Features

### 🛠 Admin Capabilities
- **Task Lifecycle Management**: Create, Edit, and Delete work items.
- **Member Assignment**: Assign tasks to specific team members based on skills.
- **Dependency Tracking**: Set "Full" or "Partial" dependencies between tasks to manage workflow bottlenecks.
- **Real-time Stats**: Track total tasks, blocked items, and team workload distribution.

### 👤 Member Capabilities
- **Personalized Dashboard**: View assigned tasks and their current status.
- **Progress Tracking**: Update task progress and status (To Do, In Progress, Done).
- **Dependency Awareness**: Visual indicators for blocked tasks and their impact on other items.

---

## 🛠 Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **Axios** (API Requests)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose**
- **JWT** (Authentication)
- **Bcrypt.js** (Password Hashing)

---

## 🏁 Getting Started

### Prerequisites
- Node.js installed
- MongoDB (Local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📝 Project Structure
- `/backend`: Express server, MongoDB models, and API routes.
- `/frontend`: React application, UI components, and state management.
- `/working SS`: Application screenshots and visual documentation.
