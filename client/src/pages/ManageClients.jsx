import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

// ─── City Combobox ────────────────────────────────────────────────────────────
const CityCombobox = ({ cities, value, onChange, onCityCreated }) => {
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef();

  // Sync input display when value (city _id) changes externally (e.g. edit mode)
  useEffect(() => {
    if (value) {
      const found = cities.find(c => c._id === value);
      if (found) setInputVal(found.name);
    } else {
      setInputVal('');
    }
  }, [value, cities]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(inputVal.toLowerCase())
  );

  const exactMatch = cities.find(
    c => c.name.toLowerCase() === inputVal.trim().toLowerCase()
  );

  const handleSelect = (city) => {
    onChange(city._id);
    setInputVal(city.name);
    setOpen(false);
  };

  const handleCreateCity = async () => {
    const name = inputVal.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await api.post('/cities', { name });
      const newCity = res.data.data;
      onCityCreated(newCity);   // add to parent cities list
      onChange(newCity._id);    // select it
      setInputVal(newCity.name);
      setOpen(false);
    } catch (err) {
      console.error('Failed to create city:', err);
    }
    setCreating(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="input-field w-full"
        placeholder="Search or type new city..."
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          onChange('');   // clear selection while typing
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        required
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {/* Matching cities */}
          {filtered.length > 0 ? (
            filtered.map(city => (
              <div
                key={city._id}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                onMouseDown={() => handleSelect(city)}
              >
                {city.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-400 italic">No cities found</div>
          )}

          {/* "Create new" option — only if typed something not already matching exactly */}
          {inputVal.trim() && !exactMatch && (
            <div
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100 flex items-center gap-2"
              onMouseDown={handleCreateCity}
            >
              {creating ? (
                <span className="text-gray-400">Creating...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create "{inputVal.trim()}"
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({ name: '', city: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
    fetchCities();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch clients');
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data.data);
    } catch (err) {
      console.error('Failed to fetch cities');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city) {
      setError('Please select or create a city');
      return;
    }
    setError('');
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post('/clients', formData);
      }
      setFormData({ name: '', city: '' });
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save client');
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setFormData({ name: client.name, city: client.city._id });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  // Called by CityCombobox when a brand-new city is created inline
  const handleCityCreated = (newCity) => {
    setCities(prev => [...prev, newCity].sort((a, b) => a.name.localeCompare(b.name)));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Clients</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              className="input-field"
              placeholder="Client name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <CityCombobox
              cities={cities}
              value={formData.city}
              onChange={(cityId) => setFormData({ ...formData, city: cityId })}
              onCityCreated={handleCityCreated}
            />
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Add'} Client
            </button>
          </form>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setFormData({ name: '', city: '' }); }}
              className="btn-secondary mt-4"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Clients table — unchanged */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Clients List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No clients found</td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.city?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(client)} className="text-primary-600 hover:text-primary-700 mr-4">Edit</button>
                        <button onClick={() => handleDelete(client._id)} className="text-red-600 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageClients;