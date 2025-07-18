import React from 'react';

function RoomList({ rooms, currentRoom, handleRoomChange, newRoomName, setNewRoomName, handleCreateRoom }) {
  return (
    <div className="w-64 bg-white border-r border-gray-300 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleCreateRoom} className="flex gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            placeholder="New room name"
            className="flex-1 px-2 py-1 border rounded text-sm"
            required
          />
          <button type="submit" className="bg-teal-500 text-white px-2 py-1 rounded text-sm">+</button>
        </form>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {rooms.map(room => (
          <li
            key={room.name || room}
            className={`px-4 py-2 cursor-pointer ${currentRoom === (room.name || room) ? 'bg-teal-100 font-bold' : 'hover:bg-gray-100'}`}
            onClick={() => handleRoomChange(room.name || room)}
          >
            {room.name || room}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;
