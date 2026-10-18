-- ==============================================================================
-- NASS LASUSTECH: EXECUTIVES, EVENTS & BLOGS SEED DATA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tugqslciljchnchtkbht/sql
-- ==============================================================================

-- 1. SEED EXECUTIVES (17 Official Leaders from 2026/2027 Registration Register)
INSERT INTO public.executives (name, post, department, level, description, image_url, sort_order, is_active)
VALUES
  -- Student Executive Council (SEC)
  ('Adegoke Muhammed Abiola', 'President', 'Computer Science', '400 Level', 'Serves as the primary leader and official collegiate representative of NASS LASUSTECH Chapter, directing college-wide student governance and academic advocacy.', '/assets/executives/president_adegoke.jpg', 1, true),
  ('Adedeji Sofiyyah Anike', 'Vice President', 'Biological Sciences (Botany)', '400 Level', 'Coordinates administrative programs, inter-departmental initiatives, and assists the President in maintaining organizational stability and academic programs.', '/assets/executives/vp_sofiyyah.jpg', 2, true),
  ('Likinyo Ayomipo Ayeo', 'General Secretary', 'Chemical Science (Chemistry)', '400 Level', 'Custodian of collegiate records, official correspondence, documentation, and coordination of council meetings across the 5 basic science departments.', '/assets/executives/gensec_likinyo.jpg', 3, true),
  ('Quadri Stella Maris', 'Assistant General Secretary', 'Chemical Science (Biochemistry)', '300 Level', 'Assists the General Secretary in secretarial management, record maintenance, and seamless collegiate internal communications.', '/assets/executives/ass_gensec_quadri.jpg', 4, true),
  ('Oladepo Damilare David', 'Treasurer', 'Computer Science', '400 Level', 'Administers collegiate funds, financial accountability, and transparent disbursement records for student programs and faculty events.', '/assets/executives/treasurer_oladepo.jpg', 5, true),
  ('Fregene Emmanuel Chukwudi', 'Public Relations Officer (PRO 1)', 'Computer Science', '400 Level', 'Official spokesperson of NASS LASUSTECH, managing public communications, institutional branding, media relations, and student publicity.', '/assets/executives/pro_fregene.jpg', 6, true),
  ('Adetunji Adegoke Olaide', 'Social Director 1', 'Mathematical Sciences (Statistics)', '400 Level', 'Drives student community engagements, cultural events, collegiate social gatherings, and networking programs for science scholars.', '/assets/executives/social_adetunji.jpg', 7, true),
  ('Michael Abel Armani', 'Sport Director 2', 'Mathematical Sciences (Statistics)', '300 Level', 'Organizes collegiate sports competitions, inter-departmental soccer championships, and physical wellness programs across the College of Basic Sciences.', '/assets/executives/sports_michael.jpg', 8, true),
  ('Kanu Eberechi', 'Welfare Director 1', 'Chemical Sciences (Biochemistry)', '300 Level', 'Oversees student welfare, academic support inquiries, and member living accommodations to maintain an inclusive, caring collegiate environment.', '/assets/executives/welfare1_kanu.jpg', 9, true),
  ('Olatunji Oyindamola Barakat', 'Welfare Director 2', 'Computer Sciences', '200 Level', 'Co-directs student welfare, student support logistics, and freshman integration into collegiate academic life.', '/assets/executives/welfare2_olatunji.jpg', 10, true),

  -- Student Representative Council (SRC)
  ('Agboola Victor Abiola', 'Speaker of the House', 'Mathematical Sciences (Statistics)', '400 Level', 'Presides over the Student Representative Council (SRC), guiding legislative deliberations, constitutional amendments, and budgetary reviews.', '/assets/executives/speaker_agboola.jpg', 11, true),
  ('Asaolu Dolapo Richard', 'Clerk of the House', 'Physical Sciences (Physics with Electronics)', '400 Level', 'Chief administrative and recording officer of the legislative chamber, managing bills, legislative proceedings, and official house journals.', '/assets/executives/clerk_asaolu.jpg', 12, true),
  ('Ojelabi Opeyemi Oluwapelumi', 'Honorable Member (Computer Sciences)', 'Computer Sciences', '300 Level', 'Elected parliamentary representative articulating constituent interests, student concerns, and legislative motions for Computer Science scholars.', '/assets/executives/hon_ojelabi.jpg', 13, true),
  ('Jesuyon Olaoluwa Temidara', 'Honorable Member (Computer Science)', 'Computer Science', '400 Level', 'Senior parliamentary representative serving on legislative oversight and constitutional adherence committees in the collegiate house.', '/assets/executives/hon_jesuyon.png', 14, true),
  ('Odusanya Fareedah Abimbola', 'Honorable Member (Computer Science)', 'Computer Science', '200 Level', 'Parliamentary delegate representing the sophomore cohort, championing student academic development and collegiate welfare legislation.', '/assets/executives/hon_odusanya.jpg', 15, true),
  ('Olowookere Yusuf', 'Honorable Member (Chemical Sciences)', 'Chemical Sciences (Biochemistry)', '300 Level', 'Legislative representative for Chemical Sciences scholars, advocating for laboratory resources, student interests, and faculty synergy.', '/assets/executives/hon_olowookere.jpg', 16, true),
  ('Babalola Abdul-Rahman Olamilekan', 'Honorable Member (Mathematical Sciences)', 'Mathematical Sciences (Mathematics)', '300 Level', 'Parliamentary representative for Mathematics and Statistics scholars, reviewing student bills and departmental welfare policies.', '/assets/executives/hon_babalola.jpg', 17, true)
