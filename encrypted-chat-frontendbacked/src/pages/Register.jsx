import React, { useState } from "react";
import api from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("Registered! Now login.");
    } catch (err) {
      alert("Error: " + err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Create Account</h2>
        
        <input
          className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-blue-400"
          placeholder="Username"
          onChange={(e)=>setForm({...form, username: e.target.value})}
        />
        
        <input
          className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          type="email"
          onChange={(e)=>setForm({...form, email: e.target.value})}
        />
        
        <input
          className="w-full p-3 mb-6 border rounded-xl focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          type="password"
          onChange={(e)=>setForm({...form, password: e.target.value})}
        />
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
