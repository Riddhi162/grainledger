import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import signatureImg from '../assets/signature.png';

// ─── PDF Generator Helper (returns jsPDF instance) ───────────────────────────
const generatePartyReportPDF = ({ transactions, clientName, clientCity, startDate, endDate, billNo }) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const grandTotal = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const year = startDate
    ? `(${new Date(startDate).getFullYear()}-${String(new Date(endDate).getFullYear()).slice(-2)})`
    : '';

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GIRIRAJ HASMUKHLAL THAKKAR', 105, 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('GRAIN BROKER', 105, 17, { align: 'center' });
    doc.setFontSize(8.5);
    doc.text('A/37. HATHIKHANA, MARKET YARD, VADODARA - 390 006.', 105, 22, { align: 'center' });
    doc.text('PH.NO. OFF : 2422141, 2422064, 2421231  |  MOBILE : 9879035642, 9979878246', 105, 26, { align: 'center' });

    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.line(10, 29, 200, 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('PAN NO : ABRPT 9305-R', 10, 33);
    doc.text(`BILL NO : ${billNo || transactions[0]?.transactionNumber || '-'}`, 198, 33, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`PARTY NAME : ${clientName?.toUpperCase() || ''}`, 10, 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(clientCity?.toUpperCase() || '', 10, 42);

    doc.setFont('helvetica', 'bold');
    doc.text(
      `BILL FROM ${startDate ? format(new Date(startDate), 'dd-MM-yyyy') : '...'} TO ${format(new Date(endDate), 'dd-MM-yyyy')}`,
      10, 47
    );
    doc.setFont('helvetica', 'normal');
    doc.text(year, 198, 47, { align: 'right' });

    doc.text('Bank : SBI (Main Br. Vadodara)  |  A/C NO : 56002008707  |  IFSC : SBIN0000324', 10, 52);
    doc.setLineWidth(0.3);
    doc.line(10, 54, 200, 54);
  };

  // Convert transactions into tabular rows
  const tableBody = transactions.map(txn => {
    const isseller = txn.sellerName?.name?.toLowerCase() === clientName?.toLowerCase();
    return [
      format(new Date(txn.date), 'dd/MM/yyyy'),
      isseller ? (txn.purchaserName?.name || '-') : (txn.sellerName?.name || '-'),
      isseller ? (txn.purchaserCity?.name || '-') : (txn.sellerCity?.name || '-'),
      txn.itemName?.name || '-',
      isseller ? 'BUY' : 'SELL',
      Number(txn.ratePerUnit || 0).toFixed(2),
      `${txn.quantity} ${txn.unit}`,
      Number(txn.totalAmount || 0).toFixed(2)
    ];
  });

  // Track page rows to compute Carry Forward / Brought Forward
  const pageRowIndices = [];
  let currentPageRows = [];

  doc.autoTable({
    startY: 57,
    margin: { top: 57, left: 10, right: 10, bottom: 35 },
    head: [[
      'DATE', 'BUYER/SELLER', 'PLACE', 'NAME OF GOODS',
      'BUY/SELL', 'RATE', 'BAGS/KATTA', 'AMOUNT'
    ]],
    body: tableBody,
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.2 },
    headStyles: {
      font: 'helvetica',
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineColor: [180, 180, 180],
      lineWidth: 0.2
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 32 },
      2: { cellWidth: 22 },
      3: { cellWidth: 34 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 22 },
      7: { halign: 'right', cellWidth: 24 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        currentPageRows.push(data.row.index);
      }
    },
    didDrawPage: () => {
      drawHeader();
      if (currentPageRows.length > 0) {
        pageRowIndices.push([...currentPageRows]);
        currentPageRows = [];
      }
    }
  });

  const totalPages = doc.internal.getNumberOfPages();

  // Draw CF / BF on pages if multi-page
  if (totalPages > 1) {
    let runningTotal = 0;
    pageRowIndices.forEach((rowIndices, pIdx) => {
      const pageNum = pIdx + 1;
      doc.setPage(pageNum);

      const bf = runningTotal;
      const pageTotal = rowIndices.reduce((acc, idx) => acc + (transactions[idx]?.totalAmount || 0), 0);
      runningTotal += pageTotal;
      const cf = runningTotal;

      // Draw Balance Brought Forward at top below header if not page 1
      if (pageNum > 1) {
        doc.setFillColor(253, 248, 226);
        doc.rect(10, 54.5, 190, 4.5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Balance Brought from earlier :', 150, 57.8, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${bf.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 198, 57.8, { align: 'right' });
      }

      // Draw Balance Carry Forward at bottom if not last page
      if (pageNum < totalPages) {
        doc.setFillColor(253, 248, 226);
        doc.rect(10, 258, 190, 5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Balance Carry Forward :', 150, 261.5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${cf.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 198, 261.5, { align: 'right' });
      }
    });
  }

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
  }

  // Last page: Total & Signature Block
  doc.setPage(totalPages);
  const finalY = doc.lastAutoTable.finalY || 200;

  let sigY = finalY + 6;
  // If not enough room on last page for closing + signature, create an annex page
  if (sigY > 242) {
    doc.addPage();
    drawHeader();
    sigY = 65;
  }

  // Final Total line - right aligned with the table column (x=198)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOTAL AMOUNT :', 150, sigY, { align: 'right' });
  doc.text(`₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 198, sigY, { align: 'right' });
  doc.setLineWidth(0.4);
  doc.line(10, sigY + 2, 200, sigY + 2);

  // Signatures block
  const blockY = sigY + 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text("Receiver's Signature", 14, blockY);
  doc.text("____________________", 14, blockY + 14);

  doc.text("Yours faithfully,", 175, blockY, { align: 'center' });
  try {
    doc.addImage(signatureImg, 'PNG', 158, blockY + 2, 34, 12);
  } catch (e) {
    // fallback if image embed fails
  }
  doc.setFont('helvetica', 'bold');
  doc.text("GIRIRAJ HASMUKHLAL THAKKAR", 175, blockY + 17, { align: 'center' });

  return doc;
};

// ─── On-Screen Preview Table Component ───────────────────────────────────────
const ScreenPartyReport = ({ transactions, clientName, clientCity, startDate, endDate, billNo }) => {
  const grandTotal = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const year = startDate
    ? `(${new Date(startDate).getFullYear()}-${String(new Date(endDate).getFullYear()).slice(-2)})`
    : '';

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900">GIRIRAJ HASMUKHLAL THAKKAR</h2>
        <p className="text-xs font-semibold text-gray-700">GRAIN BROKER</p>
        <p className="text-xs text-gray-500">A/37. HATHIKHANA, MARKET YARD, VADODARA - 390 006.</p>
        <p className="text-xs text-gray-500">PH.NO. OFF : 2422141, 2422064, 2421231 | MOBILE : 9879035642, 9979878246</p>
      </div>

      <hr className="border-t-2 border-gray-900 my-3" />

      <div className="flex justify-between text-xs mb-1">
        <span><strong>PAN NO :</strong> ABRPT 9305-R</span>
        <span><strong>BILL NO : {billNo || transactions[0]?.transactionNumber || '-'}</strong></span>
      </div>

      <div className="text-sm font-bold text-gray-900 mb-1">
        PARTY NAME : {clientName?.toUpperCase()}
      </div>
      <div className="text-xs text-gray-600 mb-2">
        {clientCity?.toUpperCase()}
      </div>

      <div className="flex justify-between text-xs mb-2">
        <strong>
          BILL FROM {startDate ? format(new Date(startDate), 'dd-MM-yyyy') : '...'} TO {format(new Date(endDate), 'dd-MM-yyyy')}
        </strong>
        <span>{year}</span>
      </div>

      <div className="text-xs text-gray-600 mb-4">
        <strong>Bank :</strong> SBI (Main Br. Vadodara) &nbsp;&nbsp;
        <strong>A/C NO :</strong> 56002008707 &nbsp;&nbsp;
        <strong>IFSC :</strong> SBIN0000324
      </div>

      <hr className="border-t border-gray-400 mb-4" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-100 font-bold">
            <tr>
              <th className="px-3 py-2 text-left">DATE</th>
              <th className="px-3 py-2 text-left">BUYER / SELLER</th>
              <th className="px-3 py-2 text-left">PLACE</th>
              <th className="px-3 py-2 text-left">NAME OF GOODS</th>
              <th className="px-3 py-2 text-center">BUY / SELL</th>
              <th className="px-3 py-2 text-right">RATE</th>
              <th className="px-3 py-2 text-center">BAGS / KATTA</th>
              <th className="px-3 py-2 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((txn, i) => {
              const isseller = txn.sellerName?.name?.toLowerCase() === clientName?.toLowerCase();
              return (
                <tr key={txn._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2">{format(new Date(txn.date), 'dd/MM/yyyy')}</td>
                  <td className="px-3 py-2 font-medium">{isseller ? txn.purchaserName?.name : txn.sellerName?.name}</td>
                  <td className="px-3 py-2 text-gray-600">{isseller ? txn.purchaserCity?.name : txn.sellerCity?.name}</td>
                  <td className="px-3 py-2">{txn.itemName?.name}</td>
                  <td className="px-3 py-2 text-center font-semibold" style={{ color: isseller ? '#1a56db' : '#15803d' }}>
                    {isseller ? 'BUY' : 'SELL'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {Number(txn.ratePerUnit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-center">{txn.quantity} {txn.unit}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    ₹{Number(txn.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-900">
              <td colSpan="7" className="px-3 py-2 text-right">TOTAL AMOUNT :</td>
              <td className="px-3 py-2 text-right text-sm">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-8 text-xs">
        <div>
          <p className="mb-8">Receiver's Signature</p>
          <p>____________________</p>
        </div>
        <div className="text-center">
          <p className="font-semibold mb-1">Yours faithfully,</p>
          <img src={signatureImg} alt="Digital Signature" className="h-10 mx-auto mb-1 object-contain" />
          <div className="border-t border-gray-900 pt-1 font-semibold">
            GIRIRAJ HASMUKHLAL THAKKAR
          </div>
        </div>
      </div>
    </div>
  );
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

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      // Only regular clients (non-farmers) should appear in Party Reports dropdown
      setClients(res.data.data.filter(c => !c.isFarmer));
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    }
    setLoading(false);
  };

  const selectedClientData = clients.find(c => c._id === selectedClient);

  // Exact Pixel-Perfect A4 Browser Print using generated PDF Blob in hidden iframe
  const handlePrint = () => {
    if (transactions.length === 0) return;
    const doc = generatePartyReportPDF({
      transactions,
      clientName: selectedClientData?.name,
      clientCity: selectedClientData?.city?.name,
      startDate,
      endDate,
      billNo: transactions[0]?.transactionNumber
    });

    const blobUrl = doc.output('bloburl');
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }, 250);
    };
  };

  const handleDownloadPDF = () => {
    if (transactions.length === 0) return;
    const doc = generatePartyReportPDF({
      transactions,
      clientName: selectedClientData?.name,
      clientCity: selectedClientData?.city?.name,
      startDate,
      endDate,
      billNo: transactions[0]?.transactionNumber
    });
    doc.save(`${selectedClientData?.name || 'Party'}_report.pdf`);
  };

  return (
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
            </div>
          </div>
        </div>

        {/* Report Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : transactions.length > 0 ? (
          <div>
            {/* Screen action bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border border-gray-200 rounded-t-xl">
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
                  Print Report
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Save PDF
                </button>
              </div>
            </div>

            {/* Screen Preview */}
            <ScreenPartyReport
              transactions={transactions}
              clientName={selectedClientData?.name}
              clientCity={selectedClientData?.city?.name}
              startDate={startDate}
              endDate={endDate}
              billNo={transactions[0]?.transactionNumber}
            />
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-400 py-16">
            <p className="text-sm">Select a client and date range to view the party report</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartyTransactions;
