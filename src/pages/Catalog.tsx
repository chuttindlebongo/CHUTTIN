import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/auth';

export function Catalog() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur de chargement des produits:', error);
        throw error;
      }

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter((product) => {
      const brandName = product.brands?.name?.toLowerCase() || '';
      const productTitle = product.title?.toLowerCase() || '';

      return brandName.includes(query) || productTitle.includes(query);
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onSignOut={handleSignOut} isAdmin={isAdmin} />

      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Catalogue de précommandes
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Découvrez tous les produits disponibles en précommande
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une marque ou un produit..."
              className="w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchQuery
                  ? 'Aucun produit ne correspond à votre recherche'
                  : 'Aucun produit disponible pour le moment'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/${product.brands.slug}/${product.slug}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sans image
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {product.brands.name}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gold transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {(product.price / 100).toFixed(2)} {product.currency}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.delivery_delay_text}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
