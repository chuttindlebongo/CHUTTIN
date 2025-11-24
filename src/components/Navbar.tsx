import { Link } from 'react-router-dom';
import { Logo } from './Logo';

interface NavbarProps {
  user?: any;
  onSignOut?: () => void;
  isAdmin?: boolean;
}

export function Navbar({ user, onSignOut, isAdmin }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="group hover:opacity-80 transition-opacity">
            <Logo size="md" className="text-xl md:text-2xl" />
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="px-3 md:px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Admin
                    </Link>
                    <span className="text-gray-300">·</span>
                  </>
                )}
                <Link
                  to="/dashboard"
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-gray-300">·</span>
                <button
                  onClick={onSignOut}
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Connexion
                </Link>
                <span className="text-gray-300">·</span>
                <Link
                  to="/auth/register"
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
