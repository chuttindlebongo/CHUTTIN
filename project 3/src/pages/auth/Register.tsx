import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { authService } from '../../lib/auth';
import { api } from '../../lib/api';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await authService.signUp(email, password);

      if (signUpError) {
        setError('Cette adresse email est déjà utilisée');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Erreur lors de la création du compte');
        setLoading(false);
        return;
      }

      const slug = generateSlug(brandName);

      await api.brands.create({
        user_id: data.user.id,
        name: brandName,
        slug: slug
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-600">Lancez vos campagnes de précommande</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Nom de votre marque"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Blacklands"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Déjà un compte ? </span>
            <Link to="/auth/login" className="text-gray-900 font-medium hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
