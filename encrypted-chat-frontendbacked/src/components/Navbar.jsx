import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">🔒 Encrypted Chat</Link>
      </div>
      <div className="space-x-4">
        {!user ? (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        ) : (
          <>
            <Link to="/chat" className="hover:underline">Chat</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
