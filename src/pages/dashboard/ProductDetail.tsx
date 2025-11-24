import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';

export function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [preorders, setPreorders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      if (!productId) return;

      const user = await authService.getCurrentUser();
      if (!user) return;

      let brandData = await api.brands.getByUserId(user.id);

      if (!brandData) {
        const defaultBrandName = user.email?.split('@')[0] || 'Ma Marque';
        const slug = defaultBrandName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        brandData = await api.brands.create({
          user_id: user.id,
          name: defaultBrandName,
          slug: slug
        });
      }

      setBrand(brandData);

      const productData = await api.products.getById(productId);
      setProduct(productData);

      if (productData) {
        const preordersData = await api.preorders.getByProductId(productId);
        setPreorders(preordersData || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (preorderId: string, newStatus: string) => {
    try {
      await api.preorders.updateStatus(preorderId, newStatus);
      loadProductData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
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

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Produit introuvable</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = preorders.reduce((sum, order) => sum + (product.price * order.quantity), 0);

  return (
    <DashboardLayout>
      <div>
        <Link to="/dashboard/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Retour aux produits</span>
        </Link>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Card>
              <div className="flex gap-6">
                <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sans image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6">{product.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Prix</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(product.price / 100).toFixed(2)} {product.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Livraison</p>
                      <p className="font-semibold text-gray-900">{product.delivery_delay_text}</p>
                    </div>
                    {product.max_quantity && (
                      <div>
                        <p className="text-sm text-gray-600">Quantité max</p>
                        <p className="font-semibold text-gray-900">{product.max_quantity}</p>
                      </div>
                    )}
                  </div>

                  {brand && (
                    <a
                      href={`/${brand.slug}/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir la page publique
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total précommandes</p>
                  <p className="text-2xl font-bold text-gray-900">{preorders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenu total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(totalRevenue / 100).toFixed(2)} {product.currency}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Précommandes ({preorders.length})</h2>
          </div>

          {preorders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune précommande pour ce produit</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Variante</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantité</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {preorders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold text-gray-900">{order.customer_name}</td>
                      <td className="py-3 px-4 text-gray-600">{order.customer_email}</td>
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
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
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
