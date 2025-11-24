import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { authService } from '../lib/auth';
import { Logo } from './Logo';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="group hover:opacity-80 transition-opacity">
              <Logo size="md" className="text-xl" />
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-100 p-3 space-y-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-gold-50 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Tableau de bord</span>
              </Link>
              <Link
                to="/dashboard/products"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/products')
                    ? 'bg-gold-50 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="text-sm">Produits</span>
              </Link>
              <Link
                to="/dashboard/orders"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/orders')
                    ? 'bg-gold-50 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm">Précommandes</span>
              </Link>
              <Link
                to="/dashboard/settings"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/settings')
                    ? 'bg-gold-50 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Paramètres</span>
              </Link>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
