import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { AuctionListPage } from './pages/AuctionListPage';
import { AuctionDetailPage } from './pages/AuctionDetailPage';
import { CreateRfqPage } from './pages/CreateRfqPage';
import { SubmitBidPage } from './pages/SubmitBidPage';

function PrivateRoute({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: 'BUYER' | 'SUPPLIER';
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute><AuctionListPage /></PrivateRoute>
        } />
        <Route path="/rfq/create" element={
          <PrivateRoute requiredRole="BUYER"><CreateRfqPage /></PrivateRoute>
        } />
        <Route path="/rfq/:id" element={
          <PrivateRoute><AuctionDetailPage /></PrivateRoute>
        } />
        <Route path="/rfq/:id/bid" element={
          <PrivateRoute requiredRole="SUPPLIER"><SubmitBidPage /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px' },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
