import React from 'react';

function UserList({ users, handlePrivateChat, username }) {
  return (
    <div className="w-48 bg-gray-50 border-l border-gray-300 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 font-semibold text-teal-700">Users</div>
      <ul className="flex-1 overflow-y-auto">
        {users.map(user => (
          <li
            key={user.id || user.username}
            className={`px-4 py-2 cursor-pointer hover:bg-teal-100 ${user.username === username ? 'font-bold text-teal-700' : ''}`}
            onClick={() => user.username !== username && handlePrivateChat(user)}
          >
            {user.username}
            {user.isOnline && <span className="ml-2 text-xs text-green-500">●</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
