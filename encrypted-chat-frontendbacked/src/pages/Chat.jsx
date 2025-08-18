import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const socket = io("http://localhost:8000"); // backend Socket.io URL

export default function Chat({ user }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);

  // For group creation
  const [newGroupName, setNewGroupName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Fetch user groups
  useEffect(() => {
    api.get(`/groups/my-groups/${user.id}`)
      .then(res => setGroups(res.data.map(g => g.group)))
      .catch(err => console.error(err));

    // Fetch all users for member selection
    api.get("/user/all") // backend endpoint to list users
      .then(res => setAllUsers(res.data.filter(u => u.id !== user.id)))
      .catch(err => console.error(err));
  }, [user.id]);

  // Listen for messages in selected group
  useEffect(() => {
    if (!selectedGroup) return;

    // Join Socket.io room
    socket.emit("joinGroup", selectedGroup.id);

    // Listen for messages
    socket.on("newMessage", (msg) => {
      if (msg.groupId === selectedGroup.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    // Fetch group members from backend
    api.get(`/groups/${selectedGroup.id}/members`)
      .then(res => setGroupMembers(res.data))
      .catch(err => console.error("Failed to fetch members:", err));

    return () => socket.off("newMessage");
  }, [selectedGroup]);


  // Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedGroup) return;

    socket.emit("sendMessage", {
      senderId: user.id,
      groupId: selectedGroup.id,
      text: message,
    });
    setMessage("");
  };

  // Create a new group
  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    // Include creator automatically in member list
    const memberIds = [user.id, ...selectedMembers.map(m => m.id)];

    try {
      const res = await api.post("/groups/create", {
        name: newGroupName,
        createdBy: user.id,
        memberIds,
      });

      const newGroup = res.data.group;

      // Update groups and auto-select the new group
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setMessages([]); // clear messages for the new group
      setNewGroupName("");
      setSelectedMembers([]);
      alert("Group created successfully!");

      // Join Socket.io room for real-time chat
      socket.emit("joinGroup", newGroup.id);

      // Optionally fetch messages for new group (empty at first)
      const msgRes = await api.get(`/messages/group/${newGroup.id}`);
      setMessages(msgRes.data);

    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <h2 className="font-bold mb-4">Groups</h2>
        {groups.map(g => (
          <div
            key={g.id}
            onClick={() => { setSelectedGroup(g); setMessages([]); }}
            className={`p-2 mb-2 cursor-pointer rounded ${selectedGroup?.id === g.id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {g.name}
          </div>
        ))}
        {selectedGroup && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Members</h3>
            <ul className="max-h-32 overflow-y-auto border rounded p-2">
              {groupMembers.map(member => (
                <li key={member.id} className="mb-1">
                  {member.username || member.name}
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className="mt-auto">
          <h3 className="font-semibold mt-4 mb-2">Create Group</h3>
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            className="w-full mb-2 border rounded p-2 focus:ring-2 focus:ring-blue-400"
          />
          <div className="max-h-32 overflow-y-auto mb-2 border rounded p-2">
            {allUsers.map(u => (
              <div key={u.id}>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u)}
                    onChange={e => {
                      if (e.target.checked) setSelectedMembers(prev => [...prev, u]);
                      else setSelectedMembers(prev => prev.filter(m => m.id !== u.id));
                    }}
                  />
                  <span>{u.username || u.name}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={createGroup}
            className="bg-green-500 text-white w-full rounded p-2 hover:bg-green-600 transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 text-white p-4 text-xl font-bold">
          {selectedGroup ? selectedGroup.name : "Select a group"}
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`my-2 ${msg.senderId === user.id ? "text-right" : "text-left"}`}>
              <span className={`inline-block px-4 py-2 rounded-2xl ${
                msg.senderId === user.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}>
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        {selectedGroup && (
          <div className="p-4 flex border-t bg-white">
            <input
              className="flex-1 border rounded-xl p-3 mr-2 focus:ring-2 focus:ring-blue-400"
              value={message}
              onChange={e=>setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-6 rounded-xl hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
