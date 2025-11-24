# Chuttin - Plateforme de Précommande

Application complète de gestion de précommandes pour marques modernes, construite avec React, TypeScript, Tailwind CSS et Supabase.

## Fonctionnalités Implémentées

### Pages Publiques
- **Landing page** (`/`) - Page d'accueil avec présentation de la plateforme
- **Page produit** (`/:brandSlug/:productSlug`) - Formulaire de précommande public
- **Suivi de commande** (`/order/:orderId`) - Timeline du statut de la précommande

### Authentification
- **Inscription** (`/auth/register`) - Création de compte marque
- **Connexion** (`/auth/login`) - Authentification via Supabase Auth

### Dashboard Marque
- **Vue d'ensemble** (`/dashboard`) - Statistiques et actions rapides
- **Liste des produits** (`/dashboard/products`) - Gestion des produits
- **Créer un produit** (`/dashboard/products/new`) - Formulaire de création
- **Détails produit** (`/dashboard/products/:id`) - Gestion des précommandes
- **Liste des commandes** (`/dashboard/orders`) - Vue globale avec filtres et export CSV

## Base de Données (Supabase)

### Tables Créées
- **brands** - Informations des marques
- **products** - Produits en précommande
- **preorders** - Précommandes clients

### Sécurité
- Row Level Security (RLS) activé sur toutes les tables
- Politiques restrictives par défaut
- Authentification via Supabase Auth

## Design

### Thème Chuttin
- Couleur principale : **Doré #FFD700**
- Style minimaliste et moderne
- Grande lisibilité avec espaces généreux
- Composants réutilisables (Button, Input, Card)

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Builder pour production
npm run build
```

## Configuration

### Variables d'environnement (.env)
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
VITE_STRIPE_PUBLISHABLE_KEY=votre_cle_stripe_publique
```

## Prochaines Étapes

### Intégration Stripe (À implémenter)

Pour ajouter les paiements Stripe :

1. **Configuration Stripe**
   - Créer un compte sur https://stripe.com
   - Récupérer la clé publique dans le Dashboard
   - Ajouter la clé dans `.env` : `VITE_STRIPE_PUBLISHABLE_KEY`

2. **Créer une Edge Function Supabase**

Créer `supabase/functions/create-payment-intent/index.ts` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'npm:stripe@14.0.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const { amount, currency } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

3. **Déployer la fonction**
```bash
supabase functions deploy create-payment-intent --no-verify-jwt
```

4. **Configurer les secrets Supabase**
```bash
supabase secrets set STRIPE_SECRET_KEY=votre_cle_secrete_stripe
```

5. **Intégrer dans le formulaire de précommande**

Dans `ProductPage.tsx`, ajouter :

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Dans handleSubmit, après création de la précommande
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      amount: product.price * formData.quantity,
      currency: product.currency.toLowerCase(),
    }),
  }
);

const { clientSecret } = await response.json();

// Rediriger vers Stripe Checkout ou utiliser Elements
```

### Emails de Confirmation

Pour les emails, utiliser un service comme Resend ou Brevo :

1. Créer une Edge Function `send-confirmation-email`
2. Appeler cette fonction après création de précommande
3. Templates d'emails pour chaque statut (PAID, SHIPPED, etc.)

## Structure du Projet

```
src/
├── components/        # Composants réutilisables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── ...
├── pages/            # Pages de l'application
│   ├── Landing.tsx
│   ├── ProductPage.tsx
│   ├── OrderTracking.tsx
│   ├── auth/
│   └── dashboard/
├── lib/              # Utilitaires et services
│   ├── supabase.ts
│   ├── auth.ts
│   └── api.ts
└── contexts/         # Contextes React
    └── AuthContext.tsx
```

## Technologies Utilisées

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database + Edge Functions)
- **Paiements**: Stripe (à configurer)
- **Icons**: Lucide React

## Support

Pour toute question ou problème, référez-vous à la documentation officielle :
- [React](https://react.dev)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
