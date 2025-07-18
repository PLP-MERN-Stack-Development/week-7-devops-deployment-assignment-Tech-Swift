import React, { useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

function ChatWindow({
  messages,
  username,
  users,
  currentRoom,
  privateRecipient,
  showEmojiPickerFor,
  setShowEmojiPickerFor,
  handleAddReaction,
  messageEndRef,
  handleResultClick,
  searchResults,
  searchTerm
}) {
  // Scroll to bottom on new message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messageEndRef]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
      {messages && messages.length === 0 && (
        <div className="text-center text-gray-400">No messages yet.</div>
      )}
      {messages && messages.map((msg, i) => (
        <div
          key={msg.id || i}
          id={`msg-${msg.id}`}
          className={`mb-2 flex flex-col ${msg.sender === username ? 'items-end' : 'items-start'}`}
        >
          <div className={`inline-block rounded px-4 py-2 ${msg.sender === username ? 'bg-teal-100 text-teal-900' : 'bg-gray-200 text-gray-800'}`}
          >
            <span className="font-semibold text-xs mr-2">{msg.sender}</span>
            <span>{msg.text}</span>
            {msg.file && (
              <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-500 text-xs">{msg.file.name}</a>
            )}
          </div>
          {/* Reactions */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className="flex gap-1 mt-1 text-xs">
              {msg.reactions.map(r => (
                <span key={r.emoji} className={r.users.includes(username) ? 'font-bold' : ''}>
                  {r.emoji} {r.users.length}
                </span>
              ))}
            </div>
          )}
          {/* Emoji Picker Button */}
          <button onClick={() => setShowEmojiPickerFor(msg.id)} className="ml-2 text-xs text-gray-500 hover:text-teal-600">😊</button>
          {showEmojiPickerFor === msg.id && (
            <div className="absolute z-50">
              <EmojiPicker
                onEmojiClick={(emojiData) => handleAddReaction(msg.id, emojiData.emoji)}
                height={350}
              />
            </div>
          )}
        </div>
      ))}
      <div ref={messageEndRef} />
      {/* Search Results */}
      {searchTerm && searchResults.length > 0 && (
        <div className="mt-2 bg-yellow-100 p-2 rounded">
          <div className="font-semibold text-xs mb-1">Search Results:</div>
          {searchResults.map((msg, idx) => (
            <div key={msg.id || idx} className="cursor-pointer text-blue-600 underline text-xs" onClick={() => handleResultClick(msg.id)}>
              {msg.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
