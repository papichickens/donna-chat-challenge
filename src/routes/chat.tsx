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

    // Add a placeholder Donna message
    const donnaMessageId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: donnaMessageId, text: "...", sender: "donna" },
    ]);

    try {
      const response = await fetch("http://localhost:3001/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const parsed = JSON.parse(line.replace("data: ", ""));
            if (parsed?.content) {
              finalText += parsed.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === donnaMessageId ? { ...msg, text: finalText } : msg
                )
              );
            }
          }
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === donnaMessageId
            ? { ...msg, text: "Error getting response." }
            : msg
        )
      );
    }
  };

  // Auto-scroll to the bottom
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
