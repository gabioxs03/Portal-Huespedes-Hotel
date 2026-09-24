-- Create the hotel_settings table
CREATE TABLE hotel_settings (
  id integer PRIMARY KEY DEFAULT 1,
  hotel_name text NOT NULL,
  welcome_es text NOT NULL,
  welcome_en text,
  logo_url text
);

-- Create the content_sections table
CREATE TABLE content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_es text NOT NULL,
  title_en text,
  description_es text,
  description_en text,
  icon text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the content_items table
CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES content_sections(id) ON DELETE CASCADE,
  title_es text NOT NULL,
  title_en text,
  description_es text,
  description_en text,
  type text NOT NULL CHECK (type IN ('document', 'external_link', 'whatsapp', 'phone', 'email', 'internal_page')),
  target_url text NOT NULL,
  icon text NOT NULL,
  image_url text,
  position integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the activity_log table for basic history
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title text NOT NULL,
  action text NOT NULL,
  actor text,
  created_at timestamptz DEFAULT now()
);

-- Setup Row Level Security (RLS)
ALTER TABLE hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Public read policies (only read published items)
CREATE POLICY "Public can read settings" ON hotel_settings FOR SELECT USING (true);
CREATE POLICY "Public can read sections" ON content_sections FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read items" ON content_items FOR SELECT USING (is_published = true);

-- Authenticated users (admins) have full access
CREATE POLICY "Admins have full access to settings" ON hotel_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to sections" ON content_sections FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to items" ON content_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins have full access to activity log" ON activity_log FOR ALL TO authenticated USING (true);

-- Insert initial mock settings
INSERT INTO hotel_settings (hotel_name, welcome_es, welcome_en) 
VALUES ('Mi Hotel', 'Bienvenido a su estancia.', 'Welcome to your stay.')
ON CONFLICT (id) DO NOTHING;

-- Storage
-- Assuming the user creates a bucket named "public-content"
-- Insert policies for the bucket (these might need to be run in the Supabase Dashboard SQL Editor as postgres)
-- CREATE POLICY "Public can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'public-content');
-- CREATE POLICY "Admins can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-content');
-- CREATE POLICY "Admins can update documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'public-content');
-- CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'public-content');
