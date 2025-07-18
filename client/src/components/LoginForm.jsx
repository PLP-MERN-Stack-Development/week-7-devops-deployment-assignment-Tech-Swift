import React from 'react';

function LoginForm({ inputName, setInputName, handleLogin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-xs"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-2">Welcome to the Chat App</h2>
        <input
          type="text"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
          placeholder="Enter your username"
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
          autoFocus
          required
        />
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-800 text-white font-semibold px-4 py-2 rounded transition-colors"
        >
          Join Chat
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
