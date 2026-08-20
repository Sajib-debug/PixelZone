# 🖼️ PixelZone

**PixelZone** is a modern full-stack photo management application inspired by Google Photos. It allows users to securely upload, organize, view, and manage photos and albums.

## ✨ Features

* 🔐 JWT Authentication
* 📸 Photo Upload & Management
* 🗂️ Album Creation & Organization
* 🖼️ Responsive Photo Gallery
* ☁️ ImageKit Cloud Storage
* 🔄 Refresh Token Support
* 🎨 Modern Responsive UI
* 🌙 Dark/Light Mode
* 📄 Pagination

## 🛠️ Tech Stack

**Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zustand
* TanStack Query

**Backend**

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* JWT

**Database & Storage**

* MySQL
* ImageKit

## 🏗️ Architecture

```text
Next.js + TypeScript
        │
        ▼
   REST API
        │
        ▼
   Spring Boot
      │   │
      ▼   ▼
   MySQL ImageKit
```

## 🚀 Run Locally

### Backend

```bash
cd PixelZone
./mvnw spring-boot:run
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:8080`

## 👨‍💻 Author
**Sajib Kumar Roy**
CSE Student | Java & Spring Boot Developer
