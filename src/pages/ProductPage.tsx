import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Package, Truck } from 'lucide-react';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Button } from '../components/Button';
import { api } from '../lib/api';

export function ProductPage() {
  const { brandSlug, productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address_line1: '',
    city: '',
    zip: '',
    country: '',
    variant: '',
    quantity: 1
  });

  useEffect(() => {
    loadProduct();
  }, [brandSlug, productSlug]);

  const loadProduct = async () => {
    try {
      if (!brandSlug || !productSlug) return;

      const data = await api.products.getBySlug(brandSlug, productSlug);
      setProduct(data);

      if (data) {
        const count = await api.preorders.countByProductId(data.id);
        setOrderCount(count);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const preorder = await api.preorders.create({
        product_id: product.id,
        ...formData
      });

      navigate(`/order/${preorder.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-[#FFD700] mx-auto mb-4 animate-pulse" fill="#FFD700" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
          <p className="text-gray-600">Ce produit n'existe pas ou n'est plus disponible</p>
        </div>
      </div>
    );
  }

  const spotsLeft = product.max_quantity ? product.max_quantity - orderCount : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <span className="text-xl font-bold text-gray-900">{product.brands.name}</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                <Clock className="w-6 h-6 text-[#FFD700] mx-auto mb-2" />
                <p className="text-sm text-gray-600">Livraison</p>
                <p className="font-semibold text-gray-900 text-sm">{product.delivery_delay_text}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                <Truck className="w-6 h-6 text-[#FFD700] mx-auto mb-2" />
                <p className="text-sm text-gray-600">Précommandes</p>
                <p className="font-semibold text-gray-900 text-sm">{orderCount}</p>
              </div>
              {spotsLeft !== null && (
                <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                  <Package className="w-6 h-6 text-[#FFD700] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Places restantes</p>
                  <p className="font-semibold text-gray-900 text-sm">{spotsLeft}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <p className="text-3xl font-bold text-[#FFD700] mb-6">
              {(product.price / 100).toFixed(2)} {product.currency}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {isSoldOut ? (
              <div className="bg-gray-100 rounded-xl p-8 text-center">
                <p className="text-xl font-bold text-gray-900 mb-2">Complet</p>
                <p className="text-gray-600">Ce produit n'est plus disponible en précommande</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Précommander</h2>

                <div className="space-y-4">
                  <Input
                    label="Nom complet"
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    required
                  />

                  <Input
                    label="Téléphone (optionnel)"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />

                  <Input
                    label="Taille / Variante (optionnel)"
                    type="text"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    placeholder="Ex: M, L, XL"
                  />

                  <Input
                    label="Quantité"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />

                  <div className="border-t-2 border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Adresse de livraison (optionnel)</h3>

                    <div className="space-y-4">
                      <Input
                        label="Adresse"
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Ville"
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                        <Input
                          label="Code postal"
                          type="text"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        />
                      </div>

                      <Input
                        label="Pays"
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Création...' : `Précommander - ${((product.price * formData.quantity) / 100).toFixed(2)} ${product.currency}`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
