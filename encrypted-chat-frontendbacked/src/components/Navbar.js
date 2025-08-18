// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center p-4">
      <div className="flex space-x-4">
        <Link to="/chat" className="hover:underline">Chat</Link>
        <Link to="/profile" className="hover:underline">Profile</Link>
      </div>

      {user ? (
        <div className="flex items-center space-x-4">
          <span>👋 {user.username}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
        </div>
      )}
    </nav>
  );
}
