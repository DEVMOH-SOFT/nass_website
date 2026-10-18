import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ID_SYSTEM_API = 'https://nacosid.tmb.it.com/api.php';
const API_KEY = process.env.ID_SYSTEM_API_KEY || 'NACOS_LASUSTECH_SECURE_API_KEY';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// On Vercel, filesystem is read-only except /tmp. Data won't persist
// between invocations on Vercel — defaults will be used each time.
const STORE_DIR = process.env.VERCEL
  ? '/tmp/data'
  : path.join(__dirname, '../data');
const STORE_FILE = path.join(STORE_DIR, 'admin_store.json');

// Ensure local store directory exists (safe on all environments)
try {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
} catch (_err) {
  console.warn('⚠️  Could not create data store directory:', _err.message);
}

/* ==========================================
   DEFAULT STATIC DATA (Matches Public Front End)
   ========================================== */

const defaultExecutives = [
  {
    id: "nass-exec-1",
    name: "Comrade Adegoke Muhammed Abiola",
    preferredName: "Muhammed",
    post: "President",
    level: "400 Level",
    department: "Computer Science",
    description: "Serves as the primary leader and official collegiate representative of NASS LASUSTECH Chapter, directing college-wide student governance and academic advocacy across the College of Basic Sciences.",
    image_url: "uploads/president_adegoke.jpg",
    matric_no: "230303010037",
    phone: "09077299644",
    whatsapp: "09077299644",
    email: "adegokemohammed92@gmail.com",
    sort_order: 1,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-2",
    name: "Adedeji Sofiyyah Anike",
    preferredName: "Anike",
    post: "Vice President",
    level: "400 Level",
    department: "Biological Sciences (Botany)",
    description: "Coordinates collegiate administrative programs, inter-departmental initiatives, and assists the President in maintaining organizational stability.",
    image_url: "uploads/vp_sofiyyah.jpg",
    matric_no: "230301010024",
    phone: "07081825746",
    whatsapp: "07081825746",
    email: "sofiyyahadedeji50@gmail.com",
    sort_order: 2,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-3",
    name: "Likinyo Ayomipo Ayeo",
    preferredName: "Ayomipo",
    post: "General Secretary",
    level: "400 Level",
    department: "Chemical Sciences (Chemistry)",
    description: "The administrative custodian of NASS Secretariat records, responsible for official collegiate documentation, correspondence, and executive meeting coordination.",
    image_url: "uploads/gensec_likinyo.jpg",
    matric_no: "230302010026",
    phone: "07071386098",
    whatsapp: "07071386098",
    email: "likinyoayomipo@gmail.com",
    sort_order: 3,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-4",
    name: "Quadri Stella Maris",
    preferredName: "Stella",
    post: "Assistant General Secretary",
    level: "300 Level",
    department: "Chemical Sciences (Biochemistry)",
    description: "Supports the General Secretary in collegiate correspondence, recording executive proceedings, and secretariat administration.",
    image_url: "uploads/ass_gensec_quadri.jpg",
    matric_no: "250302030024",
    phone: "09161784349",
    whatsapp: "09161784349",
    email: "quadristellamaris@gmail.com",
    sort_order: 4,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-5",
    name: "Oladepo Damilare David",
    preferredName: "Damilare",
    post: "Treasurer",
    level: "400 Level",
    department: "Computer Science",
    description: "Oversees the collegiate treasury, dues clearances, and verified digital receipts ledger across all science departments.",
    image_url: "uploads/treasurer_oladepo.jpg",
    matric_no: "230303010001",
    phone: "07067255816",
    whatsapp: "07067255816",
    email: "oladepodavid12@gmail.com",
    sort_order: 5,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-6",
    name: "Fregene Emmanuel Chukwudi",
    preferredName: "Emmanuel",
    post: "Public Relations Officer 1 (PRO 1)",
    level: "400 Level",
    department: "Computer Science",
    description: "Official spokesperson for the NASS LASUSTECH Chapter, directing publicity, institutional branding, press releases, and student body updates.",
    image_url: "uploads/pro_fregene.jpg",
    matric_no: "230303010124",
    phone: "08076696462",
    whatsapp: "08076696462",
    email: "fregeneemmanuel2005@gmail.com",
    sort_order: 6,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-7",
    name: "Adetunji Adegoke Olaide",
    preferredName: "Olaide",
    post: "Social Director 1",
    level: "400 Level",
    department: "Mathematical Sciences (Statistics)",
    description: "Directs collegiate social engagements, Science Week celebrations, and inter-departmental student networking experiences.",
    image_url: "uploads/social_adetunji.jpg",
    matric_no: "230304030062",
    phone: "09018309604",
    whatsapp: "09018309604",
    email: "adetunjiolaide001@gmail.com",
    sort_order: 7,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-8",
    name: "Akinsanya Israel Olaoluwa",
    preferredName: "Israel",
    post: "Sport Director 1",
    level: "400 Level",
    department: "Mathematical Sciences (Industrial Mathematics)",
    description: "Directs collegiate athletic fixtures, inter-departmental tournaments, and student sports development across the College of Basic Sciences.",
    image_url: "uploads/sports1_akinsanya.jpg",
    matric_no: "230304010012",
    phone: "08102333885",
    whatsapp: "08102333885",
    email: "akinsanyaisrael130@gmail.com",
    sort_order: 8,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-9",
    name: "Michael Abel Armani",
    preferredName: "Armani",
    post: "Sport Director 2",
    level: "300 Level",
    department: "Mathematical Sciences (Statistics)",
    description: "Coordinates fitness championships, collegiate sporting fixtures, and supports athletics administration for NASS members.",
    image_url: "uploads/sports_michael.jpg",
    matric_no: "240304030073",
    phone: "09069598119",
    whatsapp: "09069598119",
    email: "michaelarmany0@gmail.com",
    sort_order: 9,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-10",
    name: "Kanu Eberechi",
    preferredName: "Eberechi",
    post: "Welfare Director 1",
    level: "300 Level",
    department: "Chemical Sciences (Biochemistry)",
    description: "Monitors student welfare, academic environment quality, support desks, and scholar accommodations.",
    image_url: "uploads/welfare1_kanu.jpg",
    matric_no: "240302030009",
    phone: "08113040343",
    whatsapp: "08113040343",
    email: "eberechik06@gmail.com",
    sort_order: 10,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-11",
    name: "Olatunji Oyindamola Barakat",
    preferredName: "Oyindamola",
    post: "Welfare Director 2",
    level: "200 Level",
    department: "Computer Science",
    description: "Coordinates fresher integration, student assistance desks, and health & wellbeing initiatives across the college.",
    image_url: "uploads/welfare2_olatunji.jpg",
    matric_no: "250303010015",
    phone: "07066540947",
    whatsapp: "07066540947",
    email: "olatunjibarokatoyindamola@gmail.com",
    sort_order: 11,
    is_active: 1,
    arm: "SEC"
  },
  {
    id: "nass-exec-12",
    name: "Rt. Hon. Agboola Victor Abiola",
    preferredName: "Victor",
    post: "Speaker (SRC)",
    level: "400 Level",
    department: "Mathematical Sciences (Statistics)",
    description: "Presides over the Student Representative Council (SRC), parliamentary debates, constitutional reviews, and collegiate legislative oversight.",
    image_url: "uploads/speaker_agboola.jpg",
    matric_no: "230304030013",
    phone: "09068756683",
    whatsapp: "09068756683",
    email: "agboolavictor001@gmail.com",
    sort_order: 12,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-13",
    name: "Hon. Babajide Khalid Sanusi",
    preferredName: "Khalid",
    post: "Deputy Speaker (SRC)",
    level: "400 Level",
    department: "Biological Sciences (Botany)",
    description: "Assists the Speaker in parliamentary proceedings, legislative affairs, and presides over council sessions in the Speaker's absence.",
    image_url: "uploads/deputy_speaker_babajide.jpg",
    matric_no: "230301010038",
    phone: "08069574387",
    whatsapp: "08069574387",
    email: "khalidbabajide@gmail.com",
    sort_order: 13,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-14",
    name: "Hon. Asaolu Dolapo Richard",
    preferredName: "Dolapo",
    post: "Clerk (SRC)",
    level: "400 Level",
    department: "Physical Sciences (Physics)",
    description: "Directs parliamentary record keeping, bill documentation, order paper management, and legislative correspondence of the SRC.",
    image_url: "uploads/clerk_asaolu.jpg",
    matric_no: "230305010082",
    phone: "08149809519",
    whatsapp: "08149809519",
    email: "asaoludolapo12@gmail.com",
    sort_order: 14,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-15",
    name: "Hon. Pot-Balogun Sevovo Samuel",
    preferredName: "Sevovo",
    post: "Chief Whip (SRC)",
    level: "300 Level",
    department: "Chemical Sciences (Biochemistry)",
    description: "Maintains legislative discipline, protocol, and orderly conduct during all sessions and parliamentary sittings of the SRC.",
    image_url: "uploads/chief_whip_pot_balogun.jpg",
    matric_no: "240302030046",
    phone: "07080743607",
    whatsapp: "07080743607",
    email: "samuelpotbalogun24@gmail.com",
    sort_order: 15,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-16",
    name: "Hon. Ojelabi Opeyemi Oluwapelumi",
    preferredName: "Opeyemi",
    post: "Honorable Member (SRC)",
    level: "300 Level",
    department: "Computer Science",
    description: "Represents the interests and welfare of Computer Science scholars in the parliamentary chamber.",
    image_url: "uploads/hon_ojelabi.jpg",
    matric_no: "240303010030",
    phone: "08144891569",
    whatsapp: "08144891569",
    email: "opeyemiojelabi3@gmail.com",
    sort_order: 16,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-17",
    name: "Hon. Jesuyon Olaoluwa Temidara",
    preferredName: "Olaoluwa",
    post: "Honorable Member (SRC)",
    level: "400 Level",
    department: "Computer Science",
    description: "Senior parliamentary representative advocating student affairs and constitutional motions for Computer Science.",
    image_url: "uploads/hon_jesuyon.png",
    matric_no: "230303010148",
    phone: "08061362934",
    whatsapp: "08061362934",
    email: "jesuyonolaoluwa22@gmail.com",
    sort_order: 17,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-18",
    name: "Hon. Odusanya Fareedah Abimbola",
    preferredName: "Fareedah",
    post: "Honorable Member (SRC)",
    level: "200 Level",
    department: "Computer Science",
    description: "Elected departmental representative advocating student welfare, freshman interests, and academic affairs in parliament.",
    image_url: "uploads/hon_odusanya.jpg",
    matric_no: "250303010065",
    phone: "09056254406",
    whatsapp: "09056254406",
    email: "odusanyafareedah5@gmail.com",
    sort_order: 18,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-19",
    "name": "Hon. Olowookere Yusuf",
    preferredName: "Yusuf",
    post: "Honorable Member (SRC)",
    level: "300 Level",
    department: "Chemical Sciences (Biochemistry)",
    description: "Elected parliamentary representative representing the Chemical Sciences department in the legislative council.",
    image_url: "uploads/hon_olowookere.jpg",
    matric_no: "240302030048",
    phone: "09045774036",
    whatsapp: "09045774036",
    email: "olowookereyusuf2003@gmail.com",
    sort_order: 19,
    is_active: 1,
    arm: "SRC"
  },
  {
    id: "nass-exec-20",
    name: "Hon. Babalola Abdul-Rahman Olamilekan",
    preferredName: "Abdul-Rahman",
    post: "Honorable Member (SRC)",
    level: "300 Level",
    department: "Mathematical Sciences (Mathematics)",
    description: "Elected parliamentary representative advocating student affairs and legislative motions for Mathematical Sciences.",
    image_url: "uploads/hon_babalola.jpg",
    matric_no: "240303020027",
    phone: "08038451340",
    whatsapp: "08038451340",
    email: "abdulrahmanolamilekan597@gmail.com",
    sort_order: 20,
    is_active: 1,
    arm: "SRC"
  }
];

