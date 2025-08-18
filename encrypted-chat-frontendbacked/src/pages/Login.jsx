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
      alert("Login failed: " + err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">Welcome Back</h2>
        
        <input
          className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-green-400"
          placeholder="Email"
          type="email"
          onChange={(e)=>setForm({...form, email: e.target.value})}
        />
        
        <input
          className="w-full p-3 mb-6 border rounded-xl focus:ring-2 focus:ring-green-400"
          placeholder="Password"
          type="password"
          onChange={(e)=>setForm({...form, password: e.target.value})}
        />
        
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
