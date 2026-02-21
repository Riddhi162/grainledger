import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const ManageItems = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch items');
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/items', { name: newItem });
      setNewItem('');
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleEdit = async (id) => {
    try {
      await api.put(`/items/${id}`, { name: editValue });
      setEditingId(null);
      setEditValue('');
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Items</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Item name (e.g., Maize, Rice, Wheat)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Add Item</button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Items List</h2>
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-gray-500">No items found. Add your first item above.</p>
            ) : (
              items.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  {editingId === item._id ? (
                    <>
                      <input
                        type="text"
                        className="input-field flex-1 mr-4"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item._id)} className="btn-primary text-sm">Save</button>
                        <button onClick={() => { setEditingId(null); setEditValue(''); }} className="btn-secondary text-sm">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(item._id); setEditValue(item.name); }} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageItems;
