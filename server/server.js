// server.js - Main server file for Socket.io chat application
require('dotenv').config();
const connectDB = require('./config/db')
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { connect } = require('http2');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Serve uploads statically
app.use('/uploads', express.static(uploadDir));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    name: req.file.originalname,
    type: req.file.mimetype
  });
});

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Static list of available rooms
const roomsFile = path.join(__dirname, 'rooms.json');
let availableRooms = ['General', 'Tech', 'Random'];
// Load rooms from file if it exists
try {
  if (fs.existsSync(roomsFile)) {
    const fileData = fs.readFileSync(roomsFile, 'utf-8');
    const loadedRooms = JSON.parse(fileData);
    if (Array.isArray(loadedRooms) && loadedRooms.length > 0) {
      availableRooms = loadedRooms;
    }
  }
} catch (err) {
  console.error('Error loading rooms from file:', err);
}

function saveRoomsToFile() {
  try {
    fs.writeFileSync(roomsFile, JSON.stringify(availableRooms, null, 2));
  } catch (err) {
    console.error('Error saving rooms to file:', err);
  }
}
// Track which users are in which rooms
const userRooms = {};

// REST API to create a new room
app.post('/api/rooms', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Room name is required' });
  }
  const roomName = name.trim();
  if (availableRooms.includes(roomName)) {
    return res.status(409).json({ error: 'Room already exists' });
  }
  availableRooms.push(roomName);
  saveRoomsToFile();
  io.emit('room_list', availableRooms);
  res.status(201).json({ name: roomName });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle joining a room
  socket.on('join_room', (roomName) => {
    if (!availableRooms.includes(roomName)) return;
    // Leave previous room if any
    if (userRooms[socket.id]) {
      socket.leave(userRooms[socket.id]);
      // Notify users in the old room
      io.to(userRooms[socket.id]).emit('user_list', getUsersInRoom(userRooms[socket.id]));
    }
    socket.join(roomName);
    userRooms[socket.id] = roomName;
    // Notify users in the new room
    io.to(roomName).emit('user_list', getUsersInRoom(roomName));
    socket.emit('joined_room', roomName);
  });

  // Handle leaving a room
  socket.on('leave_room', () => {
    const room = userRooms[socket.id];
    if (room) {
      socket.leave(room);
      delete userRooms[socket.id];
      io.to(room).emit('user_list', getUsersInRoom(room));
    }
  });

  // Handle chat messages (now with room)
  socket.on('send_message', (messageData) => {
    const room = messageData.room || userRooms[socket.id] || 'General';
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      room,
      readBy: [], // Track who has read this message
    };
    messages.push(message);
    if (messages.length > 100) messages.shift();
    io.to(room).emit('receive_message', message);
    // Removed socket.emit('receive_message', message) to avoid duplicate messages
  });

  // Handle message read receipts for general room
  socket.on('message_read', ({ messageId, username, room }) => {
    // Find the message in the messages array
    const msg = messages.find((m) => m.id === messageId && m.room === room);
    if (msg && !msg.readBy.includes(username)) {
      msg.readBy.push(username);
      // Notify all users in the room about the read receipt update
      io.to(room).emit('message_read_update', { messageId, readBy: msg.readBy, room });
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;

      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }

      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    if (!users[socket.id]) {
      console.warn(`[private_message] No user found for socket ID ${socket.id}. Message will be sent as Anonymous.`);
    }
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      recipientId: to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    // Create a unique private room for the two users
    const privateRoom = [socket.id, to].sort().join('-');
    socket.join(privateRoom);
    io.sockets.sockets.get(to)?.join(privateRoom);
    io.to(privateRoom).emit('private_message', messageData);
  });

  // Handle add_reaction for message reactions
  socket.on('add_reaction', ({ messageId, emoji, username }) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    if (!msg.reactions) msg.reactions = [];
    let reaction = msg.reactions.find(r => r.emoji === emoji);
    if (!reaction) {
      reaction = { emoji, users: [] };
      msg.reactions.push(reaction);
    }
    if (!reaction.users.includes(username)) {
      reaction.users.push(username);
    } else {
      // Toggle off: remove user
      reaction.users = reaction.users.filter(u => u !== username);
      if (reaction.users.length === 0) {
        msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
      }
    }
    // Emit to the correct room or private chat
    if (msg.isPrivate) {
      io.to(msg.senderId).emit('reaction_update', { messageId, reactions: msg.reactions });
      if (msg.recipientId) io.to(msg.recipientId).emit('reaction_update', { messageId, reactions: msg.reactions });
    } else {
      io.to(msg.room).emit('reaction_update', { messageId, reactions: msg.reactions });
    }
  });

  // Handle dynamic room creation via socket
  socket.on('create_room', ({ name }) => {
    if (!name || typeof name !== 'string' || !name.trim()) return;
    const roomName = name.trim();
    if (availableRooms.includes(roomName)) return;
    availableRooms.push(roomName);
    saveRoomsToFile();
    io.emit('room_list', availableRooms);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }

    delete users[socket.id];
    delete typingUsers[socket.id];

    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));

    // On disconnect, remove user from room
    const room = userRooms[socket.id];
    if (room) {
      socket.leave(room);
      delete userRooms[socket.id];
      io.to(room).emit('user_list', getUsersInRoom(room));
    }
  });
});

// Helper to get users in a room
function getUsersInRoom(room) {
  return Object.entries(userRooms)
    .filter(([id, r]) => r === room)
    .map(([id]) => users[id])
    .filter(Boolean);
}

// API routes
app.get('/api/messages', (req, res) => {
  let { limit, before, room, isPrivate, recipientId, search } = req.query;
  limit = parseInt(limit) || 20;
  let filtered = messages;

  // Filter by room
  if (room) {
    filtered = filtered.filter(m => m.room === room && !m.isPrivate);
  }

  // Filter by private messages
  if (isPrivate === 'true') {
    if (recipientId) {
      filtered = filtered.filter(m => m.isPrivate && (m.senderId === recipientId || m.recipientId === recipientId));
    } else {
      filtered = filtered.filter(m => m.isPrivate);
    }
  }

  // Filter by search keyword (case-insensitive)
  if (search && typeof search === 'string') {
    const keyword = search.toLowerCase();
    filtered = filtered.filter(m => m.message && m.message.toLowerCase().includes(keyword));
  }

  // Filter by 'before' timestamp (for pagination)
  if (before) {
    filtered = filtered.filter(m => new Date(m.timestamp) < new Date(before));
  }

  // Sort by timestamp descending (newest first)
  filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Take up to 'limit' messages
  filtered = filtered.slice(0, limit);

  // Return in chronological order (oldest first)
  filtered = filtered.reverse();

  res.json(filtered);
});

// REST API to fetch paginated messages for a room
app.get('/api/messages', (req, res) => {
  const { room = 'General', limit = 20, before } = req.query;
  let filtered = messages.filter(m => m.room === room);
  if (before) {
    filtered = filtered.filter(m => new Date(m.timestamp) < new Date(before));
  }
  // Sort newest to oldest
  filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  // Paginate
  const paginated = filtered.slice(0, Number(limit));
  res.json(paginated);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// API route to get available rooms
app.get('/api/rooms', (req, res) => {
  res.json(availableRooms);
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
