import { useState, useRef } from 'react';
import { format } from 'date-fns';
import Receipt from './Receipt';

const TransactionTile = ({ txn, onEdit, onDelete }) => {
  const [expanded, setExpanded]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const printRef = useRef();

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = (e) => {
    e.stopPropagation();
    const printDiv = document.getElementById('print-area');
    printDiv.innerHTML = printRef.current.innerHTML;
    window.print();
    printDiv.innerHTML = '';
  };

  // ── Save as PDF ────────────────────────────────────────────────────────────
  const handleSavePDF = async (e) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf()
        .set({
          margin: 0,
          filename: `Receipt-${txn.transactionNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(printRef.current)
        .save()
        .finally(() => setIsSaving(false));
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (e) => { e.stopPropagation(); onEdit(txn); };

  // ── Delete flow ────────────────────────────────────────────────────────────
  const handleDeleteClick  = (e) => { e.stopPropagation(); setConfirmDelete(true); };
  const handleDeleteCancel = (e) => { e.stopPropagation(); setConfirmDelete(false); };
  const handleDeleteConfirm = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try { await onDelete(txn._id); }
    finally { setIsDeleting(false); setConfirmDelete(false); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* ── Collapsed tile header ── */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
          {txn.transactionNumber?.toString().slice(-3)}
        </div>
        <div className="flex-shrink-0 w-28">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{txn.transactionNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{format(new Date(txn.date), 'dd MMM yyyy')}</p>
        </div>
        <div className="hidden sm:block flex-1 min-w-0">
          <p className="text-xs text-gray-400">Purchaser</p>
          <p className="text-sm font-medium text-gray-700 truncate">{txn.purchaserName?.name}</p>
        </div>
        <div className="hidden sm:block flex-1 min-w-0">
          <p className="text-xs text-gray-400">Seller</p>
          <p className="text-sm font-medium text-gray-700 truncate">{txn.buyerName?.name}</p>
        </div>
        <div className="hidden md:block flex-1 min-w-0">
          <p className="text-xs text-gray-400">Item</p>
          <p className="text-sm font-medium text-gray-700 truncate">{txn.itemName?.name}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-sm font-bold text-green-600">
            ₹{Number(txn.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex-shrink-0 text-gray-400 transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* ── Expanded area ── */}
      {expanded && (
        <div className="border-t border-gray-100">

          {/* ── Action buttons ── */}
          <div className="flex gap-3 px-5 py-3 bg-gray-50 print:hidden flex-wrap items-center">

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Print
            </button>

            {/* Save PDF */}
            <button
              onClick={handleSavePDF}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {isSaving ? 'Saving...' : 'Save PDF'}
            </button>

            {/* Edit */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>

            {/* Delete */}
            {!confirmDelete ? (
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-black text-sm font-medium rounded-lg transition sm:ml-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:ml-auto bg-red-50 border border-red-200 rounded-lg px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm text-red-700 font-medium whitespace-nowrap">Delete {txn.transactionNumber}?</span>
                <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition disabled:opacity-60">
                  {isDeleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button onClick={handleDeleteCancel} disabled={isDeleting} className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-300 transition disabled:opacity-50">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Receipt preview */}
          <div ref={printRef} className="border-t border-gray-100">
            <Receipt txn={txn} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTile;