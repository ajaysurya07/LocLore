LocLore 🌍  
A Full-Stack Geo-Tagging App with React, Leaflet, and Go

LocLore is a location-based content platform that allows users to tag, explore, and interact with geographic points of interest using a modern map UI and real-time data.



 🌟 Key Features

- 📍 Add, edit, and delete location-based entries (pins/markers)
- 🗺️ Interactive maps with clustering via Leaflet
- 🔐 User Authentication using Firebase & JWT
- 🧭 React Native–compatible navigation and mobile-safe layout
- 📦 Backend built with Go (Gin) + PostgreSQL
- ⚡ Optimized using Vite + React 19



 🧰 Tech Stack

 Frontend (Client)
- React 19 + Vite
- React Router, Redux Toolkit
- React-Leaflet + Clustering
- Firebase (for auth, if applicable)
- TailwindCSS + MUI (if used)

 Backend (Server)
- Go 1.24.2
- Gin Web Framework
- PostgreSQL with `pgx`
- JWT Authentication
- Environment variables via `godotenv`



 📁 Folder Structure



LocLore/
├── client/               React Frontend
│   ├── src/
│   └── package.json
├── server/               Go Backend (Gin + PostgreSQL)
│   ├── main.go
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── go.mod
└── README.md

`



 🚀 Getting Started

 Prerequisites
- Node.js, Go, PostgreSQL
- Firebase account (if used for auth)
- Google Maps or Leaflet access (if API keys required)



 Clone the Repo


git clone https://github.com/ajaysurya07/LocLore.git
cd LocLore

 Frontend Setup


cd client
npm install
npm run dev




 Backend Setup

bash
cd server
go mod tidy
go run main.go


> Make sure to configure your `.env` file with DB credentials and JWT secret.



 🔐 Environment Variables

Example for `server/.env`:

env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=loclore_db
JWT_SECRET=your_jwt_secret




 💡 Possible Use Cases

* Historical mapping
* Local recommendations
* Field survey tracking
* Travel journal / pinboard
