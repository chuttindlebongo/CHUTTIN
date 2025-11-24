import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Package, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/auth';

export function Landing() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onSignOut={handleSignOut} isAdmin={isAdmin} />

      <section className="max-w-6xl mx-auto px-8 pt-24 md:pt-32 pb-24 md:pb-32 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
          Précommander n'a jamais
          <br />
          été aussi simple.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La solution universelle pour les marques et les clients.
        </p>
        <Link to="/auth/register" className="inline-block">
          <Button size="lg" className="px-8 py-4 text-base rounded-xl shadow-sm max-w-xs w-full">
            Créer un compte
          </Button>
        </Link>
      </section>

      <section className="bg-gray-50 py-32">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Une solution universelle
            </h2>
            <p className="text-lg text-gray-600">
              Que vous soyez une marque ou un client, Chuttin simplifie vos précommandes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Vous êtes une marque ?
                </h3>
              </div>

              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Créez vos campagnes en quelques clics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Collectez les paiements via Stripe</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Suivez vos précommandes en temps réel</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Exportez vos données facilement</span>
                </li>
              </ul>

              <Link to="/auth/register" className="block">
                <Button className="w-full group">
                  Créer une précommande
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Vous êtes un client ?
                </h3>
              </div>

              <ul className="space-y-3 text-gray-600 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Découvrez les produits en avant-première</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Précommandez en quelques secondes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Paiement 100% sécurisé</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div>
                  <span>Suivez l'état de votre commande</span>
                </li>
              </ul>

              <Link to="/catalog" className="block">
                <Button variant="outline" className="w-full group">
                  Accéder aux produits
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-12">
          <div className="grid md:grid-cols-3 gap-8 mb-5">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">Rapidité</div>
              <p className="text-gray-600">Créez une campagne en moins de 5 minutes</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">Sécurité</div>
              <p className="text-gray-600">Paiements sécurisés par Stripe</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">Simplicité</div>
              <p className="text-gray-600">Interface intuitive et épurée</p>
            </div>
          </div>

          <div className="pt-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prêt à lancer votre campagne ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Rejoignez les marques qui utilisent Chuttin
            </p>
            <Link to="/auth/register">
              <Button size="lg">
                Créer mon compte gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="md" className="text-lg" />
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>© 2025 Chuttin</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
