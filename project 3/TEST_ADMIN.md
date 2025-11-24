# Test de l'accès Admin

## Problème résolu

Les problèmes suivants ont été corrigés :
1. ✅ Récursion infinie dans les politiques RLS de `admin_users`
2. ✅ Colonne `is_active` manquante dans la table `brands`
3. ✅ Types TypeScript manquants pour `admin_users`

## Comment tester manuellement

### 1. Vérifier dans la console du navigateur (F12)

Ouvrez la console du navigateur et collez ce code pour tester directement :

```javascript
// Test 1 : Vérifier l'utilisateur connecté
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
console.log('User ID:', user?.id);

// Test 2 : Vérifier le statut admin
const { data: adminData, error: adminError } = await supabase
  .from('admin_users')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .maybeSingle();

console.log('Admin Data:', adminData);
console.log('Admin Error:', adminError);
console.log('Is Admin:', !!adminData);
```

### 2. Ce que vous devriez voir

Si tout fonctionne correctement :
- `User ID` devrait être : `bbec6b97-6371-4c4b-a0bb-1dcd3403c491`
- `Admin Data` devrait contenir : `{ email: 'chuttin.app@gmail.com', role: 'super_admin', is_active: true }`
- `Is Admin` devrait être : `true`
- Le lien **"Admin"** devrait apparaître dans la navigation

### 3. Forcer le rechargement complet

Si le lien "Admin" n'apparaît toujours pas :

1. **Videz le cache complètement** :
   - Chrome/Edge : Ctrl+Shift+Delete → Cocher "Cached images and files" → Clear data
   - Firefox : Ctrl+Shift+Delete → Cocher "Cache" → Clear Now
   - Safari : Cmd+Option+E

2. **Fermez complètement le navigateur** (pas juste l'onglet)

3. **Rouvrez et reconnectez-vous** avec `chuttin.app@gmail.com`

### 4. Vérification dans Supabase Dashboard

Allez dans Supabase Dashboard → SQL Editor et exécutez :

```sql
-- Vérifier que votre compte est bien super-admin
SELECT * FROM admin_users WHERE email = 'chuttin.app@gmail.com';

-- Devrait retourner :
-- role: super_admin
-- is_active: true
```

## Si ça ne marche toujours pas

### Test manuel de la fonction isAdmin

Ajoutez temporairement ce code dans `src/contexts/AuthContext.tsx` après la ligne 26 :

```typescript
console.log('🔍 Checking admin status for user:', user.id);
console.log('🔍 Admin status result:', adminStatus);
```

Puis rechargez la page et regardez la console. Vous devriez voir :
```
🔍 Checking admin status for user: bbec6b97-6371-4c4b-a0bb-1dcd3403c491
🔍 Admin status result: true
```

### Vérifier les politiques RLS

Dans Supabase SQL Editor :

```sql
-- Lister toutes les politiques sur admin_users
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'admin_users';
```

Vous devriez voir :
1. "Users can view own admin record" (SELECT)
2. "Super admins can manage all admin records" (ALL)

## Contact

Si après tout ça ça ne marche toujours pas, fournissez :
1. Les logs de la console du navigateur
2. Le résultat des tests SQL ci-dessus
3. Une capture d'écran de la page