const defaultEvents = [
  {
    id: "hod-cup-finale",
    title: "HOD'S CUP: THE GRAND FINALE",
    event_status: "past",
    start_date: "2026-05-07T12:00",
    end_date: "2026-05-07T15:00",
    location: "LASUSTECH Main Field",
    description: "The ultimate glory awaits! Join us for the 3rd Place Match (100L vs 200L) at 12:00 NOON and the Final Match (300L vs 400L) at 1:30 PM. Venue: LASUSTECH Main Field.",
    cover_image_url: "uploads/final_fixture.jpg",
    sort_order: 1,
    is_active: 1,
    gallery: []
  },
  {
    id: "ladies-in-tech",
    title: "LADIES IN TECH EVENT",
    event_status: "past",
    start_date: "2026-05-01T20:00",
    end_date: "2026-05-01T22:00",
    location: "Google Meet",
    description: "Theme: Overcoming fear and imposter syndrome. Featuring guest speakers Agape Oluwa, Mujisatullahi Bakare, and Naheemat Akinyemi A. Hosted by Owolabi Grace (Lady Vice). Join us on Google Meet at 8:00 PM. Contact the PRO (+234 810 563 8170) for more info.",
    cover_image_url: "uploads/PHOTO-2026-04-29-09-06-01.jpg",
    sort_order: 2,
    is_active: 1,
    gallery: []
  },
  {
    id: "hod-cup",
    title: "HOD'S CUP 2025/2026",
    event_status: "past",
    start_date: "2026-04-22T08:00",
    end_date: "2026-05-07T18:00",
    location: "LASUSTECH",
    description: "The annual HOD'S CUP featuring Football, Chess, and Scrabble. A month of intense competition where the department's best athletes battled for glory.",
    cover_image_url: "uploads/PHOTO-2026-04-24-17-16-18.jpg",
    sort_order: 3,
    is_active: 1,
    gallery: []
  },
  {
    id: "bootcamp-onboarding",
    title: "NACOS Tech Upscaling Bootcamp Onboarding",
    event_status: "past",
    start_date: "2026-04-29T10:00",
    end_date: "2026-04-29T12:00",
    location: "LASUSTECH",
    description: "The official onboarding session for the NACOS Upscaling Bootcamp, introducing students to advanced computing tracks and industry mentorship.",
    cover_image_url: "uploads/PHOTO-2026-04-28-12-14-22.jpg",
    sort_order: 4,
    is_active: 1,
    gallery: []
  }
];

