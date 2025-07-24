// src/routes/chat.tsx
import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import { streamAIResponse } from '../services/aiService';

interface Message {
  id: number;
  text: string;
  sender: "user" | "donna";
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: userInput,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    const donnaMessageId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: donnaMessageId, text: "...", sender: "donna" },
    ]);

    await streamAIResponse(userInput, (updatedText) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === donnaMessageId ? { ...msg, text: updatedText } : msg
        )
      );
    });
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text || "..."}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask Donna something..."
          className="chat-input"
        />
        <button type="submit" className="chat-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
