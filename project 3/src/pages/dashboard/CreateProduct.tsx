import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Check, Upload } from 'lucide-react';

export function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    max_quantity: '',
    end_date: '',
    delivery_delay_text: ''
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5 MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setError('Format d\'image non supporté. Utilisez JPG, PNG ou WebP');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }

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

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const slug = generateSlug(formData.title);
      const priceInCents = Math.round(parseFloat(formData.price) * 100);

      const product = await api.products.create({
        brand_id: brand.id,
        title: formData.title,
        slug: slug,
        description: formData.description,
        image_url: imageUrl,
        price: priceInCents,
        currency: formData.currency,
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : null,
        end_date: formData.end_date || null,
        delivery_delay_text: formData.delivery_delay_text,
        is_active: true
      });

      const url = `${window.location.origin}/${brand.slug}/${slug}`;
      setProductUrl(url);

      setTimeout(() => {
        navigate(`/dashboard/products/${product.id}`);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  if (productUrl) {
    return (
      <DashboardLayout>
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit créé</h2>
            <p className="text-gray-600 mb-6">Votre page de précommande est prête</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 mb-2">Lien de votre page :</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={productUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(productUrl);
                    alert('Lien copié');
                  }}
                >
                  Copier
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600">Redirection...</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un produit</h1>
          <p className="text-gray-600">Lancez une nouvelle campagne de précommande</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Nom du produit"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="T-shirt Premium Collection"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre produit..."
              rows={5}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Image du produit
              </label>

              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {imageFile ? imageFile.name : 'Choisir un fichier'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG ou WebP (max 5 MB)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Input
                label="Prix"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="49.99"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                >
                  <option value="EUR">EUR</option>
                  <option value="CHF">CHF</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <Input
              label="Délai de livraison"
              type="text"
              value={formData.delivery_delay_text}
              onChange={(e) => setFormData({ ...formData, delivery_delay_text: e.target.value })}
              placeholder="Livraison sous 3-4 semaines"
              required
            />

            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-gray-900 mb-4">Paramètres avancés</h3>

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Quantité maximum"
                  type="number"
                  min="1"
                  value={formData.max_quantity}
                  onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                  placeholder="100"
                />

                <Input
                  label="Date de fin"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer le produit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/products')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
