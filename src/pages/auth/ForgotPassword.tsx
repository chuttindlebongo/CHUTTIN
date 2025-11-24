import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { authService } from '../../lib/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await authService.resetPassword(email);

      if (error) {
        setError('Une erreur est survenue. Vérifiez votre adresse email.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
              <Logo size="md" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email envoyé</h1>
            <p className="text-gray-600">Vérifiez votre boîte de réception</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <p className="text-gray-700 mb-6">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.
            </p>
            <Link to="/auth/login">
              <Button className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <Zap className="w-7 h-7 text-gold transition-transform group-hover:scale-110" fill="#FFD700" />
            <span className="text-2xl font-semibold tracking-tight">Chu<Zap className="w-5 h-5 inline text-gold" fill="#FFD700" />tin</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">Réinitialisez votre mot de passe</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-red-700 text-sm">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/auth/login" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
