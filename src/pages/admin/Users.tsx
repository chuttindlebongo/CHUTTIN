import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { supabase } from '../../lib/supabase';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      const { data: brands } = await supabase
        .from('brands')
        .select('user_id, name, created_at');

      const { data: orders } = await supabase
        .from('preorders')
        .select('customer_email');

      const ordersCount = new Map<string, number>();

      if (orders) {
        orders.forEach(order => {
          if (order.customer_email) {
            const count = ordersCount.get(order.customer_email) || 0;
            ordersCount.set(order.customer_email, count + 1);
          }
        });
      }

      const usersWithData = brands?.map(brand => ({
        id: brand.user_id,
        email: 'N/A',
        brandName: brand.name,
        ordersCount: 0,
        isBrand: true,
        created_at: brand.created_at,
        last_sign_in_at: null
      })) || [];

      setUsers(usersWithData);
      setFilteredUsers(usersWithData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Utilisateurs</h1>
          <p className="text-gray-600">Gestion des comptes utilisateurs et marques</p>
        </div>

        <Card className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher par email ou nom de marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Marques inscrites</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isBrand).length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => !u.isBrand).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </p>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-gray-600">Aucun utilisateur trouvé</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Marque</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Commandes</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Inscription</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dernière connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isBrand
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isBrand ? 'Marque' : 'Client'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {user.brandName || '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {user.ordersCount}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
