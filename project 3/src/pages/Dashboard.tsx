import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { ProductCard } from '../components/ProductCard';
import { stripeProducts } from '../stripe-config';
import { LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Subscription</h2>
              <SubscriptionStatus />
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Available Products</h2>
              <div className="space-y-4">
                {stripeProducts.map((product) => (
                  <ProductCard key={product.priceId} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}