import React, { useState } from "react";
import api from "../utils/api";

export default function ChatStart({ onSelectUser }) {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setFoundUser(null);

    if (!email) return setError("Please enter an email");

    try {
      const res = await api.get(`/users/by-email?email=${email}`);
      setFoundUser(res.data.user);
    } catch (err) {
      console.error("ChatStart search error:", err);
      setError(err.response?.data?.message || "User not found");
    }
  };

  const handleChat = () => {
    if (foundUser) {
      onSelectUser(foundUser); // notify parent to open DM
      setEmail("");
      setFoundUser(null);
      setError("");
    }
  };

  return (
    <div style={{ padding: "10px", maxWidth: "400px", margin: "auto" }}>
      <h3>Start a New Chat</h3>
      <input
        type="email"
        placeholder="Enter user email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
      />
      <button onClick={handleSearch} style={{ padding: "5px 10px", marginBottom: "10px" }}>
        Search
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {foundUser && (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
          <p><b>{foundUser.name}</b></p>
          <p>{foundUser.email}</p>
          <button onClick={handleChat} style={{ padding: "5px 10px" }}>
            Chat
          </button>
        </div>
      )}
    </div>
  );
}
