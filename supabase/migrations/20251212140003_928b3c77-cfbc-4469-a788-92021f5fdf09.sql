-- ============================================================================
-- SECURITY FIX: Replace overly permissive RLS policies with role-based access
-- ============================================================================

-- ============================================================================
-- PATIENTS TABLE - Restrict access to authorized roles only
-- ============================================================================

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can create patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can delete patients" ON patients;

-- Create role-based SELECT policy
CREATE POLICY "Role-based patient view access" ON patients
FOR SELECT TO authenticated
USING (
  -- User can see their own patient record (if linked via user_id)
  auth.uid() = user_id OR
  -- Billing staff and admins can view all patients
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based INSERT policy
CREATE POLICY "Role-based patient create access" ON patients
FOR INSERT TO authenticated
WITH CHECK (
  -- Only billing staff and admins can create patients
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based UPDATE policy
CREATE POLICY "Role-based patient update access" ON patients
FOR UPDATE TO authenticated
USING (
  -- User can update their own patient record
  auth.uid() = user_id OR
  -- Billing staff and admins can update patients
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based DELETE policy (admin only)
CREATE POLICY "Role-based patient delete access" ON patients
FOR DELETE TO authenticated
USING (
  -- Only admins can delete patients
  has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- PROVIDERS TABLE - Restrict access to authorized roles only
-- ============================================================================

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can create providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can update providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can delete providers" ON providers;

-- Create role-based SELECT policy
CREATE POLICY "Role-based provider view access" ON providers
FOR SELECT TO authenticated
USING (
  -- User can see their own provider record
  auth.uid() = user_id OR
  -- Billing staff and admins can view all providers
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based INSERT policy
CREATE POLICY "Role-based provider create access" ON providers
FOR INSERT TO authenticated
WITH CHECK (
  -- Only admins can create providers
  has_role(auth.uid(), 'admin')
);

-- Create role-based UPDATE policy
CREATE POLICY "Role-based provider update access" ON providers
FOR UPDATE TO authenticated
USING (
  -- User can update their own provider record
  auth.uid() = user_id OR
  -- Only admins can update providers
  has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based DELETE policy (admin only)
CREATE POLICY "Role-based provider delete access" ON providers
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- APPOINTMENTS TABLE - Restrict access to authorized roles only
-- ============================================================================

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

-- Create role-based SELECT policy
CREATE POLICY "Role-based appointment view access" ON appointments
FOR SELECT TO authenticated
USING (
  -- User can see their own appointments
  auth.uid() = user_id OR
  -- Billing staff and admins can view all appointments
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based INSERT policy
CREATE POLICY "Role-based appointment create access" ON appointments
FOR INSERT TO authenticated
WITH CHECK (
  -- Users can create their own appointments
  auth.uid() = user_id OR
  -- Billing staff and admins can create appointments
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based UPDATE policy
CREATE POLICY "Role-based appointment update access" ON appointments
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);

-- Create role-based DELETE policy
CREATE POLICY "Role-based appointment delete access" ON appointments
FOR DELETE TO authenticated
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'billing_staff') OR
  has_role(auth.uid(), 'admin')
);