import React, { useState } from "react";
import api from "../utils/api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📤 Sending login data:", form); // DEBUG

    try {
      const res = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      console.log("📥 Login response:", res.data); // DEBUG

      localStorage.setItem("token", res.data.token);

      // If backend does not return user, pass email as fallback
      onLogin(res.data.user || { email: form.email });

    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      alert(
        "Login failed: " +
        (err.response?.data?.message || err.response?.data?.error || err.message)
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}
    >
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
