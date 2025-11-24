import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, ExternalLink, Trash2, Power, PowerOff } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';

export function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
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

      const productsData = await api.products.getByBrandId(brandData.id);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    setDeletingId(productId);
    try {
      await api.products.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Une erreur est survenue lors de la suppression du produit.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    setTogglingId(productId);
    try {
      await api.products.update(productId, { is_active: !currentStatus });
      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Une erreur est survenue lors de la mise à jour du produit.');
    } finally {
      setTogglingId(null);
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes produits</h1>
            <p className="text-gray-600">Gérez vos campagnes de précommande</p>
          </div>
          <Link to="/dashboard/products/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Créer un produit
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de produit</p>
              <Link to="/dashboard/products/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Créer mon premier produit
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{product.title}</h3>
                        <p className="text-gray-600 text-sm">
                          Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Prix</p>
                        <p className="font-bold text-gray-900">
                          {(product.price / 100).toFixed(2)} {product.currency}
                        </p>
                      </div>
                      {product.max_quantity && (
                        <div>
                          <p className="text-sm text-gray-600">Quantité max</p>
                          <p className="font-bold text-gray-900">{product.max_quantity}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Livraison</p>
                        <p className="font-bold text-gray-900">{product.delivery_delay_text}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link to={`/dashboard/products/${product.id}`}>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir les détails
                        </Button>
                      </Link>
                      {brand && (
                        <a
                          href={`/${brand.slug}/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Page publique
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        disabled={togglingId === product.id}
                      >
                        {product.is_active ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Activer
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
