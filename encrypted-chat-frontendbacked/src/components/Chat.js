import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const BACKEND_URL = "http://localhost:8000"; // fixed backend URL

export default function Chat({ user }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        // Fetch user's groups
        const res = await api.get(`/groups/my-groups/${user.id}`);
        setGroups(res.data.map((g) => g.group));

        // Initialize socket.io
        const s = io(BACKEND_URL);
        setSocket(s);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    }
    init();
  }, [user.id]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.emit("joinGroup", selectedGroup.id);

    const handler = (msg) => {
      if (msg.groupId === selectedGroup.id) setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedGroup]);

  const sendMessage = () => {
    if (!message || !selectedGroup || !socket) return;

    socket.emit("sendMessage", {
      senderId: user.id,
      groupId: selectedGroup.id,
      text: message,
    });

    setMessage("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Groups sidebar */}
      <div style={{ width: "250px", borderRight: "1px solid gray", padding: "10px" }}>
        <h3>Groups</h3>
        {groups.map((g) => (
          <div
            key={g.id}
            style={{
              padding: "5px",
              cursor: "pointer",
              backgroundColor: selectedGroup?.id === g.id ? "#ddd" : "transparent",
            }}
            onClick={() => {
              setSelectedGroup(g);
              setMessages([]);
            }}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px" }}>
        <h3>{selectedGroup ? selectedGroup.name : "Select a group"}</h3>
        <div
          style={{ flex: 1, border: "1px solid #ccc", padding: "10px", overflowY: "auto" }}
        >
          {messages.map((msg, i) => (
            <div key={i}>
              <b>{msg.senderId}:</b> {msg.text}
            </div>
          ))}
        </div>
        {selectedGroup && (
          <div style={{ display: "flex", marginTop: "10px" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1, padding: "5px" }}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} style={{ marginLeft: "5px", padding: "5px 10px" }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
