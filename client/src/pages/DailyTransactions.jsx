import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import TransactionTile from '../components/transactions/TransactionTile';
import api from '../utils/api';

const PAGE_SIZE = 10;

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
  const [allTransactions, setAllTransactions] = useState([]); // full dataset — never sliced
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [isFiltered, setIsFiltered]         = useState(false);
  const [currentPage, setCurrentPage]       = useState(1);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); setError(''); setIsFiltered(false); setCurrentPage(1);
    try {
      const response = await api.get('/transactions');
      setAllTransactions(response.data.data);
    } catch { setError('Failed to fetch transactions'); }
    setLoading(false);
  };

  const fetchByDate = async () => {
    setLoading(true); setError(''); setIsFiltered(true); setCurrentPage(1);
    try {
      const response = await api.get(`/transactions/daily/${selectedDate}`);
      setAllTransactions(response.data.data);
    } catch { setError('Failed to fetch transactions'); }
    setLoading(false);
  };

  // Grand total across ALL transactions (not just current page)
  const grandTotal = useMemo(
    () => allTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
    [allTransactions]
  );

  // Pagination derived values
  const totalPages   = Math.ceil(allTransactions.length / PAGE_SIZE);
  const pagedTxns    = allTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleEdit   = (txn) => navigate('/transactions/add', { state: { editTransaction: txn } });
  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    setAllTransactions((prev) => prev.filter((t) => t._id !== id));
    // If deleting last item on a page, go back one page
    const remaining = allTransactions.length - 1;
    const newTotalPages = Math.ceil(remaining / PAGE_SIZE);
    if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
  };

  return (
    <>
      <PrintStyle />
      <div id="print-area" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daily Transactions</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isFiltered
                  ? `Showing ${allTransactions.length} transaction(s) for ${format(new Date(selectedDate), 'dd MMMM yyyy')}`
                  : `All transactions — ${allTransactions.length} total`}
              </p>
            </div>
            {isFiltered && (
              <button onClick={fetchAll} className="text-sm text-blue-600 hover:underline mt-1">
                ← Show All
              </button>
            )}
          </div>

          {/* ── Grand Total banner (always visible, always full dataset) ── */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-5 flex justify-between items-center">
            <span className="text-sm text-green-700 font-medium">
              Grand Total ({allTransactions.length} transaction{allTransactions.length !== 1 ? 's' : ''})
            </span>
            <span className="text-lg font-bold text-green-800">
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
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
          ) : allTransactions.length > 0 ? (
            <>
              <div className="space-y-3">
                {pagedTxns.map((txn) => (
                  <TransactionTile key={txn._id} txn={txn} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>

              {/* ── Pagination controls ── */}
              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages} &nbsp;·&nbsp;
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, allTransactions.length)} of {allTransactions.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                    >«</button>
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                    >Prev</button>

                    {/* Page number pills */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...'
                          ? <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                          : (
                            <button
                              key={item}
                              onClick={() => setCurrentPage(item)}
                              className={`px-3 py-1 text-sm rounded-lg border transition ${
                                item === currentPage
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >{item}</button>
                          )
                      )}

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                    >Next</button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                    >»</button>
                  </div>
                </div>
              )}
            </>
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