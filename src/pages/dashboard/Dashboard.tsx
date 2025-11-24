import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';

export function Dashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    recentOrders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      let brand = await api.brands.getByUserId(user.id);

      if (!brand) {
        const defaultBrandName = user.email?.split('@')[0] || 'Ma Marque';
        const slug = defaultBrandName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        brand = await api.brands.create({
          user_id: user.id,
          name: defaultBrandName,
          slug: slug
        });
      }

      const products = await api.products.getByBrandId(brand.id);
      const orders = await api.preorders.getByBrandId(brand.id);

      setStats({
        productsCount: products?.length || 0,
        ordersCount: orders?.length || 0,
        recentOrders: orders?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAID: 'Payé',
      IN_PRODUCTION: 'En production',
      SHIPPED: 'Expédié',
      DONE: 'Livré'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      PAID: 'bg-green-50 text-green-700 border-green-200',
      IN_PRODUCTION: 'bg-blue-50 text-blue-700 border-blue-200',
      SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
      DONE: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre activité</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>L'inscription est 100% gratuite.</strong> Le modèle économique repose uniquement sur une commission prélevée sur chaque vente effectuée via la plateforme.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Produits actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.productsCount}</p>
              </div>
              <div className="w-12 h-12 bg-gold-50 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gold" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Précommandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.ordersCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-2.5">
              <Link to="/dashboard/products/new" className="block">
                <Button className="w-full justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un produit
                </Button>
              </Link>
              <Link to="/dashboard/products" className="block">
                <Button variant="outline" className="w-full justify-center">
                  Voir mes produits
                </Button>
              </Link>
              <Link to="/dashboard/orders" className="block">
                <Button variant="outline" className="w-full justify-center">
                  Gérer les précommandes
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dernières précommandes</h2>
              <Link to="/dashboard/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Voir tout
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Aucune précommande</p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{order.customer_name}</p>
                      <p className="text-xs text-gray-600 truncate">{order.products.title}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)} ml-3 whitespace-nowrap`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
