import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const ManageCities = () => {
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({ name: '', stdCode: '', postalCode: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cities');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/cities/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post('/cities', formData);
      }
      setFormData({ name: '', stdCode: '', postalCode: '' });
      fetchCities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save city');
    }
  };

  const handleEdit = (city) => {
    setEditingId(city._id);
    setFormData({ name: city.name, stdCode: city.stdCode || '', postalCode: city.postalCode || '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      try {
        await api.delete(`/cities/${id}`);
        fetchCities();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete city');
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Cities</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit City' : 'Add New City'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              className="input-field"
              placeholder="City name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="text"
              className="input-field"
              placeholder="STD Code"
              value={formData.stdCode}
              onChange={(e) => setFormData({ ...formData, stdCode: e.target.value })}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'} City</button>
          </form>
          {editingId && (
            <button onClick={() => { setEditingId(null); setFormData({ name: '', stdCode: '', postalCode: '' }); }} className="btn-secondary mt-4">Cancel Edit</button>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Cities List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STD Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Postal Code</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cities.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No cities found</td></tr>
                ) : (
                  cities.map((city) => (
                    <tr key={city._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{city.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{city.stdCode || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{city.postalCode || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(city)} className="text-primary-600 hover:text-primary-700 mr-4">Edit</button>
                        <button onClick={() => handleDelete(city._id)} className="text-red-600 hover:text-red-700">Delete</button>
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

export default ManageCities;
