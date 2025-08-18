import React from "react";

function Profile({ user }) {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <h2 className="text-2xl font-bold mb-4">👤 Profile</h2>
      {user ? (
        <div className="bg-gray-100 p-6 rounded shadow-md w-80 text-center">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email || "N/A"}</p>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
}

export default Profile;
