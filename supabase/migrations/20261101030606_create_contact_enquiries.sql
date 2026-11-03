/*
# Create contact enquiries table

1. New Tables
- `contact_enquiries`: messages sent through the Contact page form.
  - `id` (uuid, primary key)
  - `full_name` (text, required, max 120 characters)
  - `mobile` (text, required, exactly 10 digits)
  - `email` (text, required, max 254 characters)
  - `created_at` (timestamp, defaults to now)

2. Security
- Row level security is enabled on `contact_enquiries`.
- Anyone visiting the site (anon and signed-in roles) may INSERT a row, subject to the field checks above.
- No SELECT, UPDATE or DELETE policy is added, so submitted enquiries cannot be read or changed from the public site. They are viewed through the Supabase dashboard.

3. Notes
- The table is created only if it does not already exist, and policies are recreated idempotently.
*/

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  mobile text NOT NULL CHECK (mobile ~ '^[0-9]{10}$'),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON contact_enquiries TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_contact_enquiries" ON contact_enquiries;
CREATE POLICY "anon_insert_contact_enquiries" ON contact_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
