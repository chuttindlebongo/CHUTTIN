# Configuration du Compte Super-Admin

Ce guide vous explique comment configurer votre compte super-admin pour accéder à l'interface d'administration de la plateforme.

## ✅ Ce qui a été configuré

L'infrastructure d'administration est maintenant complète :

1. **Table `admin_users`** créée dans Supabase avec les colonnes :
   - `user_id` - Référence vers auth.users
   - `email` - Email de l'administrateur
   - `role` - 'super_admin' ou 'admin'
   - `is_active` - Statut du compte admin

2. **Politiques RLS configurées** pour permettre aux admins d'accéder à :
   - Toutes les marques (brands)
   - Tous les produits (products)
   - Toutes les commandes (preorders)
   - Modifier le statut des commandes
   - Activer/désactiver des marques

3. **Routes d'administration protégées** :
   - `/admin` - Vue d'ensemble avec statistiques
   - `/admin/orders` - Toutes les commandes de toutes les marques
   - `/admin/brands` - Liste et gestion de toutes les marques
   - `/admin/users` - Liste des utilisateurs de la plateforme

4. **Lien "Admin"** dans la navigation qui s'affiche uniquement pour les super-admins

5. **AuthContext** vérifie automatiquement si un utilisateur est admin via la table `admin_users`

---

## Étape 1 : Créer votre compte utilisateur

Si ce n'est pas déjà fait, créez un compte sur la plateforme :

1. Allez sur `/auth/register`
2. Créez un compte avec votre email personnel
3. Connectez-vous avec ce compte

## Étape 2 : Ajouter votre compte comme Super-Admin

Vous devez maintenant insérer votre email dans la table `admin_users` de Supabase.

### Via le Dashboard Supabase :

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête et copiez-collez le code suivant :

```sql
-- Remplacez 'VOTRE_EMAIL@example.com' par votre vrai email
INSERT INTO admin_users (user_id, email, role, is_active)
SELECT id, email, 'super_admin', true
FROM auth.users
WHERE email = 'VOTRE_EMAIL@example.com';
```

4. **IMPORTANT** : Remplacez `'VOTRE_EMAIL@example.com'` par votre vrai email (celui que vous avez utilisé pour créer votre compte)
5. Cliquez sur **Run** pour exécuter la requête
6. Vous devriez voir un message de succès

### Vérification

Pour vérifier que votre compte admin a bien été créé :

```sql
SELECT * FROM admin_users WHERE email = 'VOTRE_EMAIL@example.com';
```

Vous devriez voir une ligne avec :
- `role` = 'super_admin'
- `is_active` = true

## Étape 3 : Accéder à l'interface d'administration

1. Déconnectez-vous et reconnectez-vous avec votre compte super-admin
2. Vous devriez maintenant voir le lien **"Admin"** dans la barre de navigation
3. Cliquez dessus pour accéder au dashboard d'administration

## Pages d'administration disponibles

Une fois connecté en tant que super-admin, vous avez accès à :

- **`/admin`** - Vue d'ensemble avec statistiques globales
- **`/admin/orders`** - Toutes les commandes de toutes les marques
- **`/admin/brands`** - Liste de toutes les marques inscrites
- **`/admin/users`** - Liste de tous les utilisateurs

## Sécurité

### Protection des routes

- Seul votre compte super-admin peut accéder aux pages `/admin/*`
- Les utilisateurs normaux sont automatiquement redirigés vers la page d'accueil
- Les marques ne peuvent pas accéder à l'interface d'administration

### Permissions RLS

Les politiques de sécurité (RLS) Supabase ont été configurées pour :
- Permettre aux admins de voir toutes les données (brands, products, preorders)
- Permettre aux admins de modifier le statut des commandes
- Permettre aux admins d'activer/désactiver des marques
- Empêcher les utilisateurs normaux d'accéder aux données des autres

## Ajouter un autre administrateur (optionnel)

Si vous souhaitez ajouter un autre administrateur à l'avenir, suivez les mêmes étapes :

```sql
-- Pour un super-admin (tous les droits)
INSERT INTO admin_users (user_id, email, role, is_active)
SELECT id, email, 'super_admin', true
FROM auth.users
WHERE email = 'autre_admin@example.com';

-- Pour un admin simple (lecture seule)
INSERT INTO admin_users (user_id, email, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users
WHERE email = 'admin_readonly@example.com';
```

## Désactiver un administrateur

Pour retirer les droits d'administration à un utilisateur :

```sql
UPDATE admin_users
SET is_active = false
WHERE email = 'admin_a_desactiver@example.com';
```

## Dépannage

### Le lien "Admin" n'apparaît pas

1. Vérifiez que vous êtes bien connecté avec le bon compte
2. Vérifiez que votre email existe dans la table `admin_users`
3. Vérifiez que `is_active = true` pour votre compte
4. Déconnectez-vous complètement et reconnectez-vous

### "Accès refusé" sur les pages admin

1. Vérifiez que votre compte est bien dans `admin_users`
2. Vérifiez les politiques RLS avec cette requête :

```sql
SELECT * FROM admin_users WHERE user_id = auth.uid();
```

Si cette requête ne retourne rien, votre compte n'est pas configuré comme admin.

## Support

Si vous rencontrez des problèmes, vérifiez :
1. Que votre email est correctement orthographié dans la requête SQL
2. Que le compte utilisateur existe bien dans `auth.users`
3. Que vous vous êtes déconnecté puis reconnecté après avoir ajouté le compte admin
