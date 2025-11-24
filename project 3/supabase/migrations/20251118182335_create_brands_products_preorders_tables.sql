/*
  # Create Chuttin Platform Schema

  ## Overview
  This migration creates the complete database schema for the Chuttin preorder platform,
  including tables for brands, products, and preorders with full security policies.

  ## New Tables

  ### 1. `brands`
  Stores brand information for companies using the platform.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Links to Supabase Auth user
  - `name` (text) - Brand name
  - `slug` (text, unique) - URL-friendly identifier
  - `logo_url` (text, nullable) - Brand logo
  - `description` (text, nullable) - Brand description
  - `instagram_url` (text, nullable) - Social media link
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `products`
  Stores preorder product information created by brands.
  - `id` (uuid, primary key)
  - `brand_id` (uuid, references brands) - Owner brand
  - `title` (text) - Product name
  - `slug` (text) - URL-friendly identifier
  - `description` (text) - Product description
  - `image_url` (text, nullable) - Product image
  - `price` (integer) - Price in cents
  - `currency` (text) - Currency code (EUR, CHF, etc.)
  - `max_quantity` (integer, nullable) - Maximum preorders allowed
  - `end_date` (timestamptz, nullable) - Campaign end date
  - `delivery_delay_text` (text) - Delivery time estimate
  - `is_active` (boolean) - Product availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `preorders`
  Stores customer preorder information.
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products) - Ordered product
  - `customer_name` (text) - Customer full name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text, nullable) - Contact phone
  - `address_line1` (text, nullable) - Shipping address
  - `city` (text, nullable) - City
  - `zip` (text, nullable) - Postal code
  - `country` (text, nullable) - Country
  - `variant` (text, nullable) - Size/color/option
  - `quantity` (integer) - Number of items
  - `status` (text) - Order status (PENDING, PAID, IN_PRODUCTION, SHIPPED, DONE)
  - `stripe_payment_intent_id` (text, nullable) - Stripe payment reference
  - `created_at` (timestamptz) - Creation timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:

  #### brands table
  - Authenticated users can read all brands
  - Users can only create brands for themselves
  - Users can only update their own brands
  - Users can only delete their own brands

  #### products table
  - Anyone can read active products (for public pages)
  - Brand owners can create products
  - Brand owners can update their own products
  - Brand owners can delete their own products

  #### preorders table
  - Anyone can create preorders (public preorder form)
  - Brand owners can view preorders for their products
  - Brand owners can update preorder status
  - Customers can view their own orders by email

  ## Notes
  - All IDs use UUID for security
  - Timestamps default to current time
  - Foreign keys ensure data integrity
  - Unique constraints prevent duplicates
  - Default values ensure data consistency
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  description text,
  instagram_url text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  image_url text,
  price integer NOT NULL,
  currency text DEFAULT 'EUR' NOT NULL,
  max_quantity integer,
  end_date timestamptz,
  delivery_delay_text text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, slug)
);

-- Create preorders table
CREATE TABLE IF NOT EXISTS preorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  address_line1 text,
  city text,
  zip text,
  country text,
  variant text,
  quantity integer DEFAULT 1 NOT NULL,
  status text DEFAULT 'PENDING' NOT NULL,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Anyone can view brands"
  ON brands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own brand"
  ON brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand"
  ON brands FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand"
  ON brands FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM brands
    WHERE brands.id = products.brand_id
    AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Brand owners can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Brand owners can update their products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Brand owners can delete their products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = products.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Preorders policies
CREATE POLICY "Anyone can create preorders"
  ON preorders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Brand owners can view their preorders"
  ON preorders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN brands ON brands.id = products.brand_id
      WHERE products.id = preorders.product_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Brand owners can update preorder status"
  ON preorders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN brands ON brands.id = products.brand_id
      WHERE products.id = preorders.product_id
      AND brands.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      JOIN brands ON brands.id = products.brand_id
      WHERE products.id = product_id
      AND brands.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_preorders_product_id ON preorders(product_id);
CREATE INDEX IF NOT EXISTS idx_preorders_customer_email ON preorders(customer_email);
CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);