ON CONFLICT DO NOTHING;

-- 2. SEED EVENTS
INSERT INTO public.events (slug, title, event_status, start_date, end_date, location, description, sort_order, is_active)
VALUES
  (
    'science-week-2026',
    'NASS Annual College Science Week 2026',
    'upcoming',
    '2026-11-15T09:00:00Z',
    '2026-11-20T17:00:00Z',
    'College of Basic Sciences Main Auditorium, LASUSTECH',
    'The premier collegiate symposium bringing together faculty scholars, departmental exhibitions, science project demos, and inter-departmental quiz tournaments across all five basic science disciplines.',
    1,
    true
  ),
  (
    'empirical-hackathon-2026',
    'Inter-Departmental Empirical Hackathon',
    'upcoming',
    '2026-12-05T08:00:00Z',
    '2026-12-07T18:00:00Z',
    'CBS Innovation Lab 2, LASUSTECH',
    'A 48-hour competitive sprint in computational modeling, bio-informatics, and data visualization solving real-world challenges in Lagos State.',
    2,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description, location = EXCLUDED.location;

-- 3. SEED BLOGS / BULLETINS
INSERT INTO public.blogs (slug, title, excerpt, content, author, category, is_published, published_at)
VALUES
  (
    'deans-welcome-dispatch',
    'Dean & Secretariat Dispatch: The Renaissance of Basic Sciences at LASUSTECH',
    'An inspiring collegiate address to all scholars of the College of Basic Sciences detailing research expectations, leadership excellence, and collaborative innovation in the 2025/2026 session.',
    'Welcome to an era of groundbreaking discovery at the College of Basic Sciences. As science scholars, our role in national development and technological progress has never been more pivotal. Under the leadership of NASS LASUSTECH, we are uniting all 5 departments toward research innovation and academic excellence.',
    'NASS Executive Council',
    'Dean''s Corner',
    true,
    now()
  ),
  (
    'first-semester-study-strategies',
    'Navigating First Semester: High-Impact Study Strategies for Science Scholars',
    'Proven academic frameworks, departmental study groups, and revision techniques to excel across empirical laboratory courses, mathematical analysis, and natural sciences.',
    'Mastering collegiate science coursework requires disciplined problem-solving and proactive group study. In this comprehensive guide, senior scholars and academic directors share practical timetables, laboratory report tips, and recommended reference materials.',
    'Academic Welfare Committee',
    'Academic Welfare',
    true,
    now()
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content;
