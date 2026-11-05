-- ==============================================================================
-- Migration: Secure Role-Based Access Control (RBAC) & Row Level Security (RLS)
-- Project: Eswar, Bala & Co - Smart Café Salem
-- ==============================================================================

-- 1. Helper Function: Check if the authenticated user has the 'admin' role
-- SECURITY DEFINER allows querying public.profiles safely without recursive RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execution to all authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ==============================================================================
-- 2. PROFILES TABLE RLS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile; Admins can view all profiles
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile details (full_name), but CANNOT alter their own role
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  public.is_admin() OR (
    auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- ==============================================================================
-- 3. MENU_ITEMS TABLE RLS (Requirement 6: Customers cannot modify menu prices)
-- ==============================================================================
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Public read access: Anyone (guests & customers) can view menu items
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items"
ON public.menu_items FOR SELECT
USING (true);

-- Admins ONLY can insert menu items
DROP POLICY IF EXISTS "Admins can insert menu items" ON public.menu_items;
CREATE POLICY "Admins can insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (public.is_admin());

-- Admins ONLY can update menu items (prices, names, availability)
-- Customers attempting to modify prices will be rejected with RLS violation
DROP POLICY IF EXISTS "Admins can update menu items" ON public.menu_items;
CREATE POLICY "Admins can update menu items"
ON public.menu_items FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins ONLY can delete menu items
DROP POLICY IF EXISTS "Admins can delete menu items" ON public.menu_items;
CREATE POLICY "Admins can delete menu items"
ON public.menu_items FOR DELETE
USING (public.is_admin());

-- ==============================================================================
-- 4. ORDERS TABLE RLS (Requirements 4 & 5: Own orders only; No status updates)
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers must only see their own orders; Admins can view all orders
DROP POLICY IF EXISTS "Orders select policy" ON public.orders;
CREATE POLICY "Orders select policy"
ON public.orders FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

-- Authenticated customers can insert their own orders; Admins can insert
DROP POLICY IF EXISTS "Orders insert policy" ON public.orders;
CREATE POLICY "Orders insert policy"
ON public.orders FOR INSERT
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

-- Admins ONLY can update orders (e.g. order status, payment status)
-- Customers CANNOT update their order status
DROP POLICY IF EXISTS "Orders update policy" ON public.orders;
CREATE POLICY "Orders update policy"
ON public.orders FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins ONLY can delete orders
DROP POLICY IF EXISTS "Orders delete policy" ON public.orders;
CREATE POLICY "Orders delete policy"
ON public.orders FOR DELETE
USING (public.is_admin());

-- ==============================================================================
-- 5. ORDER_ITEMS TABLE RLS
-- ==============================================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view items belonging to their orders; Admins view all
DROP POLICY IF EXISTS "Order items select policy" ON public.order_items;
CREATE POLICY "Order items select policy"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid() OR public.is_admin())
  )
);

-- Customers can insert items for their own orders; Admins can insert
DROP POLICY IF EXISTS "Order items insert policy" ON public.order_items;
CREATE POLICY "Order items insert policy"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid() OR public.is_admin())
  )
);

-- Admins ONLY can update order items
DROP POLICY IF EXISTS "Order items update policy" ON public.order_items;
CREATE POLICY "Order items update policy"
ON public.order_items FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins ONLY can delete order items
DROP POLICY IF EXISTS "Order items delete policy" ON public.order_items;
CREATE POLICY "Order items delete policy"
ON public.order_items FOR DELETE
USING (public.is_admin());

-- ==============================================================================
-- 6. SERVICE ROLE BYPASS POLICIES (For Edge Functions like create-order)
-- ==============================================================================
DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on menu_items" ON public.menu_items;
CREATE POLICY "Service role full access on menu_items" ON public.menu_items FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
CREATE POLICY "Service role full access on orders" ON public.orders FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on order_items" ON public.order_items;
CREATE POLICY "Service role full access on order_items" ON public.order_items FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
