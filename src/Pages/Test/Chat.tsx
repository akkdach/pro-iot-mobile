import React, { useEffect, useState } from "react";
import socket from "../../Services/socket";

interface Message {
  from: string;
  text: string;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = { from: "Me", text: input };
      socket.emit("message", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    }
  };

  return (
    <div>
      <h2>💬 Chat with Socket.IO</h2>
      <div style={{ border: "1px solid #ccc", height: 200, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.from}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="พิมพ์ข้อความ..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;
