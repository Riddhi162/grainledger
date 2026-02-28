import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import TransactionTile from '../components/transactions/TransactionTile';
import api from '../utils/api';

const PrintStyle = () => (
  <style>{`
    @media print {
      body * { visibility: hidden !important; }
      #print-area, #print-area * { visibility: visible !important; }
      #print-area {
        position: fixed !important;
        top: 0; left: 0;
        width: 100%;
        background: white;
        z-index: 99999;
        padding: 24px;
      }
    }
  `}</style>
);

const DailyTransactions = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [isFiltered, setIsFiltered]     = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); setError(''); setIsFiltered(false);
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data.data);
    } catch { setError('Failed to fetch transactions'); }
    setLoading(false);
  };

  const fetchByDate = async () => {
    setLoading(true); setError(''); setIsFiltered(true);
    try {
      const response = await api.get(`/transactions/daily/${selectedDate}`);
      setTransactions(response.data.data);
    } catch { setError('Failed to fetch transactions'); }
    setLoading(false);
  };

  const handleEdit = (txn) => navigate('/transactions/add', { state: { editTransaction: txn } });

  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  

  return (
    <>
      <PrintStyle />
      <div id="print-area" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daily Transactions</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isFiltered
                  ? `Showing ${transactions.length} transaction(s) for ${format(new Date(selectedDate), 'dd MMMM yyyy')}`
                  : `All transactions — ${transactions.length} total`}
              </p>
            </div>
            <div className="flex gap-2 items-start">
              {isFiltered && (
                <button onClick={fetchAll} className="text-sm text-blue-600 hover:underline mt-1">
                  ← Show All
                </button>
              )}
             
            </div>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* ── Filter bar ── */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 mb-5 flex flex-wrap gap-3 items-end print:hidden">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={fetchByDate} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
              View Transactions
            </button>
            <button onClick={fetchAll} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition">
              Reset
            </button>
          </div>

          {/* ── Transaction list ── */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <TransactionTile key={txn._id} txn={txn} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
                <span className="font-bold text-green-700">
                  Grand Total: ₹{transactions
                    .reduce((sum, t) => sum + t.totalAmount, 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-400 py-16">
              <p className="text-sm">No transactions found.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default DailyTransactions;