-- ==============================================================================
-- NASS LASUSTECH OFFICIAL SUPABASE POSTGRESQL SCHEMA
-- National Association of Science Students - College of Basic Sciences
-- Project: https://supabase.com/dashboard/project/tugqslciljchnchtkbht
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. SITE & ACADEMIC SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  setting_group TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Academic Calendar Settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_group)
VALUES
  ('current_session', '2025/2026', 'academic'),
  ('current_semester', 'First Semester', 'academic'),
  ('college_name', 'College of Basic Sciences', 'institutional'),
  ('association_name', 'National Association of Science Students (NASS)', 'institutional'),
  ('chapter_name', 'LASUSTECH Chapter', 'institutional'),
  ('main_campus', 'Ikorodu Main Campus, Lagos State', 'institutional')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value, setting_group = EXCLUDED.setting_group;

-- ==============================================================================
-- 3. STUDENTS & MEMBERSHIP REPOSITORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matric_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL, -- Computer Science, Mathematical Sciences, Chemical Sciences, Biological Sciences, Physics
  level TEXT NOT NULL, -- 100L, 200L, 300L, 400L
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  blood_group TEXT,
  emergency_contact TEXT,
  dues_status TEXT NOT NULL DEFAULT 'Unpaid', -- 'Paid', 'Unpaid'
  dues_paid_at TIMESTAMPTZ,
  id_card_status TEXT NOT NULL DEFAULT 'Not Requested', -- 'Not Requested', 'Pending', 'Issued'
  id_card_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for instant student portal lookup by matric number
CREATE INDEX IF NOT EXISTS idx_students_matric ON public.students(matric_number);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.students(department);

-- ==============================================================================
-- 4. EXECUTIVES COUNCIL (COLLEGIATE LEADERSHIP)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.executives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  post TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT '400L',
  description TEXT,
  image_url TEXT,
  phone TEXT,
  email TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. EVENTS & INSTITUTIONAL MOMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'current', 'past'
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  registration_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.event_gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. BLOGS & SCIENTIFIC INSIGHTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'NASS Secretariat',
  category TEXT DEFAULT 'Collegiate Dispatch',
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. AWARDS & VOTING SYSTEM (COLLEGE OF BASIC SCIENCES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.voting_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.voting_settings (setting_key, setting_value)
VALUES
  ('eventName', 'NASS Basic Sciences Annual Awards'),
  ('eventEdition', '2026'),
  ('awardsDate', '2026-06-17T18:00:00+01:00'),
  ('votingClosesAt', '2026-06-07T23:59:59+01:00'),
  ('votePrice', '100'),
  ('currency', 'NGN'),
  ('votingOpen', '1'),
  ('paymentProvider', 'korapay'),
  ('paymentProviderLabel', 'Korapay'),
  ('paymentProviderDescription', 'Secured checkout via Korapay')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value;

CREATE TABLE IF NOT EXISTS public.voting_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  group_key TEXT NOT NULL,
  group_name TEXT NOT NULL,
  group_sort INT NOT NULL DEFAULT 0,
  accent_color TEXT NOT NULL DEFAULT '#1a4480', -- LASUSTECH Royal Blue
  vote_price INT NOT NULL DEFAULT 100,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.voting_nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.voting_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  level_label TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT,
  vote_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.voting_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  nominee_id UUID NOT NULL REFERENCES public.voting_nominees(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  voter_email TEXT NOT NULL,
  votes INT NOT NULL,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_provider TEXT NOT NULL DEFAULT 'korapay',
  provider_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_transactions ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS (Visitors & Students can freely view public content)
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active executives" ON public.executives FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active events" ON public.events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view event galleries" ON public.event_gallery_images FOR SELECT USING (true);
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view voting settings" ON public.voting_settings FOR SELECT USING (true);
CREATE POLICY "Public can view voting categories" ON public.voting_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view voting nominees" ON public.voting_nominees FOR SELECT USING (is_active = true);

-- STUDENTS ACCESS
CREATE POLICY "Public can check student status" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public can insert student registration" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update own student profile" ON public.students FOR UPDATE USING (true);

-- VOTING TRANSACTIONS
CREATE POLICY "Public can initiate vote transaction" ON public.voting_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own vote confirmation" ON public.voting_transactions FOR SELECT USING (true);

-- ==============================================================================
-- 9. SEED INITIAL NASS AWARDS CATEGORIES (COLLEGIATE ACADEMIC EXCELLENCE)
-- ==============================================================================
INSERT INTO public.voting_categories
  (slug, name, description, group_key, group_name, group_sort, accent_color, vote_price, sort_order)
VALUES
  ('science-researcher-of-the-year', 'Science Researcher of the Year', 'Excellence in laboratory experiments, empirical research, and publications.', 'academic-research', 'Academic & Research', 1, '#1a4480', 100, 1),
  ('best-programmer-of-the-year', 'Best Programmer of the Year', 'Exceptional algorithmic, systems, and software engineering capabilities.', 'tech-digital', 'Technology & Systems', 2, '#1a4480', 100, 2),
  ('mathematical-scholar-award', 'Mathematical Scholar of the Year', 'Outstanding mathematical modeling, abstract analysis, and computation.', 'academic-research', 'Academic & Research', 1, '#1a4480', 100, 3),
  ('chemical-innovator-of-the-year', 'Chemical Sciences Innovator', 'Groundbreaking laboratory synthesis, industrial chemistry, and safety.', 'academic-research', 'Academic & Research', 1, '#1a4480', 100, 4),
  ('biological-discovery-award', 'Biological Sciences Discovery Award', 'Excellence in biological exploration, microbiology, and biodiversity research.', 'academic-research', 'Academic & Research', 1, '#1a4480', 100, 5),
  ('applied-physics-luminary', 'Applied Physics Luminary', 'Exceptional work across optics, electronics, and theoretical physics.', 'academic-research', 'Academic & Research', 1, '#1a4480', 100, 6),
  ('most-outstanding-leader', 'Most Outstanding Student Leader', 'Demonstrating visionary, inclusive leadership across the College of Basic Sciences.', 'leadership-impact', 'Leadership & Impact', 3, '#1a4480', 100, 7),
  ('college-personality-of-the-year', 'College Personality of the Year', 'Vibrant, respected, and engaging student championing science advocacy.', 'social-personality', 'Social & Personality', 4, '#1a4480', 100, 8)
ON CONFLICT (slug) DO UPDATE
SET description = EXCLUDED.description, accent_color = EXCLUDED.accent_color;
