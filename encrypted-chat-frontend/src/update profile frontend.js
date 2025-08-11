const API_BASE = "http://localhost:8000/api"; 
const token = () => localStorage.getItem("token"); 

// Selected role variable
let selectedRole = null;

// Role set function
function setRole(role) {
  selectedRole = role;
  document.getElementById("selectedRole").innerText = role;
}

// View Profile
document.getElementById("viewProfileBtn").addEventListener("click", async () => {
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: { Authorization: "Bearer " + token() }
  });
  const data = await res.json();
  document.getElementById("profileData").textContent = JSON.stringify(data, null, 2);

  // Optionally, auto-set role from fetched data if role exists
  if (data.role) {
    setRole(data.role);
  }
});

// Update Profile
document.getElementById("updateProfileBtn").addEventListener("click", async () => {
  if (!selectedRole) {
    alert("Please select a role before updating profile.");
    return;
  }

  const body = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    statusText: document.getElementById("status_text").value,
    profilePic: document.getElementById("profile_pic").value,
    role: selectedRole  // <-- role add kora holo
  };
  
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: "Bearer " + token() 
    },
    body: JSON.stringify(body)
  });
  
  const result = await res.json();
  alert(result.message);
});

// Change Password (button id changed to resetPasswordBtn)
document.getElementById("resetPasswordBtn").addEventListener("click", async () => {
  const body = {
    oldPassword: document.getElementById("oldPassword").value,
    newPassword: document.getElementById("newPassword").value
  };
  
  const res = await fetch(`${API_BASE}/user/change-password`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: "Bearer " + token() 
    },
    body: JSON.stringify(body)
  });
  
  const result = await res.json();
  alert(result.message);
});
