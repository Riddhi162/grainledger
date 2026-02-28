import { format } from 'date-fns';
import signatureImg from '../../assets/signature.png';


const SignatureBlock = () => (
  <img
    src={signatureImg}
    alt="Authorised Signatory"
    style={{ height: '60px', maxWidth: '200px', objectFit: 'contain', display: 'block', margin: '0 auto 0px' }}
  />
);

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
        A- 37, RD Dalal, Hathikhana, Fatehpura, Vadodara.
      </div>
      <div style={{ fontSize: '13px', color: '#1a56db' }}>
        Mobile No: 9979878246 &nbsp;&nbsp; 9879035642
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
    <div style={{ marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', flex: 1 }}>
          <span style={{ minWidth: '90px', padding: '2px' }}><strong>Purchaser</strong></span>
          <span><strong>:</strong>&nbsp; {txn.purchaserName?.name}</span>
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ minWidth: '130px', textAlign: 'right' }}><strong>Purchaser City</strong></span>
          <span style={{ minWidth: '100px' }}><strong>&nbsp;:</strong>&nbsp; {txn.purchaserCity?.name}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: 1 }}>
          <span style={{ minWidth: '90px' }}><strong>Seller</strong></span>
          <span><strong>:</strong>&nbsp; {txn.buyerName?.name}</span>
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ minWidth: '130px', textAlign: 'right' }}><strong>Seller City</strong></span>
          <span style={{ minWidth: '100px' }}><strong>&nbsp;:</strong>&nbsp; {txn.buyerCity?.name}</span>
        </div>
      </div>
    </div>

    <hr style={{ borderStyle: 'dashed', borderColor: '#999', margin: '0 0 18px' }} />

    {/* ── Goods ── */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <span style={{ minWidth: '130px' }}><strong>Name of Goods</strong></span>
        <span><strong>:</strong>&nbsp; {txn.itemName?.name}</span>
      </div>
      <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ minWidth: '100px', textAlign: 'right' }}><strong>Weight</strong></span>
        <span style={{ minWidth: '100px' }}><strong>&nbsp;:</strong>&nbsp; {txn.dalaliKattaWeight}</span>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <span style={{ minWidth: '130px' }}><strong>Bags / Katta</strong></span>
        <span><strong>:</strong>&nbsp; {txn.quantity} {txn.unit}</span>
      </div>
      <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ minWidth: '100px', textAlign: 'right' }}><strong>Rate</strong></span>
        <span style={{ minWidth: '100px' }}><strong>&nbsp;:</strong>&nbsp; {Number(txn.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
    <div style={{ marginBottom: '10px', display: 'flex' }}>
      <span style={{ minWidth: '130px' }}><strong>Trade Method</strong></span>
      <span><strong>:</strong>&nbsp; <span style={{ textTransform: 'capitalize' }}>{txn.tradeMethod}</span></span>
    </div>

    {txn.tradeConditions && (
      <div style={{ marginBottom: '10px', display: 'flex' }}>
        <span style={{ minWidth: '130px' }}><strong>Condition</strong></span>
        <span><strong>:</strong>&nbsp; {txn.tradeConditions}</span>
      </div>
    )}

    <hr style={{ borderStyle: 'dashed', borderColor: '#999', margin: '18px 0' }} />

    {/* ── Terms ── */}
    <div style={{ fontSize: '14px', color: '#c00', lineHeight: '2', marginBottom: '50px' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>TERMS :</p>
      <p>1) In every contract we are only witness.</p>
      <p>2) Subject to Vadodara Jurisdiction only.</p>
      <p>3) Both parties are full responsible for Losses, quality, Bags etc. in every contract.</p>
    </div>

    {/* ── Signature ── */}
    <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#c00' }}>
     
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