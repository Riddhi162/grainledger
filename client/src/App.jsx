import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AddTransaction from './pages/AddTransaction';
import DailyTransactions from './pages/DailyTransactions';
import PartyTransactions from './pages/PartyTransactions';
import ManageItems from './pages/ManageItems';
import ManageClients from './pages/ManageClients';
import ManageCities from './pages/ManageCities';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <Navbar />
      <main style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
};

const ProtectedLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedLayout><AddTransaction /></ProtectedLayout>} />

      {/* ✅ ADD THIS — edit mode navigates here with state */}
      <Route path="/transactions/add" element={<ProtectedLayout><AddTransaction /></ProtectedLayout>} />

      <Route path="/transactions/daily" element={<ProtectedLayout><DailyTransactions /></ProtectedLayout>} />
      <Route path="/transactions/party" element={<ProtectedLayout><PartyTransactions /></ProtectedLayout>} />
      <Route path="/manage/items" element={<ProtectedLayout><ManageItems /></ProtectedLayout>} />
      <Route path="/manage/clients" element={<ProtectedLayout><ManageClients /></ProtectedLayout>} />
      <Route path="/manage/cities" element={<ProtectedLayout><ManageCities /></ProtectedLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;