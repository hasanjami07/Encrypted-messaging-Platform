import React, { useState } from "react";
import api from "../utils/api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Login failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
    </form>
  );
}
