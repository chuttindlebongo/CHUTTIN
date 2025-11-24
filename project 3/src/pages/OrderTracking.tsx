import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { api } from '../lib/api';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'En attente', icon: Clock },
  { key: 'PAID', label: 'Payé', icon: Check },
  { key: 'IN_PRODUCTION', label: 'En production', icon: Package },
  { key: 'SHIPPED', label: 'Expédié', icon: Truck },
  { key: 'DONE', label: 'Livré', icon: CheckCircle }
];

export function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      if (!orderId) return;
      const data = await api.preorders.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-pulse">
              <Logo size="lg" />
            </div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
          <p className="text-gray-600">Cette commande n'existe pas</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(step => step.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Logo size="md" className="text-xl" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Précommande confirmée</h1>
            <p className="text-gray-600">Merci pour votre confiance {order.customer_name}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Détails de la commande</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Produit</p>
                <p className="font-semibold text-gray-900">{order.products.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Marque</p>
                <p className="font-semibold text-gray-900">{order.products.brands.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantité</p>
                <p className="font-semibold text-gray-900">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Prix total</p>
                <p className="font-semibold text-gray-900">
                  {((order.products.price * order.quantity) / 100).toFixed(2)} {order.products.currency}
                </p>
              </div>
              {order.variant && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Variante</p>
                  <p className="font-semibold text-gray-900">{order.variant}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{order.customer_email}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-6">Statut de votre commande</h2>
            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-[#FFD700] transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              <div className="relative grid grid-cols-5 gap-2">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCompleted
                            ? 'bg-[#FFD700] text-gray-900'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-[#FFD700] ring-opacity-30' : ''}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <p
                        className={`text-xs text-center font-semibold ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-sm text-blue-900">
              <strong>Note :</strong> Vous recevrez un email de confirmation à chaque étape importante.
              Conservez ce lien pour suivre l'évolution de votre commande.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
