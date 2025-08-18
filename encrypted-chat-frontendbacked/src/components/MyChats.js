import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function MyChats({ user, onSelectUser }) {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await api.get(`/users/my-chats/${user.id}`);
        setChats(res.data.chats); // expects array of { userId, name, email, lastMessage }
      } catch (err) {
        console.error("MyChats fetch error:", err);
        setError("Failed to load chats");
      }
    }
    fetchChats();
  }, [user.id]);

  return (
    <div style={{ padding: "10px", maxWidth: "400px" }}>
      <h3>My Chats</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {chats.length === 0 && <p>No chats yet</p>}
      {chats.map((c) => (
        <div
          key={c.userId}
          onClick={() => onSelectUser({ id: c.userId, name: c.name, email: c.email })}
          style={{
            padding: "10px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{c.name || c.email}</p>
          <p style={{ margin: 0, color: "#555" }}>{c.lastMessage || "No messages yet"}</p>
        </div>
      ))}
    </div>
  );
}
