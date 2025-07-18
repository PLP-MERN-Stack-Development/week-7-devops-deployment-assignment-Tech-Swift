# Tech Swift Chatbox

A modern, full-stack real-time chat application with rooms, private messaging, emoji reactions, file uploads, and search. Built for the PLP Week 7 DevOps/Deployment Assignment. The app is deployed to production using **Vercel** (client), **Render** (server), and **MongoDB Atlas** (database).

---

A modern, real-time chat application with room support, private messaging, emoji reactions, and file uploads. Built with React (client) and Node.js/Express/Socket.io (server), and styled using Tailwind CSS.

---

## Features
- **Real-time messaging**: Chat instantly in public rooms or private messages.
- **Multiple rooms**: Create and join chat rooms dynamically.
- **User presence**: See who is online and in each room.
- **Emoji reactions**: React to messages with emojis.
- **File uploads**: Share files with other users.
- **Search**: Find messages by keyword.
- **Notifications**: Browser notifications for new private messages.

---

## Project Structure
```
Tech-Swift/
├── client/      # React front-end (Vite, Tailwind CSS)
├── server/      # Node.js/Express/Socket.io back-end
├── screenshots/ # App screenshots
└── ...
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm
- MongoDB Atlas or local MongoDB instance

### 1. Clone the repository
```bash
git clone <repo-url>
cd week-7-devops-deployment-assignment-Tech-Swift
```

### 2. Set up the server
```bash
cd server
cp .env.example .env # Create your .env file
npm install # or pnpm install
```
Edit `.env` with your MongoDB URI and desired PORT.

### 3. Start the server
```bash
npm run dev   # for development (nodemon)
npm start     # for production
```

### 4. Set up the client
```bash
cd ../client
npm install # or pnpm install
```

### 5. Start the client
```bash
npm run dev
```
The app will be available at `http://localhost:5173` (default Vite port).

---

## Environment Variables
- `MONGO_URI_PRODUCTION`: MongoDB connection string
- `PORT`: Port for the server (default: 5000)

---

## Scripts
### Server
- `npm run dev` — Start server with nodemon
- `npm start` — Start server normally

### Client
- `npm run dev` — Start React app (Vite)
- `npm run build` — Build for production
- `npm run preview` — Preview production build

---

## Production Deployment

### Live URLs
- **Client (Vercel):** https://your-client-url.vercel.app
- **Server (Render):** https://your-server-url.onrender.com
- **Database:** MongoDB Atlas (cloud-hosted)

### Architecture
- **Frontend:** React (Vite) hosted on Vercel for fast global CDN delivery.
- **Backend:** Node.js/Express/Socket.io hosted on Render for scalable, always-on serverless deployment.
- **Database:** MongoDB Atlas for managed, secure, and scalable cloud database.

### Environment Variables
- **Client:**
  - `VITE_API_BASE` — The base URL of the deployed server (e.g. `https://your-server-url.onrender.com`)
- **Server:**
  - `MONGO_URI_PRODUCTION` — Your MongoDB Atlas connection string
  - `PORT` — Port for the server (Render sets this automatically)

### Deployment Steps

#### 1. Deploy the Server to Render
- Push your code to GitHub.
- Create a new Web Service on Render.
- Connect your repo, select the `server/` directory as root.
- Set environment variables (`MONGO_URI_PRODUCTION`, `PORT` if needed).
- Render will build and deploy automatically. Note the public server URL.

#### 2. Deploy the Client to Vercel
- Create a new project on Vercel, connect your repo, select the `client/` directory as root.
- In Vercel project settings, add the environment variable `VITE_API_BASE` and set it to your Render server URL (e.g. `https://your-server-url.onrender.com`).
- Deploy. Vercel will build and host the React app. Note the public client URL.

#### 3. Use MongoDB Atlas
- Create a free cluster on MongoDB Atlas.
- Add your Render server's IP to the Atlas network access list.
- Get your connection string and set it as `MONGO_URI_PRODUCTION` in Render.

---

## Screenshots
See the `screenshots/` directory for example UI.

---

## Production Best Practices
- Never commit secrets (Mongo URI, JWT keys) to your repo.
- Use `.env` files locally and set secrets in Vercel/Render dashboards.
- Always use HTTPS URLs for API endpoints in production.
- Limit CORS origins to your Vercel domain in production.
- Use environment-specific configuration for dev vs. prod.

---

## License
MIT

---

## Credits
- Built for PLP Week 7 DevOps/Deployment Assignment
- Tech Stack: React, Tailwind CSS, Node.js, Express, Socket.io, MongoDB Atlas, Vercel, Render

