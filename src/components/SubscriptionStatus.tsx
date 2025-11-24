import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export function SubscriptionStatus() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <XCircle className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
            <p className="text-gray-600">You don't have any active subscriptions.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return <CheckCircle className="h-8 w-8 text-green-500 mr-3" />;
      case 'trialing':
        return <Clock className="h-8 w-8 text-blue-500 mr-3" />;
      default:
        return <XCircle className="h-8 w-8 text-red-500 mr-3" />;
    }
  };

  const getStatusText = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return 'Active Subscription';
      case 'trialing':
        return 'Trial Period';
      case 'past_due':
        return 'Payment Past Due';
      case 'canceled':
        return 'Subscription Canceled';
      default:
        return 'Subscription Status';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        {getStatusIcon()}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{getStatusText()}</h3>
          <p className="text-gray-600">démonstration plan</p>
        </div>
      </div>

      {subscription.current_period_end && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Current period ends</p>
              <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
            </div>
            {subscription.payment_method_last4 && (
              <div>
                <p className="text-gray-500">Payment method</p>
                <p className="font-medium">
                  {subscription.payment_method_brand?.toUpperCase()} ****{subscription.payment_method_last4}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}