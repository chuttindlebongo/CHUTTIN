import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../lib/auth';
import { api } from '../lib/api';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(async (user) => {
      console.log('🔍 AuthContext: Current user:', user?.id, user?.email);
      setUser(user);
      if (user) {
        const adminStatus = await api.admin.isAdmin(user.id);
        console.log('🔍 AuthContext: Admin status for', user.email, '=', adminStatus);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    authService.onAuthStateChange(async (user) => {
      console.log('🔍 AuthContext: Auth state changed:', user?.id, user?.email);
      setUser(user);
      if (user) {
        const adminStatus = await api.admin.isAdmin(user.id);
        console.log('🔍 AuthContext: Admin status for', user.email, '=', adminStatus);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
