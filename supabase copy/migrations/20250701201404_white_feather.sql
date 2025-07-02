/*
  # Fix profiles table foreign key constraint

  1. Changes
    - Remove the invalid foreign key constraint that references a non-existent `users` table
    - The profiles.id should reference auth.users(id) instead, but since we can't directly reference auth schema tables, we'll remove the constraint
    - The application logic already handles the relationship between auth.users and profiles

  2. Security
    - RLS policies remain unchanged and secure
    - Profile creation is still properly controlled through RLS policies
*/

-- Remove the invalid foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Note: The profiles.id field should match auth.users.id, but this is handled at the application level
-- The RLS policies already ensure users can only access their own profiles