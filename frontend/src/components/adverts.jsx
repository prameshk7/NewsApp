import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Advert({ user }) {
  const [adverts, setAdverts] = useState([]);
  const [form, setForm] = useState({ ad_name: '', ad_images: [] });

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/adverts/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setAdverts(response.data));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:8000/api/v1/adverts/', form, {
      headers: { Authorization: `Token ${user.token}` }
    });
    setForm({ ad_name: '', ad_images: [] });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Adverts</h2>
      <form onSubmit={handleSubmit} className="mb-4 bg-white p-4 shadow rounded">
        <input
          type="text"
          value={form.ad_name}
          onChange={(e) => setForm({ ...form, ad_name: e.target.value })}
          placeholder="Ad Name"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          value={form.ad_images}
          onChange={(e) => setForm({ ...form, ad_images: e.target.value.split(',') })}
          placeholder="Image URLs (comma-separated)"
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Add Advert</button>
      </form>
      <ul>
        {adverts.map(advert => (
          <li key={advert.id} className="bg-white p-2 mb-2 shadow rounded">{advert.ad_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Advert;