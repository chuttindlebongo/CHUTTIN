import { useState, useEffect } from 'react';
import { Search, Building2, Package, Power, PowerOff } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { api } from '../../lib/api';

export function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, searchTerm]);

  const loadBrands = async () => {
    try {
      const data = await api.admin.getAllBrands();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = [...brands];

    if (searchTerm) {
      filtered = filtered.filter(brand =>
        brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBrands(filtered);
  };

  const handleToggleActive = async (brandId: string, currentStatus: boolean) => {
    setTogglingId(brandId);
    try {
      await api.admin.toggleBrandActive(brandId, !currentStatus);
      setBrands(brands.map(b =>
        b.id === brandId ? { ...b, is_active: !currentStatus } : b
      ));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la mise à jour.');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marques</h1>
          <p className="text-gray-600">Gestion des marques et de leurs produits</p>
        </div>

        <Card className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom ou slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total marques</p>
                <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Marques actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {brands.filter(b => b.is_active).length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total produits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {brands.reduce((sum, b) => sum + (b.products?.[0]?.count || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredBrands.length} marque{filteredBrands.length > 1 ? 's' : ''}
            </p>
          </div>

          {filteredBrands.length === 0 ? (
            <p className="text-center py-8 text-gray-600">Aucune marque trouvée</p>
          ) : (
            <div className="space-y-4">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            brand.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">/{brand.slug}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {brand.products?.[0]?.count || 0} produits
                        </span>
                        <span>
                          Inscrit le {new Date(brand.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`/${brand.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Voir la page
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(brand.id, brand.is_active)}
                      disabled={togglingId === brand.id}
                    >
                      {brand.is_active ? (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
