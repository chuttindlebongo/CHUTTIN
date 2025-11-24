import { useState, useEffect, FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';

export function BrandSettings() {
  const [brand, setBrand] = useState<any>(null);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadBrand();
  }, []);

  const loadBrand = async () => {
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
      setBrandName(brandData.name);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!brand) {
        setError('Marque introuvable');
        return;
      }

      await api.brands.update(brand.id, { name: brandName });
      setSuccess('Nom de la marque mis à jour avec succès');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres de la marque</h1>
          <p className="text-gray-600">Gérez les informations de votre marque</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Nom de la marque"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Blacklands"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Ce nom sera affiché publiquement sur toutes vos pages produits
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de votre marque
              </label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <code className="text-sm text-gray-600">
                  {window.location.origin}/{brand?.slug}
                </code>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                L'URL de votre marque ne peut pas être modifiée
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