/* ==========================================
   LOCAL JSON DB STORE HANDLERS
   ========================================== */

const getStore = () => {
  if (!fs.existsSync(STORE_FILE)) {
    const initialStore = {
      academicSettings: {
        session: '2025/2026',
        semester: 'First Semester',
      },
      executives: defaultExecutives,
      events: defaultEvents,
      blogs: [],
      studentFlags: [],
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
    return initialStore;
  }
  
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ local JSON store parsing failed:', err.message);
    return {
      academicSettings: { session: '2025/2026', semester: 'First Semester' },
      executives: defaultExecutives,
      events: defaultEvents,
      blogs: [],
      studentFlags: [],
    };
  }
};

const saveStore = (data) => {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ local JSON store saving failed:', err.message);
  }
};

/* ==========================================
   API HELPER & image path normalization
   ========================================== */

const getHeaders = () => ({
  'X-API-KEY': API_KEY,
  'Content-Type': 'application/json',
});

const remotePost = async (action, payload = {}) => {
  try {
    await axios.post(ID_SYSTEM_API, payload, {
      headers: getHeaders(),
      params: { action },
      timeout: 5000,
    });
  } catch (err) {
    console.warn(`⚠️ Central server background post failed for ${action}:`, err.message);
  }
};

const normalizeImagePath = (pathStr) => {
  if (!pathStr) return '';
  
  if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
    const parts = pathStr.split('/uploads/');
    if (parts.length > 1) {
      return 'uploads/' + parts[1];
    }
    const filename = pathStr.substring(pathStr.lastIndexOf('/') + 1);
    return 'uploads/' + filename;
  }
  
  let clean = pathStr.replace(/^[/\\]+/, '');
  
  if (!clean.startsWith('uploads/')) {
    const filename = clean.substring(clean.lastIndexOf('/') + 1);
    return 'uploads/' + filename;
  }
  
  return clean;
};

