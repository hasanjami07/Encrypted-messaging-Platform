import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const BACKEND_URL = "http://localhost:8000";

export default function Chat({ user }) {
  const [myChats, setMyChats] = useState([]); // recent chats
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // can be user or group
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize socket and fetch groups & recent chats
  useEffect(() => {
    const s = io(BACKEND_URL);
    setSocket(s);

    async function init() {
      try {
        const chatsRes = await api.get(`/users/my-chats/${user.id}`);
        setMyChats(chatsRes.data.chats);

        const groupsRes = await api.get(`/groups/my-groups/${user.id}`);
        setGroups(groupsRes.data.map((g) => g.group));
      } catch (err) {
        console.error("Init error:", err);
      }
    }

    init();

    // Identify user for direct messages
    s.emit("identify", user.id);

    return () => s.disconnect();
  }, [user.id]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (
        (selectedChat?.type === "user" && msg.senderId === selectedChat.id) ||
        (selectedChat?.type === "group" && msg.groupId === selectedChat.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedChat]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search user by email
  const searchUser = async () => {
    try {
      const res = await api.get(`/users/find?email=${searchEmail}`);
      setFoundUser(res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setFoundUser(null);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!message || !socket || !selectedChat) return;

    const payload = {
      senderId: user.id,
      text: message,
    };

    if (selectedChat.type === "user") payload.receiverId = selectedChat.id;
    if (selectedChat.type === "group") payload.groupId = selectedChat.id;

    socket.emit("sendMessage", payload);
    setMessage("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "300px", borderRight: "1px solid gray", padding: "10px", overflowY: "auto" }}>
        {/* Search user by email */}
        <div>
          <h4>Start New Chat</h4>
          <input
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter user email"
            style={{ width: "100%", marginBottom: "5px", padding: "5px" }}
          />
          <button onClick={searchUser} style={{ width: "100%" }}>Search</button>
          {foundUser && (
            <div
              style={{ cursor: "pointer", padding: "5px", marginTop: "5px", backgroundColor: "#eee" }}
              onClick={() => {
                setSelectedChat({ ...foundUser, type: "user" });
                setMessages([]);
                setFoundUser(null);
                setSearchEmail("");
              }}
            >
              {foundUser.name}
            </div>
          )}
        </div>

        {/* My Chats */}
        <h4 style={{ marginTop: "20px" }}>My Chats</h4>
        {myChats.map((c) => (
          <div
            key={c.userId}
            style={{
              padding: "5px",
              cursor: "pointer",
              backgroundColor: selectedChat?.id === c.userId ? "#ddd" : "transparent",
            }}
            onClick={() => {
              setSelectedChat({ id: c.userId, name: c.name, type: "user" });
              setMessages([]);
            }}
          >
            {c.name} {c.lastMessage && `: ${c.lastMessage}`}
          </div>
        ))}

        {/* Groups */}
        <h4 style={{ marginTop: "20px" }}>Groups</h4>
        {groups.map((g) => (
          <div
            key={g.id}
            style={{
              padding: "5px",
              cursor: "pointer",
              backgroundColor: selectedChat?.id === g.id ? "#ddd" : "transparent",
            }}
            onClick={() => {
              setSelectedChat({ ...g, type: "group" });
              setMessages([]);
            }}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px" }}>
        <h3>{selectedChat ? selectedChat.name : "Select a chat"}</h3>

        <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px", overflowY: "auto", marginBottom: "10px" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <b>{msg.senderName || msg.senderId}:</b> {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {selectedChat && (
          <div style={{ display: "flex" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "5px" }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} style={{ marginLeft: "5px", padding: "5px 10px" }}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
