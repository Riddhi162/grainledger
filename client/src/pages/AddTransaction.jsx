import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { format } from 'date-fns';
import SearchableSelect from '../components/SearchableSelect';

const AddTransaction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editTransaction = location.state?.editTransaction || null;
  const isEditMode = !!editTransaction;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextTransactionNumber, setNextTransactionNumber] = useState('');

  // Dropdown data
  const [clients, setClients] = useState([]);
  const [cities, setCities] = useState([]);
  const [items, setItems] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    purchaserName: '',
    purchaserCity: '',
    sellerName: '',
    sellerCity: '',
    itemName: '',
    quantity: '',
    unit: 'bag',
    ratePerUnit: '',
    grainTradeType: '',
    dalaliRatePerKatta: '3',
    dalaliKattaWeight: '20kg',
    tradeConditions: '',
    paymentConditions: '',
    tradeMethod: 'phone',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchDropdownData();
    if (!isEditMode) {
      fetchNextTransactionNumber();
    }
  }, []);

  // Pre-fill form once dropdown data + edit data are both available
  useEffect(() => {
    if (isEditMode && clients.length && cities.length && items.length) {
      const t = editTransaction;
      setFormData({
        purchaserName:      t.purchaserName?._id  || t.purchaserName  || '',
        purchaserCity:      t.purchaserCity?._id  || t.purchaserCity  || '',
        sellerName:         t.sellerName?._id     || t.sellerName     || '',
        sellerCity:         t.sellerCity?._id     || t.sellerCity     || '',
        itemName:           t.itemName?._id       || t.itemName       || '',
        quantity:           t.quantity            || '',
        unit:               t.unit               || 'bag',
        ratePerUnit:        t.ratePerUnit         || '',
        grainTradeType:     t.grainTradeType      || '',
        dalaliRatePerKatta: t.dalaliRatePerKatta  || '3',
        dalaliKattaWeight:  t.dalaliKattaWeight   || '20kg',
        tradeConditions:    t.tradeConditions     || '',
        paymentConditions:  t.paymentConditions   || '',
        tradeMethod:        t.tradeMethod         || 'phone',
        date:               t.date
                              ? format(new Date(t.date), 'yyyy-MM-dd')
                              : format(new Date(), 'yyyy-MM-dd')
      });
      setNextTransactionNumber(t.transactionNumber);
    }
  }, [isEditMode, clients, cities, items]);

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, citiesRes, itemsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/cities'),
        api.get('/items')
      ]);
      setClients(clientsRes.data.data);
      setCities(citiesRes.data.data);
      setItems(itemsRes.data.data);
    } catch (err) {
      setError('Failed to load form data');
    }
  };

  const fetchNextTransactionNumber = async () => {
    try {
      const response = await api.get('/transactions/next-number');
      setNextTransactionNumber(response.data.data.transactionNumber);
    } catch (err) {
      console.error('Failed to fetch next transaction number');
    }
  };

  const calculateTotalAmount = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const dalaliRate = parseFloat(formData.dalaliRatePerKatta) || 0;
    return (quantity * dalaliRate).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const totalAmount = calculateTotalAmount();
      const payload = { ...formData, totalAmount: parseFloat(totalAmount) };

      if (isEditMode) {
        await api.put(`/transactions/${editTransaction._id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      navigate('/daily-transactions');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} transaction`);
      setLoading(false);
    }
  };

  // Helper to keep onChange calls concise for SearchableSelect
  const set = (field) => (value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {isEditMode && (
            <button
              onClick={() => navigate('/daily-transactions')}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Transaction' : 'Add New Transaction'}
            </h1>
            {isEditMode && (
              <p className="text-sm text-gray-500 mt-1">
                Editing transaction <span className="font-semibold text-primary-600">{editTransaction.transactionNumber}</span>
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="card">
          {/* Transaction number badge */}
          <div className={`mb-6 p-4 rounded-lg ${isEditMode ? 'bg-amber-50 border border-amber-200' : 'bg-primary-50'}`}>
            <p className="text-sm text-gray-600">Transaction Number</p>
            <p className={`text-2xl font-bold ${isEditMode ? 'text-amber-600' : 'text-primary-600'}`}>
              {nextTransactionNumber}
            </p>
            {isEditMode && (
              <p className="text-xs text-amber-600 mt-1">⚠ You are editing an existing transaction</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Purchaser Details */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Purchaser Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Purchaser Name</label>
                  <SearchableSelect
                    options={clients}
                    value={formData.purchaserName}
                    onChange={set('purchaserName')}
                    placeholder="Search purchaser..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Purchaser City</label>
                  <SearchableSelect
                    options={cities}
                    value={formData.purchaserCity}
                    onChange={set('purchaserCity')}
                    placeholder="Search city..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seller Details */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Seller Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Seller Name</label>
                  <SearchableSelect
                    options={clients}
                    value={formData.sellerName}
                    onChange={set('sellerName')}
                    placeholder="Search seller..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Seller City</label>
                  <SearchableSelect
                    options={cities}
                    value={formData.sellerCity}
                    onChange={set('sellerCity')}
                    placeholder="Search city..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Item Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Item Name</label>
                  <select
                    className="input-field"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="input-field flex-1"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required min="0" step="1"
                    />
                    <select
                      className="input-field w-32"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="bag">Bag</option>
                      <option value="katta">Katta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Rate per Unit</label>
                  <input
                    type="number" className="input-field"
                    placeholder="Enter rate"
                    value={formData.ratePerUnit}
                    onChange={(e) => setFormData({ ...formData, ratePerUnit: e.target.value })}
                    required min="0" step="1"
                  />
                </div>
              </div>
            </div>

            {/* Dalali Details */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Dalali Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Dalali Rate per Katta</label>
                  <input
                    type="number" className="input-field"
                    placeholder="Enter dalali rate"
                    value={formData.dalaliRatePerKatta}
                    onChange={(e) => setFormData({ ...formData, dalaliRatePerKatta: e.target.value })}
                    required min="0" step="1"
                  />
                </div>
                <div>
                  <label className="label">Katta Weight</label>
                  <select
                    className="input-field"
                    value={formData.dalaliKattaWeight}
                    onChange={(e) => setFormData({ ...formData, dalaliKattaWeight: e.target.value })}
                  >
                    <option value="20kg">20 kg</option>
                    <option value="20kg">30 kg</option>
                    <option value="50kg">50 kg</option>
                    <option value="70kg">70 kg</option>
                    <option value="100kg">100 kg</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Total Amount (Auto-calculated)</label>
                  <div className="input-field bg-gray-100 font-bold text-lg">₹ {calculateTotalAmount()}</div>
                </div>
              </div>
            </div>

            {/* Trade Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Trade Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Trade Conditions & Payment Conditions side by side */}
                <div>
                  <label className="label">Trade Conditions</label>
                  <textarea
                    className="input-field" rows="3"
                    placeholder="Enter trade conditions"
                    value={formData.tradeConditions}
                    onChange={(e) => setFormData({ ...formData, tradeConditions: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Payment Conditions</label>
                  <textarea
                    className="input-field" rows="3"
                    placeholder="Enter payment conditions"
                    value={formData.paymentConditions}
                    onChange={(e) => setFormData({ ...formData, paymentConditions: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Trade Method</label>
                  <div className="flex gap-4 mt-2">
                    {['phone', 'in-person', 'paper'].map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio" name="tradeMethod" value={method}
                          checked={formData.tradeMethod === method}
                          onChange={(e) => setFormData({ ...formData, tradeMethod: e.target.value })}
                          className="mr-2"
                        />
                        <span className="capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date" className="input-field"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 disabled:opacity-50 ${isEditMode ? 'btn-warning' : 'btn-primary'}`}
              >
                {loading
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? '✓ Update Transaction' : 'Create Transaction')}
              </button>
              <button
                type="button"
                onClick={() => navigate(isEditMode ? '/daily-transactions' : '/')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;