/* ==========================================
   1. ACADEMIC SETTINGS SERVICES
   ========================================== */

export const getAcademicSettings = async () => {
  const store = getStore();
  return store.academicSettings;
};

export const updateAcademicSettings = async ({ session, semester, updatedBy }) => {
  const store = getStore();
  store.academicSettings = { session, semester };
  saveStore(store);
  
  // Background call to central API
  remotePost('update_academic_settings', { session, semester, updated_by: updatedBy });
  
  return store.academicSettings;
};

/* ==========================================
   2. STUDENT FLAGS SERVICES
   ========================================== */

export const getStudentFlags = async () => {
  const store = getStore();
  return store.studentFlags || [];
};

export const getStudentFlagByMatric = async (matricNumber) => {
  const store = getStore();
  const flags = store.studentFlags || [];
  return flags.find(f => String(f.matric_number).trim() === String(matricNumber).trim() && f.status === 'active') || null;
};

export const upsertStudentFlag = async ({
  matricNumber,
  studentName,
  reason,
  message,
  flaggedBy,
}) => {
  const store = getStore();
  if (!store.studentFlags) store.studentFlags = [];
  
  const existingIndex = store.studentFlags.findIndex(
    f => String(f.matric_number).trim() === String(matricNumber).trim() && f.status === 'active'
  );
  
  const flagObj = {
    id: existingIndex !== -1 ? store.studentFlags[existingIndex].id : Date.now(),
    matric_number: matricNumber,
    student_name: studentName,
    reason,
    message,
    flagged_by: flaggedBy,
    status: 'active',
    created_at: existingIndex !== -1 ? store.studentFlags[existingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    store.studentFlags[existingIndex] = flagObj;
  } else {
    store.studentFlags.push(flagObj);
  }
  
  saveStore(store);
  
  remotePost('upsert_student_flag', flagObj);
  
  return flagObj;
};

export const clearStudentFlag = async (id) => {
  const store = getStore();
  if (!store.studentFlags) store.studentFlags = [];
  
  const existingIndex = store.studentFlags.findIndex(f => String(f.id) === String(id));
  if (existingIndex !== -1) {
    store.studentFlags[existingIndex].status = 'resolved';
    store.studentFlags[existingIndex].updated_at = new Date().toISOString();
    saveStore(store);
  }
  
  remotePost('clear_student_flag', { id });
};

/* ==========================================
   3. EXECUTIVES SERVICES
   ========================================== */

export const listExecutives = async ({ includeInactive = false } = {}) => {
  const store = getStore();
  const excos = store.executives || [];
  
  const items = includeInactive ? excos : excos.filter(e => e.is_active === 1 || e.is_active === true);
  return items.map(item => ({
    ...item,
    image_url: normalizeImagePath(item.image_url || item.image),
    image: item.image || item.image_url || '',
  }));
};

export const saveExecutive = async (payload, id = null) => {
  const store = getStore();
  if (!store.executives) store.executives = [];
  
  const normalized = {
    ...payload,
    image_url: normalizeImagePath(payload.image_url || payload.image),
    image: normalizeImagePath(payload.image || payload.image_url),
    is_active: payload.is_active === false ? 0 : 1,
    sort_order: Number(payload.sort_order || 0),
  };

  if (id) {
    const idx = store.executives.findIndex(e => String(e.id) === String(id));
    if (idx !== -1) {
      store.executives[idx] = { ...store.executives[idx], ...normalized, id };
    }
  } else {
    normalized.id = 'exec-' + Date.now();
    store.executives.push(normalized);
  }
  
  saveStore(store);
  
  remotePost('save_executive', { ...normalized, id });
  
  return listExecutives({ includeInactive: true });
};

export const deleteExecutive = async (id) => {
  const store = getStore();
  if (!store.executives) store.executives = [];
  store.executives = store.executives.filter(e => String(e.id) !== String(id));
  saveStore(store);
  
  remotePost('delete_executive', { id });
};

/* ==========================================
   4. EVENTS & GALLERY SERVICES
   ========================================== */

export const listEvents = async ({ includeInactive = false } = {}) => {
  const store = getStore();
  const events = store.events || [];
  
  const items = includeInactive ? events : events.filter(e => e.is_active === 1 || e.is_active === true);
  return items.map(item => ({
    ...item,
    cover_image_url: normalizeImagePath(item.cover_image_url || item.image || item.cover_image || ''),
    gallery: Array.isArray(item.gallery) ? item.gallery.map(img => ({
      ...img,
      image_url: normalizeImagePath(img.image_url || img.image || ''),
    })) : [],
  }));
};

export const saveEvent = async (payload, id = null) => {
  const store = getStore();
  if (!store.events) store.events = [];
  
  const normalized = {
    ...payload,
    cover_image_url: normalizeImagePath(payload.cover_image_url || payload.image),
    is_active: payload.is_active === false ? 0 : 1,
    sort_order: Number(payload.sort_order || 0),
  };

  if (id) {
    const idx = store.events.findIndex(e => String(e.id) === String(id));
    if (idx !== -1) {
      store.events[idx] = { ...store.events[idx], ...normalized, id };
    }
  } else {
    normalized.id = 'event-' + Date.now();
    normalized.gallery = [];
    store.events.push(normalized);
  }
  
  saveStore(store);
  
  remotePost('save_event', { ...normalized, id });
  
  return listEvents({ includeInactive: true });
};

export const deleteEvent = async (id) => {
  const store = getStore();
  if (!store.events) store.events = [];
  store.events = store.events.filter(e => String(e.id) !== String(id));
  saveStore(store);
  
  remotePost('delete_event', { id });
};

export const addEventGalleryImage = async (eventId, payload) => {
  const store = getStore();
  if (!store.events) store.events = [];
  
  const idx = store.events.findIndex(e => String(e.id) === String(eventId));
  if (idx !== -1) {
    if (!store.events[idx].gallery) store.events[idx].gallery = [];
    
    const normalizedImage = {
      id: 'gallery-' + Date.now(),
      image_url: normalizeImagePath(payload.image_url || payload.image),
      caption: payload.caption || '',
      sort_order: Number(payload.sort_order || 0),
    };
    
    store.events[idx].gallery.push(normalizedImage);
    saveStore(store);
    
    remotePost('add_event_gallery', { event_id: eventId, ...normalizedImage });
  }
  
  return listEvents({ includeInactive: true });
};

export const deleteEventGalleryImage = async (imageId) => {
  const store = getStore();
  if (!store.events) store.events = [];
  
  for (let i = 0; i < store.events.length; i++) {
    if (store.events[i].gallery) {
      const originalLen = store.events[i].gallery.length;
      store.events[i].gallery = store.events[i].gallery.filter(img => String(img.id) !== String(imageId));
      if (store.events[i].gallery.length !== originalLen) {
        saveStore(store);
        break;
      }
    }
  }
  
  remotePost('delete_event_gallery', { id: imageId });
};

/* ==========================================
   5. BLOG SERVICES
   ========================================== */

export const listBlogs = async ({ includeDrafts = false } = {}) => {
  const store = getStore();
  const blogs = store.blogs || [];
  
  const items = includeDrafts ? blogs : blogs.filter(b => b.is_published === 1 || b.is_published === true);
  return items.map(item => ({
    ...item,
    image_url: normalizeImagePath(item.image_url || item.image || ''),
  }));
};

export const saveBlog = async (payload, id = null) => {
  const store = getStore();
  if (!store.blogs) store.blogs = [];
  
  const normalized = {
    ...payload,
    image_url: normalizeImagePath(payload.image_url || payload.image),
    is_published: payload.is_published === false ? 0 : 1,
  };

  if (id) {
    const idx = store.blogs.findIndex(b => String(b.id) === String(id));
    if (idx !== -1) {
      store.blogs[idx] = { ...store.blogs[idx], ...normalized, id };
    }
  } else {
    normalized.id = 'blog-' + Date.now();
    normalized.published_at = new Date().toISOString();
    store.blogs.push(normalized);
  }
  
  saveStore(store);
  
  remotePost('save_blog', { ...normalized, id });
  
  return listBlogs({ includeDrafts: true });
};

export const deleteBlog = async (id) => {
  const store = getStore();
  if (!store.blogs) store.blogs = [];
  store.blogs = store.blogs.filter(b => String(b.id) !== String(id));
  saveStore(store);
  
  remotePost('delete_blog', { id });
};

/* ==========================================
   6. ADMIN DASHBOARD SUMMARY
   ========================================== */

export const getAdminSummary = async ({ totalStudents = 0 } = {}) => {
  const [flagged, executives, events, blogs, settings] = await Promise.all([
    getStudentFlags().catch(() => []),
    listExecutives().catch(() => []),
    listEvents().catch(() => []),
    listBlogs().catch(() => []),
    getAcademicSettings().catch(() => ({ session: '2025/2026', semester: 'First Semester' })),
  ]);

  return {
    totalStudents,
    flaggedStudents: Array.isArray(flagged) ? flagged.filter(f => f.status === 'active').length : 0,
    executives: Array.isArray(executives) ? executives.length : 0,
    activeEvents: Array.isArray(events) ? events.length : 0,
    publishedBlogs: Array.isArray(blogs) ? blogs.length : 0,
    currentSession: settings.session || '2025/2026',
    currentSemester: settings.semester || 'First Semester',
  };
};
