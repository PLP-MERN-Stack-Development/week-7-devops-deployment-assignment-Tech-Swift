// backenint.js
// Centralized backend API interaction functions for the frontend

const API_BASE = 'https://roomchats-3ccf.onrender.com';
console.log("API_BASE in production:", API_BASE);

export async function getRooms() {
  const res = await fetch(`${API_BASE}/api/rooms`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function createRoom(roomName) {
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: roomName }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('File upload failed');
  return res.json();
}

export async function fetchMessages(room, limit = 20) {
  const res = await fetch(`${API_BASE}/api/messages?room=${encodeURIComponent(room)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function fetchOlderMessages(room, before, limit = 20) {
  const res = await fetch(`${API_BASE}/api/messages?room=${encodeURIComponent(room)}&limit=${limit}&before=${encodeURIComponent(before)}`);
  if (!res.ok) throw new Error('Failed to fetch older messages');
  return res.json();
}

// Add other backend API functions as needed
