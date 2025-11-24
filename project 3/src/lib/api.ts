import { supabase } from './supabase';
import type { Database } from './database.types';

type Brand = Database['public']['Tables']['brands']['Row'];
type AdminUser = Database['public']['Tables']['admin_users']['Row'];
type BrandInsert = Database['public']['Tables']['brands']['Insert'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type Preorder = Database['public']['Tables']['preorders']['Row'];
type PreorderInsert = Database['public']['Tables']['preorders']['Insert'];

export const api = {
  admin: {
    async isAdmin(userId: string): Promise<boolean> {
      console.log('🔍 API: Checking admin status for userId:', userId);
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      console.log('🔍 API: Admin query result:', { data, error });
      if (error) {
        console.error('🔍 API: Error checking admin status:', error);
        return false;
      }
      const result = !!data;
      console.log('🔍 API: Final isAdmin result:', result);
      return result;
    },

    async getAllOrders() {
      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          products (
            title,
            price,
            currency,
            brand_id,
            brands (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async getAllBrands() {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          products (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async getStats() {
      const [ordersResult, brandsResult, productsResult] = await Promise.all([
        supabase.from('preorders').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalOrders: ordersResult.count || 0,
        totalBrands: brandsResult.count || 0,
        totalProducts: productsResult.count || 0
      };
    },

    async toggleBrandActive(brandId: string, isActive: boolean) {
      const { data, error } = await supabase
        .from('brands')
        .update({ is_active: isActive })
        .eq('id', brandId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },
  brands: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async create(brand: BrandInsert) {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Brand>) {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getBySlug(slug: string) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  },

  products: {
    async create(product: ProductInsert) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getByBrandId(brandId: string) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async getBySlug(brandSlug: string, productSlug: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (
            name,
            slug,
            logo_url
          )
        `)
        .eq('slug', productSlug)
        .eq('brands.slug', brandSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Product>) {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  preorders: {
    async create(preorder: PreorderInsert) {
      const { data, error } = await supabase
        .from('preorders')
        .insert(preorder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          products (
            title,
            price,
            currency,
            image_url,
            brands (
              name
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async getByProductId(productId: string) {
      const { data, error } = await supabase
        .from('preorders')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async getByBrandId(brandId: string) {
      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          products!inner (
            title,
            brand_id
          )
        `)
        .eq('products.brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async updateStatus(id: string, status: string) {
      const { data, error } = await supabase
        .from('preorders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async countByProductId(productId: string) {
      const { count, error } = await supabase
        .from('preorders')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) throw error;
      return count || 0;
    }
  }
};
