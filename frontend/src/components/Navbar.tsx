import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:text-blue-200">
            <span className="text-2xl">🏛</span>
            British Auction RFQ
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-blue-200 transition-colors">
              Auctions
            </Link>
            {user?.role === 'BUYER' && (
              <Link
                to="/rfq/create"
                className="bg-white text-blue-700 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                + Create RFQ
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold">{user.name}</p>
                  <p className="text-xs text-blue-300">{user.role} · {user.companyName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
