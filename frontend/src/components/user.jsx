import React, { useState, useEffect } from 'react';
import axios from 'axios';

function User({ user }) {
  const [profile, setProfile] = useState({ firstname: '', lastname: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/api/user/profile/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setProfile(response.data));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put('http://localhost:8000/api/user/profile/', profile, {
      headers: { Authorization: `Token ${user.token}` }
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <form onSubmit={handleSubmit} className="max-w-md bg-white p-4 shadow rounded">
        <p>Email: {user.email} (Read-only)</p>
        <p>Username: {user.username} (Read-only)</p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={profile.firstname}
            onChange={(e) => setProfile({ ...profile, firstname: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={profile.lastname}
            onChange={(e) => setProfile({ ...profile, lastname: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Update Profile</button>
      </form>
    </div>
  );
}

export default User;