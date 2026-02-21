import { format } from 'date-fns';

// ─── Receipt Component ────────────────────────────────────────────────────────
// Place this file at: client/src/components/transactions/Receipt.jsx
// Signature image: place at client/src/assets/signature.png

let signatureImg = null;
try {
  signatureImg = new URL('../assets/signature.png', import.meta.url).href;
} catch (_) {
  signatureImg = null;
}

const SignatureBlock = () => {
  if (signatureImg) {
    return (
      <img
        src={signatureImg}
        alt="Authorised Signatory"
        style={{ height: '56px', maxWidth: '160px', objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }
  // Fallback: blank line
  return <div style={{ height: '56px' }} />;
};

const Receipt = ({ txn }) => (
  <div
    style={{
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#222',
      background: '#fff',
      padding: '36px 40px',
      boxSizing: 'border-box',
    }}
  >
    {/* ── Header ── */}
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#c00', marginBottom: '6px' }}>
        <span>|| SHREE GANESHAY NAMAH ||</span>
        <span>|| SHREE JALARAM BAPA ||</span>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#c00', letterSpacing: '1px', marginBottom: '4px' }}>
        Giriraj Hasmukhlal Thakkar
      </div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>GRAIN BROKER</div>
      <div style={{ fontSize: '13px', color: '#1a56db', marginBottom: '2px' }}>
        37, RD Dalal, Hathikhana, Fatehpura, Vadodara
      </div>
      <div style={{ fontSize: '13px', color: '#1a56db' }}>
        Phone: (O) 9979878246 &nbsp;&nbsp; 9879035642
      </div>
    </div>

    <hr style={{ borderColor: '#999', margin: '14px 0' }} />

    {/* ── No. & Date ── */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '15px' }}>
      <span><strong>No.:</strong>&nbsp; {txn.transactionNumber}</span>
      <span><strong>DATE :</strong>&nbsp; {format(new Date(txn.date), 'dd/MM/yy')}</span>
    </div>

    {/* ── Intro text ── */}
    <p style={{ textAlign: 'center', fontSize: '13px', fontStyle: 'italic', marginBottom: '22px', lineHeight: '1.7' }}>
      Today we have prepared contract of Purchase or Sell for you by your advice as below.<br />
      It is hereby binding to both the parties.
    </p>

    {/* ── Parties ── */}
    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <span><strong>Purchaser :</strong>&nbsp; {txn.purchaserName?.name}</span>
      <span><strong>Purchaser City :</strong>&nbsp; {txn.purchaserCity?.name}</span>
    </div>
    <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between' }}>
      <span><strong>Seller &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :</strong>&nbsp; {txn.buyerName?.name}</span>
      <span><strong>Seller City :</strong>&nbsp; {txn.buyerCity?.name}</span>
    </div>

    <hr style={{ borderStyle: 'dashed', borderColor: '#999', margin: '0 0 18px' }} />

    {/* ── Goods ── */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <span><strong>Name of Goods :</strong>&nbsp; {txn.itemName?.name}</span>
      <span><strong>Weight :</strong>&nbsp; {txn.dalaliKattaWeight}</span>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <strong>Bags / Katta :</strong>&nbsp; {txn.quantity} {txn.unit}
      &nbsp;&nbsp;&nbsp;&nbsp;
      <strong>Rate :</strong>&nbsp;
      {Number(txn.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </div>
    <div style={{ marginBottom: '10px' }}>
      <strong>Trade Method :</strong>&nbsp;
      <span style={{ textTransform: 'capitalize' }}>{txn.tradeMethod}</span>
    </div>

    {txn.tradeConditions && (
      <div style={{ marginBottom: '10px' }}>
        <strong>Condition :</strong>&nbsp; {txn.tradeConditions}
      </div>
    )}

    <hr style={{ borderStyle: 'dashed', borderColor: '#999', margin: '18px 0' }} />

    {/* ── Terms ── */}
    <div style={{ fontSize: '12px', color: '#c00', lineHeight: '1.8', marginBottom: '28px' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '6px' }}>TERMS :</p>
      <p>1) In every contract we are only witness.</p>
      <p>2) Subject to Vadodara Jurisdiction only.</p>
      <p>3) Both parties are full responsible for Losses, quality, Bags etc. in every contract.</p>
    </div>

    {/* ── Signature ── */}
    <div style={{ textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#c00' }}>
      <p style={{ marginBottom: '12px' }}>For GIRIRAJ HASMUKHLAL THAKKAR</p>
      <div style={{ display: 'inline-block', textAlign: 'center' }}>
        <SignatureBlock />
        <div style={{ borderTop: '1px solid #999', paddingTop: '6px', fontSize: '12px', color: '#888' }}>
          (Authorised Signatory)
        </div>
      </div>
    </div>
  </div>
);

export default Receipt;