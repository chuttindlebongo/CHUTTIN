import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';

export function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, orders]);

  const loadOrders = async () => {
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

      const ordersData = await api.preorders.getByBrandId(brand.id);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.preorders.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Email', 'Téléphone', 'Produit', 'Variante', 'Quantité', 'Statut', 'Adresse', 'Ville', 'Code postal', 'Pays'];

    const rows = filteredOrders.map(order => [
      new Date(order.created_at).toLocaleDateString('fr-FR'),
      order.customer_name,
      order.customer_email,
      order.customer_phone || '',
      order.products.title,
      order.variant || '',
      order.quantity,
      order.status,
      order.address_line1 || '',
      order.city || '',
      order.zip || '',
      order.country || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `precommandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      IN_PRODUCTION: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DONE: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Précommandes</h1>
            <p className="text-gray-600">Gérez toutes vos précommandes</p>
          </div>
          <Button onClick={exportToCSV} disabled={filteredOrders.length === 0}>
            <Download className="w-5 h-5 mr-2" />
            Exporter en CSV
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#FFD700] text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
              }`}
            >
              Toutes ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'PENDING'
                  ? 'bg-[#FFD700] text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
              }`}
            >
              En attente ({orders.filter(o => o.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'PAID'
                  ? 'bg-[#FFD700] text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
              }`}
            >
              Payé ({orders.filter(o => o.status === 'PAID').length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PRODUCTION')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'IN_PRODUCTION'
                  ? 'bg-[#FFD700] text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
              }`}
            >
              En production ({orders.filter(o => o.status === 'IN_PRODUCTION').length})
            </button>
            <button
              onClick={() => setStatusFilter('SHIPPED')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'SHIPPED'
                  ? 'bg-[#FFD700] text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
              }`}
            >
              Expédié ({orders.filter(o => o.status === 'SHIPPED').length})
            </button>
          </div>
        </div>

        <Card>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune précommande trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Produit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Variante</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Qté</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{order.customer_name}</td>
                      <td className="py-3 px-4 text-gray-600">{order.customer_email}</td>
                      <td className="py-3 px-4 text-gray-600">{order.products.title}</td>
                      <td className="py-3 px-4 text-gray-600">{order.variant || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{order.quantity}</td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.status)}`}
                        >
                          <option value="PENDING">En attente</option>
                          <option value="PAID">Payé</option>
                          <option value="IN_PRODUCTION">En production</option>
                          <option value="SHIPPED">Expédié</option>
                          <option value="DONE">Livré</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
