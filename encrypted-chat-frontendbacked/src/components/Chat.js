import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const BACKEND_URL = "http://localhost:8000"; // fixed backend URL

export default function Chat({ user }) {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  // Fetch contacts
  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await api.get(`/contacts/${user.id}`);
        setContacts(res.data.contacts);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    }
    fetchContacts();
  }, [user.id]);

  // Fetch groups and initialize socket
  useEffect(() => {
    async function init() {
      try {
        const res = await api.get(`/groups/my-groups/${user.id}`);
        setGroups(res.data.map((g) => g.group));

        const s = io(BACKEND_URL);
        setSocket(s);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    }
    init();
  }, [user.id]);

  // Listen for incoming messages
  useEffect(() => {
  if (!socket) return;

  if (selectedGroup) {
    socket.emit("joinGroup", selectedGroup.id);
  } else if (selectedContact) {
    socket.emit("joinUser", selectedContact.id); // join 1:1 room
  }

  const handler = (msg) => {
    const isDM = selectedContact && msg.senderId === selectedContact.id;
    const isGroupMsg = selectedGroup && msg.groupId === selectedGroup.id;

    if (isDM || isGroupMsg) setMessages((prev) => [...prev, msg]);
  };

  socket.on("newMessage", handler);

  return () => socket.off("newMessage", handler);
  }, [socket, selectedGroup, selectedContact]);


  // Send message
  const sendMessage = () => {
  if (!message || !socket) return;

  const payload = {
    senderId: user.id,
    text: message,
  };

  if (selectedGroup) payload.groupId = selectedGroup.id;
  if (selectedContact) payload.receiverId = selectedContact.id;

  socket.emit("sendMessage", payload);
  setMessage("");
  };


  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar: Contacts + Groups */}
      <div style={{ width: "250px", borderRight: "1px solid gray", padding: "10px", overflowY: "auto" }}>
        <h3>Direct Messages</h3>
        {contacts.map((c) => (
          <div
            key={c.id}
            style={{
              padding: "5px",
              cursor: "pointer",
              backgroundColor: selectedContact?.id === c.id ? "#ddd" : "transparent",
            }}
            onClick={() => {
              setSelectedContact(c);
              setSelectedGroup(null);
              setMessages([]);
            }}
          >
            {c.name}
          </div>
        ))}

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
              setSelectedContact(null);
              setMessages([]);
            }}
          >
            {g.name}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px" }}>
        <h3>
          {selectedGroup
            ? selectedGroup.name
            : selectedContact
            ? selectedContact.name
            : "Select a chat"}
        </h3>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            padding: "10px",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >
          {messages.map((msg, i) => (
            <div key={i}>
              <b>{msg.senderId}:</b> {msg.text}
            </div>
          ))}
        </div>

        {(selectedGroup || selectedContact) && (
          <div style={{ display: "flex" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "5px" }}
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
