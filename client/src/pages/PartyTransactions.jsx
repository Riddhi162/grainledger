import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Print Style ──────────────────────────────────────────────────────────────
const PrintStyle = () => (
  <style>{`
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
      body * { visibility: hidden !important; }
      #party-print-area, #party-print-area * { visibility: visible !important; }
      #party-print-area {
        position: fixed !important;
        top: 0; left: 0;
        width: 100%;
        background: white;
        z-index: 99999;
        padding: 10px;
      }
    }
  `}</style>
);

// ─── Report Layout (used for both screen display & print) ─────────────────────
const PartyReport = ({ transactions, clientName, clientCity, startDate, endDate, billNo }) => {
  const grandTotal = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const year = startDate
    ? `(${new Date(startDate).getFullYear()}-${String(new Date(endDate).getFullYear()).slice(-2)})`
    : '';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#000', background: '#fff', padding: '20px' }}>

      {/* ── Company Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          YOUR COMPANY NAME
        </div>
        <div style={{ fontSize: '12px', fontWeight: '600' }}>GRAIN BROKER</div>
        <div style={{ fontSize: '11px' }}>Your Address, Market Yard,</div>
        <div style={{ fontSize: '11px' }}>VADODARA - 390 006.</div>
        <div style={{ fontSize: '11px' }}>PH.NO. OFF : XXXXXXX, XXXXXXX, XXXXXXX</div>
        <div style={{ fontSize: '11px' }}>MOBILE NO. : XXXXXXXXXX, XXXXXXXXXX</div>
      </div>

      <hr style={{ borderTop: '1.5px solid #000', margin: '6px 0' }} />

      {/* ── PAN + Party Info ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
        <span><strong>PAN NO :</strong> XXXXXXXXXX</span>
        <span><strong>BILL NO : {billNo || transactions[0]?.transactionNumber || '-'}</strong></span>
      </div>

      <div style={{ fontSize: '12px', marginBottom: '2px' }}>
        <strong>PARTY NAME : {clientName?.toUpperCase()}</strong>
      </div>
      <div style={{ fontSize: '11px', marginBottom: '6px' }}>
        {clientCity?.toUpperCase()}
      </div>

      {/* ── Bill Period ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
        <strong>
          BILL FROM {startDate ? format(new Date(startDate), 'dd-MM-yyyy') : '...'} TO {format(new Date(endDate), 'dd-MM-yyyy')}
        </strong>
        <span>{year}</span>
      </div>

      {/* ── Bank Details placeholder ── */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <strong>Bank :</strong> YOUR BANK NAME &nbsp;&nbsp;
        <strong>A/C NO :</strong> XXXXXXXXXXXXXXXX &nbsp;&nbsp;
        <strong>IFSC :</strong> XXXXXXXXXX
      </div>

      <hr style={{ borderTop: '1px solid #000', margin: '4px 0 0 0' }} />

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '9%' }} />   {/* DATE */}
          <col style={{ width: '14%' }} />  {/* BUYER/SELLER */}
          <col style={{ width: '9%' }} />   {/* PLACE */}
          <col style={{ width: '14%' }} />  {/* NAME OF GOODS */}
          <col style={{ width: '7%' }} />   {/* BUY/SELL */}
          <col style={{ width: '8%' }} />   {/* RATE */}
          <col style={{ width: '10%' }} />  {/* BAGS/KATTA */}
          <col style={{ width: '11%' }} />  {/* BROKER RATE */}
          <col style={{ width: '11%' }} />  {/* AMOUNT */}
        </colgroup>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={th}>DATE</th>
            <th style={th}>BUYER / SELLER</th>
            <th style={th}>PLACE</th>
            <th style={th}>NAME OF GOODS</th>
            <th style={th}>BUY / SELL</th>
            <th style={th}>RATE</th>
            <th style={th}>BAGS / KATTA</th>
            <th style={th}>BROKER RATE</th>
            <th style={{ ...th, textAlign: 'right' }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, i) => {
            const isBuyer = txn.buyerName?.name?.toLowerCase() === clientName?.toLowerCase();
            const otherParty = isBuyer ? txn.purchaserName?.name : txn.buyerName?.name;
            const otherCity  = isBuyer ? txn.purchaserCity?.name : txn.buyerCity?.name;
            const buySell    = isBuyer ? 'BUY' : 'SELL';

            return (
              <tr key={txn._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={td}>{format(new Date(txn.date), 'dd/MM/yyyy')}</td>
                <td style={td}>{otherParty}</td>
                <td style={td}>{otherCity}</td>
                <td style={td}>{txn.itemName?.name}</td>
                <td style={{ ...td, textAlign: 'center', fontWeight: '600', color: isBuyer ? '#1a56db' : '#15803d' }}>
                  {buySell}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {Number(txn.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ ...td, textAlign: 'center' }}>{txn.quantity} {txn.unit}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  ₹{txn.dalaliRatePerKatta}/{txn.dalaliKattaWeight}
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: '600' }}>
                  ₹{Number(txn.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #000', background: '#f0f0f0' }}>
            <td colSpan="8" style={{ ...td, textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
              TOTAL AMOUNT :
            </td>
            <td style={{ ...td, textAlign: 'right', fontWeight: 'bold', fontSize: '13px' }}>
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Footer ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '11px' }}>
        <div>
          <p style={{ marginBottom: '20px' }}>Receiver's Signature</p>
          <p>____________________</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p>For YOUR COMPANY NAME</p>
          <div style={{ marginTop: '28px', borderTop: '1px solid #000', paddingTop: '4px' }}>
            (Authorised Signatory)
          </div>
        </div>
      </div>
    </div>
  );
};

// Shared cell styles — allow wrapping so nothing gets clipped
const th = {
  border: '1px solid #ccc',
  padding: '5px 6px',
  fontWeight: '700',
  textAlign: 'left',
  wordBreak: 'break-word',
};
const td = {
  border: '1px solid #ddd',
  padding: '4px 6px',
  wordBreak: 'break-word',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PartyTransactions = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.data);
    } catch {
      setError('Failed to fetch clients');
    }
  };

  const fetchTransactions = async () => {
    if (!selectedClient) { setError('Please select a client'); return; }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate)   params.append('endDate', endDate);
      const res = await api.get(`/transactions/party/${selectedClient}?${params}`);
      setTransactions(res.data.data);
    } catch {
      setError('Failed to fetch transactions');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printDiv = document.getElementById('party-print-area');
    printDiv.innerHTML = printRef.current.innerHTML;
    window.print();
    printDiv.innerHTML = '';
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const client = clients.find(c => c._id === selectedClient);
    const clientName = client?.name || 'Client';
    const clientCity = client?.city?.name || '';
    const grandTotal = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('YOUR COMPANY NAME', 148, 14, { align: 'center' });
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text('GRAIN BROKER', 148, 20, { align: 'center' });
    doc.text('Your Address, Market Yard, VADODARA - 390 006.', 148, 26, { align: 'center' });
    doc.text('PH.NO. OFF : XXXXXXX  |  MOBILE : XXXXXXXXXX', 148, 32, { align: 'center' });

    doc.setDrawColor(0); doc.setLineWidth(0.5);
    doc.line(10, 35, 287, 35);

    doc.setFontSize(10);
    doc.text(`PAN NO : XXXXXXXXXX`, 10, 41);
    doc.setFont('helvetica', 'bold');
    doc.text(`PARTY NAME : ${clientName.toUpperCase()}`, 10, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(clientCity.toUpperCase(), 10, 53);
    doc.text(
      `BILL FROM ${startDate ? format(new Date(startDate), 'dd-MM-yyyy') : '...'} TO ${format(new Date(endDate), 'dd-MM-yyyy')}`,
      10, 59
    );
    doc.text('Bank : YOUR BANK  |  A/C NO : XXXXXXXXXXXXXXXX  |  IFSC : XXXXXXXXXX', 10, 65);

    doc.autoTable({
      startY: 70,
      head: [[
        'DATE', 'BUYER/SELLER', 'PLACE', 'NAME OF GOODS',
        'BUY/SELL', 'RATE', 'BAGS/KATTA', 'BROKER RATE', 'AMOUNT'
      ]],
      body: transactions.map(txn => {
        const isBuyer = txn.buyerName?.name?.toLowerCase() === clientName.toLowerCase();
        return [
          format(new Date(txn.date), 'dd/MM/yyyy'),
          isBuyer ? txn.purchaserName?.name : txn.buyerName?.name,
          isBuyer ? txn.purchaserCity?.name : txn.buyerCity?.name,
          txn.itemName?.name,
          isBuyer ? 'BUY' : 'SELL',
          `₹${Number(txn.ratePerUnit).toFixed(2)}`,
          `${txn.quantity} ${txn.unit}`,
          `₹${txn.dalaliRatePerKatta}/${txn.dalaliKattaWeight}`,
          `₹${Number(txn.totalAmount).toFixed(2)}`
        ];
      }),
      foot: [[{
        content: `TOTAL : ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        colSpan: 9,
        styles: { halign: 'right', fontStyle: 'bold', fontSize: 11 }
      }]],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [60, 60, 60], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 240], textColor: 0 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 22 },
        4: { halign: 'center' },
        5: { halign: 'right' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'right' }
      }
    });

    doc.save(`${clientName}_bill.pdf`);
  };

  const selectedClientData = clients.find(c => c._id === selectedClient);

  return (
    <>
      <PrintStyle />
      <div id="party-print-area" />

      <div className="min-h-screen bg-gray-50">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Party Transaction Reports</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Filter bar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Select Client</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClient}
                  onChange={(e) => { setSelectedClient(e.target.value); setTransactions([]); }}
                >
                  <option value="">Choose a client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchTransactions}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  View Report
                </button>
                {transactions.length > 0 && (
                  <>
                  
                    
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Report */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Screen action bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 print:hidden">
                <span className="text-sm text-gray-500">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Print
                  </button>
                 
                </div>
              </div>

              {/* The actual report */}
              <div ref={printRef}>
                <PartyReport
                  transactions={transactions}
                  clientName={selectedClientData?.name}
                  clientCity={selectedClientData?.city?.name}
                  startDate={startDate}
                  endDate={endDate}
                  billNo={transactions[0]?.transactionNumber}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-400 py-16">
              <p className="text-sm">Select a client and date range to view the party report</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default PartyTransactions;