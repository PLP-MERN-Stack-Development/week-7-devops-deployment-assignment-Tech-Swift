import React, { useRef } from 'react';

function MessageInput({
  message,
  setMessage,
  handleSend,
  handleTyping,
  setTyping,
  handleFileChange,
  showEmojiPickerFor,
  setShowEmojiPickerFor,
  onEmojiClick,
  selectedPrivateUser
}) {
  const fileInputRef = useRef(null);

  return (
    <form className="px-6 py-4 bg-gray-100 border-t border-gray-300 flex items-center gap-2" onSubmit={handleSend}>
      <input
        type="text"
        value={message}
        onChange={handleTyping}
        onFocus={() => setTyping(true)}
        onBlur={() => setTyping(false)}
        placeholder={selectedPrivateUser ? `Message to ${selectedPrivateUser.username} (private)...` : 'Type your message...'}
        autoComplete="off"
        required
        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-800"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="ml-2 text-sm text-gray-600"
        title="Attach file"
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        title="Attach file"
      >
        📎
      </button>
      <button
        type="button"
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
        onClick={() => setShowEmojiPickerFor('input')}
        title="Add emoji"
      >
        😊
      </button>
      {showEmojiPickerFor === 'input' && (
        <div className="absolute z-50">
          {/* Emoji Picker should be rendered here, parent should pass onEmojiClick */}
        </div>
      )}
      <button
        type="submit"
        className="bg-teal-600 hover:bg-teal-800 text-white font-semibold px-4 py-2 rounded transition-colors shadow"
      >
        Send
      </button>
    </form>
  );
}

export default MessageInput;
