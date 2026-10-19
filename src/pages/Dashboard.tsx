import { useState, useEffect, useRef } from "react";
import { 
  Copy, Check, ExternalLink, CreditCard, LayoutDashboard, LogOut, User, 
  AlertCircle, Save, Calendar, Home, Lock, ShieldCheck, BookOpen, 
  FileText, Download, Printer, QrCode, CheckCircle2, Search, Filter,
  GraduationCap, ArrowRight, ChevronRight, Award, Camera, Mail, Phone, Cake, Shield, Clock,
  ShoppingBag, Tag, Sparkles, Ticket, MapPin, Users, CheckSquare, PackageCheck,
  Eye, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { events as staticEvents } from "@/data/events";
import { fetchStudentProfile, updateStudentProfile, logoutStudent, markDuesPaid } from "@/lib/student-auth";
import { triggerKorapayCheckout } from "@/lib/korapay";
import { downloadFile, getDownloadUrl } from "@/lib/download";
import { downloadElementAsPdf } from "@/lib/pdf-service";
import { getStoreProducts, StoreProduct } from "@/lib/store-service";

import nassLogo from "@/assets/nass_logo.png";
import lasustechLogo from "@/assets/lasustech_logo.png";
import nassCustomLabcoat from "@/assets/nass_custom_labcoat.png";
const calendarImage = "/NASS_LASUSTECH_CALENDAR_2026_2027.png";
const calendarPdf = "/NASS_LASUSTECH_2026-2027_Calendar (1).pdf";
import { 
  academicCalendar, 
  firstSemesterCalendar, 
  secondSemesterCalendar, 
  sessionKeyMilestones, 
  generalElections2027,
  publicHolidays,
  academicSession 
} from "@/data/calendar";

const ACCOUNT_NUMBER = "1234567890";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 1. ALL HOOKS AT THE TOP
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "store" | "events" | "resources" | "profile">(() => {
    try {
      const validTabs = ["overview", "payments", "store", "events", "resources", "profile"];
      const searchTab = typeof window !== "undefined" ? (new URLSearchParams(window.location.search)).get("tab") : null;
      const initialTab = searchTab || location.state?.tab;
      if (initialTab) {
        if (initialTab === "idcard" || initialTab === "clearance") return "store";
        if (initialTab === "dues") return "payments";
        if (validTabs.includes(initialTab)) return initialTab as any;
      }
      const saved = localStorage.getItem("dashboard_active_tab");
      if (saved) {
        if (saved === "dues" || saved === "clearance") return "payments";
        if (saved === "idcard") return "store";
        if (validTabs.includes(saved)) return saved as any;
      }
    } catch (e) {
      console.error("Tab state error", e);
    }
    return "overview";
  });

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [initialEmailSet, setInitialEmailSet] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [amountOwing, setAmountOwing] = useState(2000);
  const [activities, setActivities] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [adminNotice, setAdminNotice] = useState<any>(null);
  const [academicSettings, setAcademicSettings] = useState({ session: "", semester: "" });
  
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    fullName: "",
    matricNumber: "",
    level: "",
    department: "Computer Science",
    birthday: "",
    email: "",
    whatsappNumber: "",
    gender: "",
    post: "",
    duesStatus: "Pending",
    idCardStatus: "Not Registered",
    attendance: 0,
    resources: 0,
    profileImage: null as string | null
  });

  const [resourceCategory, setResourceCategory] = useState("all");
  const [resourceLevel, setResourceLevel] = useState("all");
  const [resourceSearch, setResourceSearch] = useState("");

  // Store & Lab Essentials Ordering state
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [selectedStoreItem, setSelectedStoreItem] = useState<StoreProduct | null>(null);
  const [selectedLabcoatPreview, setSelectedLabcoatPreview] = useState<string | null>(null);
  const [orderSize, setOrderSize] = useState<"Small (S)" | "Medium (M)" | "Large (L)" | "Extra Large (XL)" | "2X Large (XXL)">("Large (L)");
  const [orderLabcoatName, setOrderLabcoatName] = useState("");
  const [orderJerseyName, setOrderJerseyName] = useState("");
  const [orderJerseyNumber, setOrderJerseyNumber] = useState("10");
  const [orderManualType, setOrderManualType] = useState<string>("Chemistry Practical Manual (CHM 107/108)");
  const [orderWhatsApp, setOrderWhatsApp] = useState("");

  // Payment Receipt Modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventWhatsApp, setEventWhatsApp] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [activePass, setActivePass] = useState<any>(null);

  // Official Academic Calendar state
  const [calendarPreviewOpen, setCalendarPreviewOpen] = useState(false);
  const [calendarSemesterFilter, setCalendarSemesterFilter] = useState<"all" | "first" | "second" | "milestones">("all");

  const [registeredEvents, setRegisteredEvents] = useState<any[]>(() => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const matric = user.matric_number || user.matricNumber || profile.matricNumber || "SCHOLAR";
      const saved = localStorage.getItem(`nass_registered_events_${matric}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [storeItems, setStoreItems] = useState<StoreProduct[]>(() => getStoreProducts());

  // Listen for admin store inventory changes in real-time
  useEffect(() => {
    const handleStoreSync = () => {
      setStoreItems(getStoreProducts());
    };
    window.addEventListener("storage", handleStoreSync);
    window.addEventListener("nass_store_updated", handleStoreSync);
    return () => {
      window.removeEventListener("storage", handleStoreSync);
      window.removeEventListener("nass_store_updated", handleStoreSync);
    };
  }, []);

  const collegiateEvents = [
    {
      id: "science-day",
      title: "Science Day 2026",
      theme: "Empirical Discovery, Technological Breakthroughs & Student Research",
      date: "Tuesday 10th November 2026",
      time: "9:00 AM",
      venue: "CBS Main Auditorium & Quadrangle",
      category: "Academic & Science",
      fee: "Free Entry",
      description: "The grand annual celebration of empirical science, research, and innovation across all constituent departments of the College of Basic Sciences, LASUSTECH. Featuring departmental exhibitions and keynote lectures.",
      speakers: ["Dean, College of Basic Sciences", "Faculty Board of Science", "NASS Executives"],
      status: "Scheduled",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      id: "cbs-orientation",
      title: "CBS Orientation Programme",
      theme: "Navigating Academic Excellence & Collegiate Leadership in Science",
      date: "Tuesday 17th November 2026",
      time: "10:00 AM",
      venue: "College Complex / University Hall",
      category: "Academic & Science",
      fee: "Free Entry",
      description: "Official collegiate induction and orientation for all newly admitted 100L scholars into the College of Basic Sciences. Meet college deans, department heads, faculty advisors, and executive leaders.",
      speakers: ["Dean of Basic Sciences", "Faculty Student Affairs Officer", "NASS Executive Council"],
      status: "Scheduled",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    },
    {
      id: "ecoinnovate-sdg",
      title: "ECOInnovate CBS: The SDG Challenge",
      theme: "Sustainable Development Goals Collegiate Challenge & Empirical Innovation",
      date: "Tuesday 24th November 2026",
      time: "10:00 AM",
      venue: "College Auditorium",
      category: "Academic & Science",
      fee: "Free Entry",
      description: "Empowering science scholars to design real-world empirical solutions aligned with the United Nations Sustainable Development Goals. Student paper presentations and innovation exhibits.",
      speakers: ["Faculty Research Committee", "Director of Innovation & SDG Initiatives"],
      status: "Scheduled",
      badgeColor: "bg-blue-100 text-[#1a4480] border-blue-300",
    },
    {
      id: "matriculation",
      title: "Matriculation Ceremony 2026",
      theme: "Official Induction of Fresh Scholars into LASUSTECH",
      date: "Wednesday 25th November 2026",
      time: "9:00 AM",
      venue: "LASUSTECH Convocation Ground",
      category: "Academic & Science",
      fee: "Free Entry",
      description: "The official university matriculation ceremony formally matriculating all fresh students into Lagos State University of Science and Technology. (*Notice: Date can change per University Senate announcement).",
      speakers: ["Vice-Chancellor", "University Senate", "Dean, College of Basic Sciences"],
      status: "Proposed Schedule",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    },
    {
      id: "carol-cultural-day",
      title: "Carol / Cultural Day 2026",
      theme: "Celebrating Heritage, Unity & Festive Harmony in Science",
      date: "Tuesday 15th December 2026",
      time: "11:00 AM",
      venue: "LASUSTECH Amphitheatre",
      category: "Social & Sports",
      fee: "Free Entry",
      description: "Year-end collegiate festive celebration featuring vibrant cultural displays, Christmas carols, departmental musical performances, and executive recognition honors.",
      speakers: ["Cultural & Welfare Committee", "Special Guests"],
      status: "Scheduled",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    },
    {
      id: "founders-day-convocation",
      title: "Convocation Ceremonies & Founder's Day",
      theme: "Honoring Academic Accomplishments & Institutional Heritage",
      date: "Jan 27 - Feb 2, 2027",
      time: "10:00 AM Daily",
      venue: "University Ceremonial Parade Grounds",
      category: "Academic & Science",
      fee: "Free Entry",
      description: "University-wide convocation ceremonies celebrating graduating scholars, with LASUSTECH Founder's Day commemorative lecture and exhibitions on 2nd February 2027.",
      speakers: ["University Governing Council", "Keynote Convocation Lecturer"],
      status: "Scheduled",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    },
    {
      id: "cbs-got-talent",
      title: "CBS GOT TALENT",
      theme: "Discovering Creative Brilliance, Arts, Music & Performance in Science",
      date: "Monday 12th April 2027",
      time: "12:00 NOON",
      venue: "CBS Main Auditorium",
      category: "Social & Sports",
      fee: "Free Entry",
      description: "The collegiate talent exhibition and creative arts championship. Science students contest across musical solos, spoken words, comedy, and stage artistry.",
      speakers: ["NASS Directorate of Socials", "Guest Celebrity Judges"],
      status: "Scheduled",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    },
    {
      id: "lasustech-wave",
      title: "LASUSTECH Wave",
      theme: "The Collegiate Youth & Creative Renaissance Fair",
      date: "Thursday 29th April 2027",
      time: "1:00 PM",
      venue: "LASUSTECH Sports Complex Arena",
      category: "Social & Sports",
      fee: "Free Entry",
      description: "The signature college-wide cultural festival and youth renaissance fair featuring live music concerts, games arena, and inter-departmental solidarity.",
      speakers: ["NASS Executive Council", "Student Brand Partners"],
      status: "Scheduled",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    },
    {
      id: "cbs-build-with-ai",
      title: "CBS Build with AI",
      theme: "Intelligent Computing, Applied Machine Learning & Algorithmic Discovery",
      date: "Wednesday 19th May 2027",
      time: "10:00 AM",
      venue: "CBS Tech Innovation Hub & Computer Laboratory",
      category: "Leadership & Training",
      fee: "Free Entry",
      description: "Flagship AI hackathon and hands-on workshop empowering basic science students to train predictive models, neural networks, and automated scientific pipelines.",
      speakers: ["Google Developer Experts", "Lead AI Research Fellows", "Industry Mentors"],
      status: "Scheduled",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
    }
  ];

  const defaultAcademicResources = [
    {
      id: "official-nass-calendar-2026-2027",
      code: "CALENDAR",
      title: "Official NASS LASUSTECH Academic Calendar (2026/2027 Session)",
      level: "All Levels (100L - 400L)",
      category: "Academic Calendar",
      department: "College of Basic Sciences",
      semester: "Full Session",
      fileSize: "790 KB",
      downloads: 3240,
      description: "Official collegiate academic calendar approved for the 2026/2027 session by CBS Deanery. Covers First & Second Semester lecture dates, Science Day, Matriculation, examinations, and holidays.",
      fileUrl: calendarPdf,
      fileName: "NASS_LASUSTECH_2026-2027_Calendar (1).pdf",
    },
    {
      id: "mth101",
      code: "MTH 101",
      title: "Elementary Mathematics I (Algebra & Trigonometry)",
      level: "100L",
      category: "Past Questions",
      department: "Mathematical Sciences",
      semester: "First Semester",
      fileSize: "2.8 MB",
      downloads: 1420,
      description: "Official 5-year past examination questions with step-by-step verified solutions and formula summary.",
    },
    {
      id: "phy101",
      code: "PHY 101",
      title: "General Physics I (Mechanics, Thermal & Waves)",
      level: "100L",
      category: "Past Questions",
      department: "Physics with Electronics",
      semester: "First Semester",
      fileSize: "3.4 MB",
      downloads: 1285,
      description: "Compiled departmental exam questions, derivation summaries, and worked numerical problems.",
    },
    {
      id: "chm101",
      code: "CHM 101",
      title: "General Chemistry I (Physical & Inorganic)",
      level: "100L",
      category: "Past Questions",
      department: "Chemical Sciences",
      semester: "First Semester",
      fileSize: "2.2 MB",
      downloads: 1190,
      description: "Comprehensive exam past questions covering atomic structure, bonding, chemical equilibrium, and thermodynamics.",
    },
    {
      id: "csc101",
      code: "CSC 101",
      title: "Introduction to Computer Science & Problem Solving",
      level: "100L",
      category: "Past Questions",
      department: "Computer Science",
      semester: "First Semester",
      fileSize: "1.9 MB",
      downloads: 1650,
      description: "Past questions, flowchart and algorithm exercises, and computer architecture fundamentals.",
    },
    {
      id: "bio101",
      code: "BIO 101",
      title: "General Biology I (Cell Biology & Genetics)",
      level: "100L",
      category: "Past Questions",
      department: "Biological Sciences",
      semester: "First Semester",
      fileSize: "3.1 MB",
      downloads: 980,
      description: "Past questions, labeled biological diagrams, and genetics problem sets for Basic Science scholars.",
    },
    {
      id: "phy107",
      code: "PHY 107",
      title: "General Physics Laboratory Practical Manual",
      level: "100L",
      category: "Lab Manuals",
      department: "Physics with Electronics",
      semester: "First Semester",
      fileSize: "4.5 MB",
      downloads: 1890,
      description: "Official practical guide covering mechanics experiments, vernier caliper measurements, and error analysis.",
    },
    {
      id: "chm107",
      code: "CHM 107",
      title: "General Chemistry Practical Guide & Safety Protocol",
      level: "100L",
      category: "Lab Manuals",
      department: "Chemical Sciences",
      semester: "First Semester",
      fileSize: "3.8 MB",
      downloads: 1740,
      description: "Titration curves, qualitative inorganic salt analysis, and laboratory bench safety protocol.",
    },
    {
      id: "cbs-safety",
      code: "CBS 001",
      title: "Central Laboratory Safety & Chemical Hygiene Manual",
      level: "General",
      category: "Lab Manuals",
      department: "College of Basic Sciences",
      semester: "Annual",
      fileSize: "1.5 MB",
      downloads: 2100,
      description: "Mandatory College of Basic Sciences lab safety protocols, biosafety levels, and hazardous chemical disposal.",
    },
    {
      id: "csc201",
      code: "CSC 201",
      title: "Computer Programming I (Structured & OOP Foundations)",
      level: "200L",
      category: "Past Questions",
      department: "Computer Science",
      semester: "First Semester",
      fileSize: "2.6 MB",
      downloads: 870,
      description: "200-level exam past papers, code walkthroughs, and OOP concept worksheets in Python/C++.",
    },
    {
      id: "mth201",
      code: "MTH 201",
      title: "Mathematical Methods & Vector Analysis",
      level: "200L",
      category: "Past Questions",
      department: "Mathematical Sciences",
      semester: "First Semester",
      fileSize: "2.4 MB",
      downloads: 740,
      description: "Differential equations, Fourier series, vector fields, and past examination problems with model solutions.",
    },
    {
      id: "bch201",
      code: "BCH 201",
      title: "General Biochemistry & Biomolecules",
      level: "200L",
      category: "Lecture Notes",
      department: "Biochemistry",
      semester: "First Semester",
      fileSize: "3.2 MB",
      downloads: 690,
      description: "Structure and function of proteins, nucleic acids, carbohydrates, lipids, and metabolic pathways.",
    },
    {
      id: "mcb201",
      code: "MCB 201",
      title: "General Microbiology & Microbial Techniques",
      level: "200L",
      category: "Lecture Notes",
      department: "Microbiology",
      semester: "First Semester",
      fileSize: "2.9 MB",
      downloads: 720,
      description: "Bacterial taxonomy, culturing methods, microscopy, and sterilization protocols in science labs.",
    },
  ];

  const [academicResources, setAcademicResources] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("nass_academic_resources");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Resources storage parse error", e);
    }
    return defaultAcademicResources;
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("nass_academic_resources");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAcademicResources(parsed);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("storage", handleSync);
    if (activeTab === "resources") {
      handleSync();
    }
    return () => window.removeEventListener("storage", handleSync);
  }, [activeTab]);

  const handleDownloadFile = async (fileUrl: string, filename: string) => {
    await downloadFile(fileUrl, filename);
  };

  const handleDownloadResource = async (res: any) => {
    if (res.fileUrl) {
      toast({
        title: `Downloading ${res.code}`,
        description: `${res.title} is downloading to your device.`,
      });
      await handleDownloadFile(res.fileUrl, res.fileName || `${res.code.replace(/\s+/g, '_')}_Material.pdf`);
      return;
    }
    toast({
      title: "Coming Soon",
      description: `Official past questions and study packs for ${res.code} (${res.title}) will be available for download soon.`,
    });
  };

  const API_BASE = "https://nacosid.tmb.it.com/";


  const getProfileImage = (img: string | null) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    const cleanPath = img.startsWith('/') ? img.substring(1) : img;
    return `${API_BASE}${cleanPath}`;
  };


  // Helper to hash email for privacy
  const hashEmail = (email: string) => {
    if (!email) return "Not set up";
    const [name, domain] = email.split("@");
    if (name.length <= 3) return `${name.substring(0, 1)}***@${domain}`;
    const visibleName = name.substring(0, 3);
    const domainParts = domain.split(".");
    const tld = domainParts.pop();
    const domainName = domainParts.join(".");
    const maskedDomain = domainName.length > 2 ? `${domainName.substring(0, 2)}***` : "***";
    return `${visibleName}*******@${maskedDomain}.${tld}`;
  };


  const handleRequestOtp = async () => {
    if (!profile.email) {
      toast({ 
        title: "Email Missing", 
        description: "You haven't set up your email yet. Please contact the admin on WhatsApp at +234 802 632 2742.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      await fetchApi('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ matric_number: profile.matricNumber })
      });
      setOtpSent(true);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${hashEmail(profile.email)}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    localStorage.setItem("dashboard_active_tab", activeTab);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      const tabParam = (new URLSearchParams(window.location.search)).get("tab");
      if (tabParam) {
        if (tabParam === "idcard" || tabParam === "clearance") setActiveTab("store");
        else if (tabParam === "dues") setActiveTab("payments");
        else if (["overview", "payments", "store", "events", "resources", "profile"].includes(tabParam)) {
          setActiveTab(tabParam as any);
        }
      }
    } catch (e) {}
  }, [location.search]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileMenu && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showMobileMenu]);

  // Listen for storage events to re-sync active student session across tabs and modals
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const activeUserStr = localStorage.getItem("user");
        if (activeUserStr) {
          const u = JSON.parse(activeUserStr);
          const cleanName = String(u.full_name || u.name || "").trim().toUpperCase();
          setProfile(prev => ({
            ...prev,
            fullName: cleanName || prev.fullName,
            matricNumber: u.matric_no || prev.matricNumber,
            department: u.department || prev.department,
            level: u.level || prev.level,
            email: u.email || prev.email,
            duesStatus: u.dues_status || prev.duesStatus,
            idCardStatus: u.id_card_status || prev.idCardStatus,
            post: u.department ? `${u.department} Scholar` : prev.post,
          }));
        }
      } catch (e) {}
    };
    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, []);

  useEffect(() => {
    // Purge any legacy NACOS cache that could bleed from earlier sessions
    localStorage.removeItem("dashboard_data");

    const currentSessionMatric = localStorage.getItem("student_matric") || (JSON.parse(localStorage.getItem("user") || "{}")).matric_no || "";
    const activeUserStr = localStorage.getItem("user");
    const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;

    // If no authenticated student session exists at all, redirect to home with sign-in prompt
    if (!currentSessionMatric && !activeUser) {
      toast({
        title: "Portal Sign In Required",
        description: "Please sign in or register to access the student dashboard.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
      return;
    }

    // Sync active local user session immediately for zero-flicker UI
    if (activeUser) {
      const isDuesPaid = activeUser.dues_status === "Paid" || (currentSessionMatric && localStorage.getItem(`nass_dues_${currentSessionMatric}`) === "Paid");
      const cleanUpperName = String(activeUser.full_name || activeUser.name || "").trim().toUpperCase();
      if (activeUser.full_name !== cleanUpperName || activeUser.name !== cleanUpperName) {
        activeUser.full_name = cleanUpperName;
        activeUser.name = cleanUpperName;
        localStorage.setItem("user", JSON.stringify(activeUser));
      }

      setProfile(prev => ({
        ...prev,
        fullName: cleanUpperName || prev.fullName,
        matricNumber: activeUser.matric_no || currentSessionMatric || prev.matricNumber,
        department: activeUser.department || prev.department,
        level: activeUser.level || prev.level,
        email: activeUser.email || prev.email,
        duesStatus: isDuesPaid ? "Paid" : (activeUser.dues_status || prev.duesStatus || "Pending"),
        idCardStatus: isDuesPaid ? "Ready" : (activeUser.id_card_status || prev.idCardStatus || "Not Registered"),
        post: activeUser.department ? `${activeUser.department} Scholar` : "Science Student",
      }));
      setLoading(false);
    }

    const fetchDashboardData = async () => {
      try {
        const currentMatric = localStorage.getItem("student_matric") || (JSON.parse(localStorage.getItem("user") || "{}")).matric_no || "";
        const localUserStr = localStorage.getItem("user");
        const localUser = localUserStr ? JSON.parse(localUserStr) : null;

        if (!currentMatric && !localUser) {
          navigate("/", { replace: true });
          return;
        }

        // 1. Fetch live Supabase profile
        let liveStudent = null;
        if (currentMatric) {
          try {
            liveStudent = await fetchStudentProfile(currentMatric);
          } catch (supaErr) {
            console.warn("Supabase profile load notice:", supaErr);
          }
        }

        const studentName = String(liveStudent?.full_name || localUser?.full_name || localUser?.name || "Science Scholar").trim().toUpperCase();
        const studentMatric = liveStudent?.matric_number || localUser?.matric_no || currentMatric;
        const studentDept = liveStudent?.department || localUser?.department || "Basic Sciences";
        const studentLevel = liveStudent?.level || localUser?.level || "100L";
        const studentEmail = liveStudent?.email || localUser?.email || "";

        const isDuesPaid = Boolean(
          liveStudent?.dues_status?.toLowerCase() === "paid" ||
          localUser?.dues_status?.toLowerCase() === "paid" ||
          (studentMatric && localStorage.getItem(`nass_dues_${studentMatric}`) === "Paid")
        );

        // Load student's verified payments
        const storedVerifiedPayments = (() => {
          try {
            const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
            return Array.isArray(list) ? list : [];
          } catch (e) {
            return [];
          }
        })();

        const studentPaymentsList = storedVerifiedPayments.filter((p: any) =>
          (studentMatric && p.matric_number === studentMatric) ||
          (studentEmail && p.email === studentEmail)
        );

        if (isDuesPaid && !studentPaymentsList.some((p: any) => String(p.payment_type || '').toLowerCase().includes("due") && p.status === "Paid")) {
          studentPaymentsList.unshift({
            id: `pay-dues-${studentMatric}`,
            reference: `NASS-DUES-${studentMatric}`,
            student_name: studentName,
            matric_number: studentMatric,
            department: studentDept,
            level: studentLevel,
            payment_type: "2025/2026 Session Dues",
            amount: 2000,
            channel: "Korapay Online",
            status: "Paid",
            created_at: liveStudent?.dues_paid_at || new Date().toISOString(),
          });
        }

        setProfile(prev => ({
          ...prev,
          fullName: studentName,
          matricNumber: studentMatric,
          department: studentDept,
          level: studentLevel,
          email: studentEmail,
          whatsappNumber: liveStudent?.phone || localUser?.phone || prev.whatsappNumber,
          duesStatus: isDuesPaid ? "Paid" : "Pending",
          idCardStatus: isDuesPaid ? "Ready" : "Not Registered",
          post: studentDept ? `${studentDept} Scholar` : "Science Student",
          profileImage: liveStudent?.avatar_url || prev.profileImage || null,
        }));

        setPayments(studentPaymentsList);
        setAmountOwing(isDuesPaid || studentPaymentsList.some((p: any) => String(p.payment_type || '').toLowerCase().includes("due") && p.status === "Paid") ? 0 : 2000);
        setAcademicSettings({ session: "2025/2026", semester: "First Semester" });
      } catch (error: any) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const isProfileIncomplete = !profile.fullName || !profile.matricNumber || !profile.level || !profile.birthday;

  const handleLogout = () => {
    logoutStudent();
    toast({ title: "Logged out", description: "You have been successfully logged out." });
    navigate("/");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  useEffect(() => {
    if (profile.email && !initialEmailSet) {
      setInitialEmailSet(true);
    }
  }, [profile.email]);

  const handleUploadProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profile.matricNumber) {
        await updateStudentProfile(profile.matricNumber, {
          full_name: profile.fullName,
          level: profile.level,
          email: profile.email,
          phone: profile.whatsappNumber,
          gender: profile.gender,
        });
        toast({ title: "Profile Updated", description: "Your changes have been saved to Supabase." });
        setIsDirty(false);
        setActiveTab("overview");
        return;
      }

      const result = await fetchApi('/student/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: profile.fullName,
          level: profile.level,
          email: profile.email,
          whatsapp_number: profile.whatsappNumber,
          gender: profile.gender,
          birthday: profile.birthday
        })
      });

      if (result.status === 'success' || result.message?.includes('success') || result.id) {
        toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
        setIsDirty(false); // Reset dirty state
        
        // Update Local User storage for Navbar and persistence
        try {
          const userStr = localStorage.getItem("user");
          const user = (userStr && userStr !== "null") ? JSON.parse(userStr) : {};
          if (user && typeof user === 'object') {
            user.name = String(profile.fullName);
            user.email = String(profile.email);
            user.post = String(profile.post);
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch (e) {
          console.error("Local storage update error:", e);
        }

        // fetchDashboardData(); // Force refresh everything from cloud
        setActiveTab("overview");
      } else {
        toast({ 
          title: "Update Failed", 
          description: result.message || "The central system could not save your changes.", 
          variant: "destructive" 
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update profile.", variant: "destructive" });
    }
  };

  // Freshers Matriculation Number Update State
  const [freshersMatricInput, setFreshersMatricInput] = useState("");
  const [savingOfficialMatric, setSavingOfficialMatric] = useState(false);

  const isFresherScholar =
    profile.matricNumber?.toUpperCase().startsWith("FSH") ||
    profile.matricNumber?.includes("FSH") ||
    profile.level === "100L";

  const handleSaveOfficialMatric = async () => {
    const cleanNewMatric = freshersMatricInput.trim().toUpperCase();
    if (!cleanNewMatric) {
      toast({
        title: "Matriculation Number Required",
        description: "Please enter your official university matriculation number.",
        variant: "destructive",
      });
      return;
    }

    if (cleanNewMatric === profile.matricNumber) {
      toast({ title: "Notice", description: "This is already your active matric number." });
      return;
    }

    setSavingOfficialMatric(true);
    const oldMatric = profile.matricNumber;

    try {
      // 1. Update live Supabase profile
      if (oldMatric) {
        await updateStudentProfile(oldMatric, {
          matric_number: cleanNewMatric,
        });
      }

      // 2. Update localStorage active matric and dues clearance
      localStorage.setItem("student_matric", cleanNewMatric);
      localStorage.setItem(`nass_dues_${cleanNewMatric}`, "Paid");

      // 3. Update localStorage user object
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          u.matric_no = cleanNewMatric;
          u.matric_number = cleanNewMatric;
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (e) {}

      // 4. Update verified payment records for this student
      try {
        const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
        const updatedList = list.map((p: any) => {
          if (p.matric_number === oldMatric || p.student_name === profile.fullName) {
            return { ...p, matric_number: cleanNewMatric };
          }
          return p;
        });
        localStorage.setItem("nass_verified_payments", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}

      // 5. Update local component state
      setProfile((prev) => ({ ...prev, matricNumber: cleanNewMatric }));
      setFreshersMatricInput("");

      toast({
        title: "Official Matriculation Number Saved!",
        description: `Your profile has been upgraded to official LASUSTECH matric: ${cleanNewMatric}.`,
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.message || "Could not save official matriculation number.",
        variant: "destructive",
      });
    } finally {
      setSavingOfficialMatric(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      toast({ title: "Uploading...", description: "Compressing and saving your photo." });
      const data = await fetchApi('/student/profile-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'undefined' }, // Let browser set boundary for FormData
        body: formData
      });
      
      const newImage = data.imageUrl;
      setProfile({ ...profile, profileImage: newImage });

      // Update User storage for Navbar sync
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        user.profile_image = newImage;
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.error("Local storage update error:", e);
      }

      toast({ title: "Success", description: "Profile picture updated successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload image.", variant: "destructive" });
    }
  };

  const handleDirectDuesClearance = async (channelName = "Collegiate Direct Transfer") => {
    const studentEmail = profile.email || `${profile.matricNumber || 'student'}@lasustech.edu.ng`;
    const cleanMatric = (profile.matricNumber || "SCHOLAR").replace(/[^A-Za-z0-9]/g, "");
    const ref = `NASS-DUES-${cleanMatric}-${Date.now().toString().slice(-4)}`;

    const confirmedRecord = {
      id: `pay-dues-${profile.matricNumber || Date.now()}`,
      reference: ref,
      student_name: profile.fullName || "Student Scholar",
      matric_number: profile.matricNumber || "",
      department: profile.department || "Basic Sciences",
      level: profile.level || "100L",
      payment_type: "2025/2026 Session Dues",
      amount: 2000,
      channel: channelName,
      status: "Paid",
      created_at: new Date().toISOString(),
    };

    try {
      const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      const updated = [confirmedRecord, ...list.filter((p: any) => p.reference !== ref)];
      localStorage.setItem("nass_verified_payments", JSON.stringify(updated));
      if (profile.matricNumber) {
        localStorage.setItem(`nass_dues_${profile.matricNumber}`, "Paid");
        markDuesPaid({
          matricNumber: profile.matricNumber,
          reference: ref,
          fullName: profile.fullName || "Student Scholar",
          email: studentEmail,
          department: profile.department || "Basic Sciences",
          level: profile.level || "100L",
          amount: 2000,
        }).catch(console.warn);
      }
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.dues_status = "Paid";
        localStorage.setItem("user", JSON.stringify(u));
      }
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setProfile(prev => ({ ...prev, duesStatus: "Paid", idCardStatus: "Ready" }));
    setAmountOwing(0);
    setPayments(prev => [confirmedRecord, ...prev.filter(p => p.reference !== ref)]);

    toast({
      title: "Payment Confirmed • Official Receipt Issued!",
      description: "Your ₦2,000 collegiate session dues have been recorded and cleared.",
    });

    setActiveReceipt(confirmedRecord);
    setReceiptModalOpen(true);
  };

  const handlePayment = async () => {
    const studentEmail = profile.email || `${profile.matricNumber || 'student'}@lasustech.edu.ng`;
    const studentName = profile.fullName || "NASS Student";
    const cleanMatric = (profile.matricNumber || "SCHOLAR").replace(/[^A-Za-z0-9]/g, "");
    const ref = `NASS-DUES-${cleanMatric}-${Date.now().toString().slice(-4)}`;

    // Record initiated transaction in state and storage
    const initiatedRecord = {
      id: `pay-dues-${profile.matricNumber || Date.now()}`,
      reference: ref,
      student_name: profile.fullName || "Student Scholar",
      matric_number: profile.matricNumber || "",
      department: profile.department || "Basic Sciences",
      level: profile.level || "100L",
      payment_type: "2025/2026 Session Dues",
      amount: 2000,
      channel: "Korapay Online",
      status: "Initiated",
      created_at: new Date().toISOString(),
    };

    try {
      const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      const filtered = list.filter((p: any) => p.reference !== ref);
      localStorage.setItem("nass_verified_payments", JSON.stringify([initiatedRecord, ...filtered]));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setPayments(prev => [initiatedRecord, ...prev.filter(p => p.reference !== ref)]);

    toast({ title: "Opening Gateway...", description: "Connecting to Korapay checkout." });

    // Launch Korapay inline modal with Live Public Key
    const opened = await triggerKorapayCheckout({
      amount: 2000,
      email: studentEmail,
      name: studentName,
      reference: ref,
      merchant_bears_cost: false,
      narration: `NASS LASUSTECH Session Dues - ${profile.matricNumber || studentName}`,
      onSuccess: () => {
        handleDirectDuesClearance("Korapay Online");
      },
      onClose: () => {
        toast({ title: "Checkout Closed", description: "Korapay payment modal closed. You can resume this payment anytime or use Direct Transfer." });
      },
      onFailed: (err: any) => {
        toast({ title: "Payment Incomplete", description: err?.message || "Transaction could not be completed.", variant: "destructive" });
      }
    });

    if (!opened) {
      toast({ 
        title: "Gateway Inline Blocked", 
        description: "Browser blocked the payment popup. You can click 'Direct Bank Transfer / Instant Receipt Verification' to complete clearance.", 
        variant: "destructive" 
      });
    }
  };

  const handleResumePayment = async (pay: any) => {
    const studentEmail = profile.email || `${profile.matricNumber || 'student'}@lasustech.edu.ng`;
    const studentName = profile.fullName || "NASS Student";
    const rawAmt = pay.amount || 2000;
    const finalAmount = rawAmt > 10000 ? rawAmt / 100 : rawAmt;
    const ref = pay.reference || `NASS-PAY-${Date.now()}`;

    toast({ title: "Opening Gateway...", description: `Connecting to Korapay checkout for ${pay.payment_type}.` });

    await triggerKorapayCheckout({
      amount: finalAmount,
      email: studentEmail,
      name: studentName,
      reference: ref,
      merchant_bears_cost: false,
      narration: `NASS LASUSTECH: ${pay.payment_type}`,
      onSuccess: () => {
        const confirmedRecord = {
          ...pay,
          reference: ref,
          status: "Paid",
          created_at: new Date().toISOString(),
        };

        try {
          const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
          const updated = [confirmedRecord, ...list.filter((p: any) => p.reference !== pay.reference && p.reference !== ref)];
          localStorage.setItem("nass_verified_payments", JSON.stringify(updated));
          if (String(pay.payment_type).toLowerCase().includes("due")) {
            if (profile.matricNumber) {
              localStorage.setItem(`nass_dues_${profile.matricNumber}`, "Paid");
            }
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const u = JSON.parse(userStr);
              u.dues_status = "Paid";
              localStorage.setItem("user", JSON.stringify(u));
            }
            setProfile(prev => ({ ...prev, duesStatus: "Paid", idCardStatus: "Ready" }));
            setAmountOwing(0);
          }
          window.dispatchEvent(new Event("storage"));
        } catch (e) {}

        setPayments(prev => [confirmedRecord, ...prev.filter(p => p.reference !== pay.reference && p.reference !== ref)]);
        
        toast({
          title: "Payment Confirmed!",
          description: `Your payment for ${pay.payment_type} has been confirmed. Your official receipt is ready.`,
        });

        // Immediately issue the receipt
        setActiveReceipt(confirmedRecord);
        setReceiptModalOpen(true);
      },
      onClose: () => {
        toast({ title: "Checkout Closed", description: "Payment was not completed." });
      },
      onFailed: (err: any) => {
        toast({ title: "Payment Incomplete", description: err?.message || "Transaction could not be completed.", variant: "destructive" });
      }
    });
  };

  const handleResetDuesToPending = () => {
    if (profile.matricNumber) {
      localStorage.removeItem(`nass_dues_${profile.matricNumber}`);
    }
    try {
      const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      const filtered = list.filter((p: any) => p.matric_number !== profile.matricNumber);
      localStorage.setItem("nass_verified_payments", JSON.stringify(filtered));
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.dues_status = "Pending";
        localStorage.setItem("user", JSON.stringify(u));
      }
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
    setProfile(prev => ({ ...prev, duesStatus: "Pending", idCardStatus: "Not Registered" }));
    setAmountOwing(2000);
    setPayments([]);
    toast({ title: "Account Ready for Testing", description: "Dues status reset to Pending (₦2,000 owing). You can now test payment through Korapay." });
  };

  const handleIdCardRequest = async () => {
    try {
      toast({ title: "Processing...", description: "Opening payment portal for ID replacement." });
      const data = await fetchApi('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          email: profile.email || `${profile.matricNumber}@lasustech.edu.ng`,
          amount: 500, // Replacement fee
          payment_type: 'id_replacement'
        })
      });
      
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data.message || "Could not initialize replacement request.");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to initialize replacement request.", variant: "destructive" });
    }
  };

  const handleInitiateStorePayment = (item: StoreProduct) => {
    setSelectedStoreItem(item);
    const savedWa = profile.whatsappNumber || localStorage.getItem("student_whatsapp") || "";
    setOrderWhatsApp(savedWa);
    setOrderLabcoatName(profile.fullName || "");
    if (item.category === "jersey") {
      const surname = profile.fullName ? profile.fullName.trim().split(' ')[0].toUpperCase() : "";
      setOrderJerseyName(surname);
      setOrderJerseyNumber("10");
      setOrderSize("Large (L)");
    } else if (item.category === "manual") {
      setOrderManualType("Chemistry Practical Manual (CHM 107/108)");
    }
    setStoreModalOpen(true);
  };

  const handleConfirmStoreOrder = async () => {
    if (!selectedStoreItem) return;

    const cleanWa = orderWhatsApp.trim().replace(/\s+/g, '');
    if (!cleanWa || cleanWa.length < 10) {
      toast({
        title: "WhatsApp Number Required",
        description: "Please provide a valid WhatsApp phone number (e.g. 08012345678) so the Secretariat can alert you for kit collection.",
        variant: "destructive"
      });
      return;
    }

    let finalPrice = selectedStoreItem.price;
    let finalTitle = selectedStoreItem.title;
    let cleanEmbroideryName = "";
    let cleanJerseyName = "";
    let cleanJerseyNumber = "10";

    if (selectedStoreItem.category === "labcoat") {
      cleanEmbroideryName = orderLabcoatName.trim().toUpperCase();
      if (!cleanEmbroideryName) {
        toast({
          title: "Embroidered Name Required",
          description: "Please enter the custom name you want embroidered on your lab coat (e.g. ADEGOKE M. A.).",
          variant: "destructive"
        });
        return;
      }
      finalTitle = `Official CBS Lab Coat (${orderSize}) - [${cleanEmbroideryName}]`;
    } else if (selectedStoreItem.category === "jersey") {
      cleanJerseyName = orderJerseyName.trim().toUpperCase();
      cleanJerseyNumber = orderJerseyNumber.trim() || "10";
      if (!cleanJerseyName) {
        toast({
          title: "Jersey Name Required",
          description: "Please enter the surname or nickname you want printed on the back of your jersey.",
          variant: "destructive"
        });
        return;
      }
      finalTitle = `CBS Customised Sport Jersey (${orderSize}) - [${cleanJerseyName} #${cleanJerseyNumber}]`;
      finalPrice = selectedStoreItem.price || 5500;
    } else if (selectedStoreItem.category === "manual") {
      finalTitle = orderManualType;
      if (orderManualType.includes("3-in-1")) {
        finalPrice = 7000;
      } else {
        finalPrice = selectedStoreItem.price || 2500;
      }
    } else {
      finalTitle = selectedStoreItem.title;
      finalPrice = selectedStoreItem.price;
    }

    if (!selectedStoreItem.priceConfirmed || finalPrice <= 0) {
      toast({
        title: "Price Confirmation Pending",
        description: `Official collegiate price for ${finalTitle} has not been confirmed yet by the CBS Deanery/Secretariat. Please check back later.`,
      });
      return;
    }

    const studentEmail = profile.email || `${profile.matricNumber || 'student'}@lasustech.edu.ng`;
    const studentName = profile.fullName || "NASS Student";
    const ref = `NASS-${selectedStoreItem.category.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Record initiated transaction
    const initiatedRecord = {
      id: `pay-${selectedStoreItem.category}-${Date.now()}`,
      reference: ref,
      student_name: studentName,
      matric_number: profile.matricNumber || "",
      department: profile.department || "Basic Sciences",
      level: profile.level || "100L",
      payment_type: finalTitle,
      amount: finalPrice,
      whatsapp_number: cleanWa,
      size: (selectedStoreItem.category === "labcoat" || selectedStoreItem.category === "jersey") ? orderSize : undefined,
      labcoat_name: selectedStoreItem.category === "labcoat" ? cleanEmbroideryName : undefined,
      jersey_name: selectedStoreItem.category === "jersey" ? cleanJerseyName : undefined,
      jersey_number: selectedStoreItem.category === "jersey" ? cleanJerseyNumber : undefined,
      channel: "Korapay Online",
      status: "Initiated",
      created_at: new Date().toISOString(),
    };

    try {
      const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      const filtered = list.filter((p: any) => p.reference !== ref);
      localStorage.setItem("nass_verified_payments", JSON.stringify([initiatedRecord, ...filtered]));
      localStorage.setItem("student_whatsapp", cleanWa);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setPayments(prev => [initiatedRecord, ...prev.filter(p => p.reference !== ref)]);

    setStoreModalOpen(false);
    toast({ title: "Opening Gateway...", description: `Connecting to Korapay checkout for ${finalTitle}.` });

    const opened = await triggerKorapayCheckout({
      amount: finalPrice,
      email: studentEmail,
      name: studentName,
      reference: ref,
      merchant_bears_cost: false,
      narration: `NASS LASUSTECH: ${finalTitle} (WA: ${cleanWa})`,
      onSuccess: () => {
        const confirmedRecord = {
          ...initiatedRecord,
          status: "Paid",
          created_at: new Date().toISOString(),
        };

        try {
          const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
          const updated = [confirmedRecord, ...list.filter((p: any) => p.reference !== ref)];
          localStorage.setItem("nass_verified_payments", JSON.stringify(updated));
          localStorage.setItem("student_whatsapp", cleanWa);
          window.dispatchEvent(new Event("storage"));
        } catch (e) {}

        setPayments(prev => [confirmedRecord, ...prev.filter(p => p.reference !== ref)]);

        toast({
          title: "Payment Confirmed!",
          description: `Your order for ${finalTitle} has been verified! Your official payment receipt is ready.`,
        });

        // Immediately issue the receipt
        setActiveReceipt(confirmedRecord);
        setReceiptModalOpen(true);
        setActiveTab("payments");
      },
      onClose: () => {
        toast({ title: "Order Pending", description: "Payment was not completed. You can resume this payment anytime from Payment History." });
      },
      onFailed: (err: any) => {
        toast({ title: "Payment Incomplete", description: err?.message || "Transaction could not be completed.", variant: "destructive" });
      }
    });

    if (!opened) {
      toast({ title: "Gateway Notice", description: "Korapay checkout modal could not be launched. Please check network connection.", variant: "destructive" });
    }
  };

  const handleOpenEventRegistration = (event: typeof collegiateEvents[0]) => {
    setSelectedEvent(event);
    const savedWa = profile.whatsappNumber || localStorage.getItem("student_whatsapp") || "";
    setEventWhatsApp(savedWa);
    setEventModalOpen(true);
  };

  const handleConfirmEventRegistration = () => {
    if (!selectedEvent) return;

    const cleanWa = eventWhatsApp.trim().replace(/\s+/g, '');
    if (!cleanWa || cleanWa.length < 10) {
      toast({
        title: "WhatsApp Number Required",
        description: "Please provide a valid WhatsApp phone number so event updates, room allocations, and your accreditation barcode can be dispatched to you.",
        variant: "destructive"
      });
      return;
    }

    const matric = profile.matricNumber || "SCHOLAR";
    const passCode = `CBS-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPass = {
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventTheme: selectedEvent.theme,
      date: selectedEvent.date,
      time: selectedEvent.time,
      venue: selectedEvent.venue,
      studentName: profile.fullName || "NASS Scholar",
      matricNumber: matric,
      department: profile.department || "Basic Sciences",
      level: profile.level || "100L",
      whatsappNumber: cleanWa,
      passCode,
      registeredAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(`nass_registered_events_${matric}`) || "[]");
      const updated = [newPass, ...existing.filter((e: any) => e.eventId !== selectedEvent.id)];
      localStorage.setItem(`nass_registered_events_${matric}`, JSON.stringify(updated));
      localStorage.setItem("student_whatsapp", cleanWa);
      setRegisteredEvents(updated);
    } catch (e) {}

    setEventModalOpen(false);
    toast({
      title: "Accreditation Confirmed!",
      description: `You are successfully registered for ${selectedEvent.title}. Your Digital Event Pass is ready!`,
    });

    setActivePass(newPass);
    setPassModalOpen(true);
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadReceiptPdf = async () => {
    if (!activeReceipt) return;
    try {
      setDownloadingPdf(true);
      toast({
        title: "Generating PDF Receipt",
        description: "Preparing your official collegiate payment receipt for download...",
      });
      const ref = activeReceipt.reference || activeReceipt.transaction_reference || profile.matricNumber || "RECEIPT";
      const success = await downloadElementAsPdf("printable-receipt", {
        filename: `NASS_Receipt_${ref}.pdf`,
        docTitle: "NASS LASUSTECH - Official Payment Receipt",
      });
      if (success) {
        toast({
          title: "Download Complete!",
          description: "Official receipt PDF saved to your device.",
        });
      } else {
        toast({
          title: "Download Notice",
          description: "Falling back to print view...",
        });
        printElementById("printable-receipt", "NASS LASUSTECH - Official Payment Receipt");
      }
    } catch (err) {
      console.error("PDF download error:", err);
      printElementById("printable-receipt", "NASS LASUSTECH - Official Payment Receipt");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const printElementById = (elementId: string, docTitle: string = "NASS LASUSTECH Document") => {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }

    // Clean up any existing print iframes
    const oldIframe = document.getElementById("nass-print-iframe");
    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.removeChild(oldIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "nass-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "794px";
    iframe.style.height = "1123px";
    iframe.style.border = "none";
    iframe.style.opacity = "0.01";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    // Collect all active stylesheets and CSS link tags
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(tag => tag.outerHTML)
      .join('\n');

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${docTitle}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 6px !important;
              width: 100% !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            }
            .no-print {
              display: none !important;
            }
            #${elementId} {
              display: block !important;
              width: 100% !important;
              max-width: 760px !important;
              margin: 0 auto !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    const executePrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print invocation error:", err);
        window.print();
      } finally {
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 3000);
      }
    };

    // Ensure images (e.g. logos) inside the iframe are fully loaded before print dialog opens
    const images = Array.from(frameDoc.querySelectorAll('img'));
    if (images.length === 0) {
      setTimeout(executePrint, 250);
    } else {
      let loaded = 0;
      let finished = false;
      const onImageReady = () => {
        loaded++;
        if (loaded >= images.length && !finished) {
          finished = true;
          setTimeout(executePrint, 150);
        }
      };

      images.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          onImageReady();
        } else {
          img.onload = onImageReady;
          img.onerror = onImageReady;
        }
      });

      // Fallback timeout in case some image events don't fire
      setTimeout(() => {
        if (!finished) {
          finished = true;
          executePrint();
        }
      }, 500);
    }
  };

  if (loading) {
    return (
      <Layout noReveal>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout noReveal>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        {/* Mobile Sticky Header */}
        <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-emerald-950/60 bg-[#041c14] text-white px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-white p-1 shadow-xs flex items-center justify-center shrink-0 border border-white/30">
                <img src={nassLogo} alt="NASS" className="h-full w-full object-contain" />
              </div>
              <div className="h-7 w-7 rounded-full bg-white p-1 shadow-xs flex items-center justify-center shrink-0 border border-white/30">
                <img src={lasustechLogo} alt="LASUSTECH" className="h-full w-full object-contain" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black tracking-wide uppercase text-white leading-none">NASS LASUSTECH</p>
              <p className="text-[9px] font-semibold text-emerald-300 uppercase tracking-widest mt-0.5">DEVMOH-Led Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative" ref={mobileMenuRef}>
             <div className="text-right">
                <p className="text-[11px] font-bold text-white leading-none">
                  {String(profile.fullName || 'Member').split(' ')[0]}
                </p>
                <p className="text-[8.5px] font-semibold text-emerald-300 uppercase tracking-wider mt-1">
                  {profile.post && String(profile.post).toLowerCase() !== 'student' 
                    ? String(profile.post)
                    : (profile.department ? `${profile.department} Scholar` : 'Scholar')}
                </p>
             </div>
             <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="relative h-10 w-10 rounded-full border-2 border-emerald-400/50 shadow-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              >
                {(() => {
                  let user: any = {};
                  try {
                    const userStr = localStorage.getItem("user");
                    user = (userStr && userStr !== "null") ? JSON.parse(userStr) : {};
                    if (!user || typeof user !== 'object') user = {};
                  } catch (e) {
                    console.error("Header user parse error", e);
                  }
                  
                  const rawProfileImage = user.profile_image || user.profileImage || profile.profileImage;
                  if (rawProfileImage && typeof rawProfileImage === 'string') {
                    const src = rawProfileImage.startsWith('http') 
                      ? rawProfileImage 
                      : `${API_BASE}${rawProfileImage.startsWith('/') ? rawProfileImage.substring(1) : rawProfileImage}`;
                    return <img src={src} className="h-full w-full object-cover" alt="Profile" />;
                  }
                  return (
                    <div className="h-full w-full bg-emerald-950 flex items-center justify-center">
                       <User className="h-5 w-5 text-emerald-300" />
                    </div>
                  );
               })()}
             </button>

             {/* Mobile Profile Dropdown */}
             {showMobileMenu && (
               <>
                 <div 
                   className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
                   onClick={() => setShowMobileMenu(false)}
                 />
                 <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-white/10 bg-[#062018] p-2 shadow-2xl text-white animate-reveal-fast">
                    <Link 
                      to="/" 
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Home className="h-4 w-4" />
                      Back to Website
                    </Link>
                    <div className="my-1 h-px bg-white/10" />
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                 </div>
               </>
             )}
          </div>
        </header>

        {/* Sidebar / Desktop Nav */}
        <aside className="hidden border-r border-emerald-950/60 bg-[#041c14] text-white lg:block lg:w-72 shrink-0 h-screen sticky top-0 overflow-y-auto shadow-2xl select-none">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10">
            {/* Logos & Institutional Chapter Name Card */}
            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 shadow-lg backdrop-blur-md hover:border-emerald-500/30 transition-all flex flex-col items-center">
              <div className="flex items-center justify-center gap-2.5">
                <div className="h-12 w-12 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white/30 ring-1 ring-emerald-400/20">
                  <img src={nassLogo} alt="NASS" className="h-full w-full object-contain" />
                </div>
                <div className="h-12 w-12 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white/30 ring-1 ring-emerald-400/20">
                  <img src={lasustechLogo} alt="LASUSTECH" className="h-full w-full object-contain" />
                </div>
              </div>
              
              {/* NASS LASUSTECH positioned beneath the logos */}
              <div className="mt-3 text-center w-full">
                <h1 className="font-display font-black text-sm tracking-wider text-white uppercase drop-shadow-sm">
                  NASS LASUSTECH
                </h1>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[9.5px] font-bold text-emerald-300 uppercase tracking-widest">
                    DEVMOH-Led Administration
                  </p>
                </div>
              </div>
            </div>

            {/* Student Profile Card (NO TAUTOLOGY: No redundant "NASS LASUSTECH" repeated under name) */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 shadow-md backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-11 w-11 rounded-full border-2 border-emerald-400/50 overflow-hidden bg-emerald-950/70 flex items-center justify-center shadow-md">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-emerald-300" />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#041c14]" title="Active Scholar" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 
                    className="font-display font-bold text-xs sm:text-sm text-white truncate uppercase tracking-wide" 
                    title={String(profile.fullName || "Member").toUpperCase()}
                  >
                    {String(profile.fullName || "Member").toUpperCase()}
                  </h2>
                  <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider truncate">
                    {profile.post && String(profile.post).toLowerCase() !== 'student' 
                      ? String(profile.post)
                      : (profile.department ? `${profile.department} Scholar` : 'Basic Sciences Scholar')}
                  </p>
                  {isFresherScholar ? (
                    <div className="mt-0.5 space-y-0.5">
                      <p className="text-[9px] font-bold text-amber-300 uppercase tracking-wide">
                        Matric: Pending (100L)
                      </p>
                      <p className="text-[8.5px] font-mono text-white/60">
                        App ID: {profile.matricNumber}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[9.5px] font-mono text-white/60 mt-0.5">
                      {profile.matricNumber || "Undergraduate"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 p-4">
            <Link
              to="/"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-white/70 hover:bg-white/[0.08] hover:text-white group"
            >
              <div className="flex items-center gap-3">
                <Home className="h-4 w-4 text-white/50 group-hover:text-emerald-300 transition-colors" />
                <span>Back to Website</span>
              </div>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-300" />
            </Link>

            <div className="h-px bg-white/10 my-2 mx-1" />

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "overview" 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30" 
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </div>
              {activeTab === "overview" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />}
            </button>

            <button
              onClick={() => setActiveTab("store")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "store" 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30" 
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4" />
                <span>NASS Store</span>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Lab Kits
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "payments" 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30" 
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4" />
                <span>Payment History</span>
              </div>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                profile.duesStatus === 'Paid' 
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' 
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
              }`}>
                {payments.length > 0 ? `${payments.length} Receipts` : profile.duesStatus === 'Paid' ? 'Paid' : 'Pending'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "events" 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30" 
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                <span>College Events</span>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {collegiateEvents.length} Events
              </span>
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "resources" 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30" 
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4" />
                <span>Science Resources</span>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 border border-white/10">
                12 Materials
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === "profile" 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30" 
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </div>
              {isProfileIncomplete ? (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" title="Incomplete Profile" />
              ) : activeTab === "profile" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
              ) : null}
            </button>
            
            <div className="pt-6 mt-6 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full rounded-xl px-3.5 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          ref={mainScrollRef}
          className="flex-1 px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-6 pb-20 lg:pb-10 h-screen overflow-y-auto bg-[#edf3ee] relative"
        >
          {/* Subtle collegiate ambient light mesh */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(16,185,129,0.12),transparent)] pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full relative z-10">
            {/* Admin Notice */}
          {adminNotice && (
            <div className="mb-4 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50/90 p-4 text-red-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">{String(adminNotice.reason || "Account Notice")}</p>
                  <p className="text-[11px] text-red-700">Official notice issued by the NASS Secretariat.</p>
                </div>
              </div>
              <p className="text-xs leading-5 text-red-800">{String(adminNotice.message || "")}</p>
            </div>
          )}

          {/* Academic Session Bar */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-900/15 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-[#145a32] text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="h-4 w-4 text-emerald-100" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                  DEVMOH-Led Administration
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Active
                </span>
                <span className="text-xs font-extrabold text-slate-800">
                  {academicSettings.session || "2025/2026 Session"} {academicSettings.semester ? `• ${academicSettings.semester}` : "• First Semester"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10.5px] font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-emerald-700" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10.5px] font-black text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>CBS Portal Active</span>
              </div>
            </div>
          </div>

          {/* Profile Incomplete Banner */}
          {isProfileIncomplete && (
            <div className="mb-4 rounded-xl border border-blue-200/80 bg-gradient-to-r from-[#0d346c] via-[#1a4480] to-[#0f2c59] px-4 py-2.5 shadow-xs text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-300 border border-white/20">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-100 leading-tight">
                    <strong className="text-white font-bold">Profile Notice:</strong> Add your official email and contact details to receive dues receipts and academic alerts.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab("profile")}
                size="sm"
                className="shrink-0 bg-white hover:bg-emerald-50 text-[#0d346c] hover:text-[#1a4480] rounded-lg text-xs font-black h-7 px-3.5 shadow-xs transition-all self-end sm:self-auto"
              >
                Update Details
              </Button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-reveal">
              {/* FRESHERS MATRICULATION NUMBER UPDATE DESK */}
              {isFresherScholar && (
                <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-md space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-[#145a32] text-white shadow-md shrink-0">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                            Freshers Matriculation Number Update Desk
                          </h3>
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase">
                            Provisional ID: {profile.matricNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          Once your permanent LASUSTECH matriculation number has been assigned by Academic Affairs, enter it below to upgrade your official collegiate record, dues clearance receipts, and digital ID card.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row items-center gap-3 max-w-xl">
                    <Input
                      value={freshersMatricInput}
                      onChange={(e) => setFreshersMatricInput(e.target.value)}
                      placeholder="e.g. 240303010045"
                      className="h-11 rounded-xl font-mono uppercase bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-emerald-600 text-sm"
                    />
                    <Button
                      onClick={handleSaveOfficialMatric}
                      disabled={savingOfficialMatric}
                      className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shrink-0 gap-2 shadow-md transition-all active:scale-[0.98]"
                    >
                      <Save className="h-4 w-4" />
                      <span>{savingOfficialMatric ? "Saving..." : "Update Official Matric"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Executive Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-emerald-900/15 bg-gradient-to-br from-[#0f4426] via-[#145a32] to-[#0a2f1a] text-white p-5 sm:p-6 shadow-lg">
                {/* Decorative Ambient Radial Glows */}
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
                <div className="absolute right-32 -bottom-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-widest text-emerald-200 mb-3">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Student Portal • CBS LASUSTECH</span>
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      Welcome back, <span className="text-emerald-300 uppercase">{String(profile.fullName || "Scholar").split(' ')[0].toUpperCase()}</span> 👋
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                      You are in good financial and academic standing for the 2025/2026 academic session. Access your official payment receipts, order your custom embroidered lab coat and practical manuals, or explore the science resource library.
                    </p>

                    {/* Quick Identity Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/15 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-medium">
                        🔬 {profile.department || "Computer Science"}
                      </span>
                      {isFresherScholar ? (
                        <>
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono font-medium">
                            📋 App ID: {profile.matricNumber}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200 font-bold border border-amber-400/30">
                            🎓 Matric: Pending (100L)
                          </span>
                        </>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono font-medium">
                          🆔 {profile.matricNumber || "SCHOLAR"}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-400/30">
                        ✓ {profile.duesStatus === 'Paid' ? 'Dues Cleared (₦2,000)' : 'Dues Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Hero CTA Shortcuts */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                    <Button
                      onClick={() => setActiveTab("store")}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-950/20 gap-2 transition-all hover:scale-[1.02]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>View NASS Store</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("payments")}
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/25 text-white font-semibold text-xs rounded-xl gap-2 transition-all"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>View Receipts</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delivery Advisory: Check Spam & Mark Not Spam */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/80 p-4 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                        Official Collegiate Email & Receipt Delivery Notice
                      </h4>
                      <span className="text-[10px] bg-emerald-200/90 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Inbox Tip
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-4xl">
                      Official clearance receipts and broadcasts are sent to your registered Gmail address from <strong className="text-emerald-950 font-bold">nasslasustech@gmail.com</strong>. If any message appears in your <strong>Spam / Junk folder</strong> or <strong>Promotions tab</strong>, please click <strong className="underline decoration-emerald-600">"Report Not Spam"</strong> and add our address to your contacts so critical academic notifications land directly in your Primary inbox.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 High-Impact Action Cards */}
              <div className="grid gap-6 sm:grid-cols-3">
                {/* 1. Session Dues Card */}
                <div className="group rounded-3xl border-2 border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50/30 to-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-600/40 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs group-hover:scale-105 transition-transform">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        profile.duesStatus === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        {profile.duesStatus === 'Paid' ? 'Paid & Verified' : 'Payment Due'}
                      </span>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-display text-base font-bold text-slate-900">Session Dues</h3>
                      <p className="mt-1 font-mono text-xl font-black text-slate-900">₦2,000</p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Official 2025/2026 collegiate contribution. Enables laboratory, exams, and chapter credentials.
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setActiveTab("payments")} 
                    className="mt-6 w-full rounded-xl bg-white border border-slate-200/90 text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 font-bold text-xs gap-1.5 shadow-2xs group-hover:border-emerald-500/50" 
                    variant="outline"
                  >
                    <span>View Payment History</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>

                {/* 2. NASS Store & Lab Essentials Card */}
                <div className="group rounded-3xl border-2 border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50/30 to-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-600/40 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs group-hover:scale-105 transition-transform">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Customized Kits
                      </span>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-display text-base font-bold text-slate-900">NASS Store & Essentials</h3>
                      <p className="mt-1 font-mono text-xl font-black text-emerald-800">
                        Lab Coat & Manuals
                      </p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Acquire customized lab coats (with custom student name embroidery) and approved practical manuals.
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setActiveTab("store")} 
                    className="mt-6 w-full rounded-xl bg-[#145a32] hover:bg-[#0f4426] text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-950/15"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>View NASS Store</span>
                  </Button>
                </div>

                {/* 3. Science Resources Card */}
                <div className="group rounded-3xl border-2 border-blue-500/20 bg-gradient-to-br from-white via-blue-50/30 to-white p-6 shadow-sm transition-all duration-300 hover:border-blue-600/40 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#1a4480] shadow-2xs group-hover:scale-105 transition-transform">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-[#1a4480] border border-blue-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1a4480]" />
                        12 Materials Available
                      </span>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-display text-base font-bold text-slate-900">Science Resources</h3>
                      <p className="mt-1 font-mono text-xl font-black text-[#1a4480]">100L - 400L</p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Curated examination past questions, laboratory practical guides, and lecture syllabi across CBS departments.
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setActiveTab("resources")} 
                    className="mt-6 w-full rounded-xl bg-white border border-slate-200/90 text-slate-800 hover:bg-blue-50 hover:text-[#1a4480] font-bold text-xs gap-1.5 shadow-2xs group-hover:border-blue-500/50" 
                    variant="outline"
                  >
                    <span>Browse Study Materials</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              {/* 4-Metric Quick Stat Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm">
                <div className="border-r border-slate-200/60 pr-3 last:border-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Statutory Standing</span>
                  <p className={`text-sm font-black mt-1 ${profile.duesStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {profile.duesStatus === 'Paid' ? '✓ Cleared (₦2,000)' : '⏳ Pending (₦2,000)'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">2025/2026 Session</p>
                </div>
                <div className="border-r border-slate-200/60 pr-3 last:border-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Payment Receipts</span>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {payments.length > 0 ? `${payments.length} Available` : profile.duesStatus === 'Paid' ? 'Receipt Ready' : 'Awaiting Payment'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Printable Receipts</p>
                </div>
                <div className="border-r border-slate-200/60 pr-3 last:border-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Library Access</span>
                  <p className="text-sm font-black text-[#1a4480] mt-1">12 Study Packs</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Active & Open</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Faculty Division</span>
                  <p className="text-sm font-black text-emerald-950 mt-1 truncate">Basic Sciences</p>
                  <p className="text-[10px] text-slate-500 font-medium">5 Departments</p>
                </div>
              </div>

              {/* Bottom 2-Column Grid */}
              <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                {/* Left Column: Academic Calendar & Activities */}
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    {/* Chapter Spotlight / Upcoming Event */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900">Academic Calendar & Events</h3>
                        <p className="text-xs text-slate-500">Departmental and collegiate student activities.</p>
                      </div>
                      <Button onClick={() => navigate("/events")} variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-bold gap-1">
                        <span>View All Events</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Spotlight Event Card */}
                    {(() => {
                      const spotlight = staticEvents.find(e => e.upcoming) || staticEvents[0];
                      if (!spotlight) return null;
                      return (
                        <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-r from-emerald-50/40 via-white to-slate-50/50 p-4 mb-6">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-[#145a32] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                              <Calendar className="h-5 w-5 mb-0.5" />
                              <span className="text-[8px] font-black uppercase">Event</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                  Chapter Highlight
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">{spotlight.date}</span>
                              </div>
                              <h4 className="font-display text-sm font-bold text-slate-900 mt-1 truncate">
                                {spotlight.title}
                              </h4>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                                {spotlight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Official NASS 2026/2027 Academic Session Calendar Card */}
                    <div className="rounded-2xl border border-emerald-800/20 bg-gradient-to-br from-[#061d10] to-[#0d3b1f] p-4 text-white shadow-sm mb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex flex-col items-center justify-center shrink-0 text-emerald-300">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/30">
                                Official Document • {academicSession}
                              </span>
                            </div>
                            <h4 className="font-display text-sm sm:text-base font-bold text-white mt-1">
                              NASS LASUSTECH Academic Calendar
                            </h4>
                            <p className="text-xs text-emerald-100/80 mt-0.5 line-clamp-1">
                              First & Second Semester schedule, Science Day, Matriculation & Semester Exams.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCalendarPreviewOpen(true)}
                            className="h-8 text-xs font-semibold border-white/20 text-white bg-white/10 hover:bg-white/20 gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview</span>
                          </Button>
                          <a
                            href={getDownloadUrl(calendarPdf, "NASS_LASUSTECH_2026-2027_Calendar (1).pdf")}
                            download="NASS_LASUSTECH_2026-2027_Calendar (1).pdf"
                            className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-1.5 shadow-xs inline-flex items-center justify-center rounded-md cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Calendar (PDF)</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activities Timeline */}
                    <div className="border-t border-slate-100 pt-5">
                      <h4 className="font-display text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Recent Account Activities</span>
                      </h4>
                      <div className="space-y-3">
                        {activities.length > 0 ? (
                          activities.map((activity, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0">
                              <div className="flex items-center gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">{String(activity.type || 'Activity')}</p>
                                  <p className="text-[10px] text-slate-400">{activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'Recent'}</p>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {String(activity.status || 'Success')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">2025/2026 Sessional Dues Receipt</p>
                                  <p className="text-[10px] text-slate-400">Current Session • Verified by Deanery</p>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Cleared
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-800">Resource Repository Access</p>
                                  <p className="text-[10px] text-slate-400">Basic Sciences Past Questions & Notes</p>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-blue-50 text-[#1a4480] border border-blue-200">
                                12 Active
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Digital Student Chapter Card */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-900/15 bg-gradient-to-b from-[#145a32] via-[#0f4426] to-[#0a2f1a] text-white p-6 shadow-lg flex flex-col justify-between">
                  {/* Watermark Crest */}
                  <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5 select-none">
                    <img src={nassLogo} alt="" className="w-56 h-56 object-contain" />
                  </div>

                  <div>
                    {/* Card Top Brand */}
                    <div className="flex items-center justify-between border-b border-white/15 pb-4">
                      <div className="flex items-center gap-2">
                        <img src={nassLogo} alt="" className="h-7 w-7 rounded-full bg-white p-0.5" />
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-white">NASS LASUSTECH</p>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-300">Basic Sciences Chapter</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950">
                        2025/2026
                      </span>
                    </div>

                    {/* Student Particulars */}
                    <div className="mt-5 flex items-start gap-4">
                      <div className="h-16 w-16 rounded-2xl border-2 border-emerald-400/40 p-0.5 bg-white shadow-md overflow-hidden shrink-0">
                        {profile.profileImage ? (
                          <img src={profile.profileImage} alt="" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <div className="h-full w-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                            <User className="h-7 w-7" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-sm font-bold text-white truncate uppercase tracking-wide" title={String(profile.fullName || "Member").toUpperCase()}>
                          {String(profile.fullName || "Member").toUpperCase()}
                        </h4>
                        {isFresherScholar ? (
                          <>
                            <p className="text-[11px] font-mono font-black text-amber-300 mt-0.5 uppercase tracking-wider">
                              MATRIC: PENDING (100L)
                            </p>
                            <p className="text-[9.5px] font-mono text-emerald-200 mt-0.5">
                              App ID: {profile.matricNumber}
                            </p>
                            <p className="text-[11px] text-emerald-100/80 truncate mt-0.5">
                              {profile.department || "Basic Sciences"}
                            </p>
                            <p className="text-[10px] text-amber-200/90 mt-0.5 font-bold">
                              100L • Newly Admitted Scholar
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-mono font-bold text-emerald-300 mt-0.5">
                              {profile.matricNumber || "SCHOLAR"}
                            </p>
                            <p className="text-[11px] text-emerald-100/80 truncate mt-0.5">
                              {profile.department || "Computer Science"}
                            </p>
                            <p className="text-[10px] text-emerald-200/60 mt-0.5">
                              {profile.level || "400L"} • Undergraduate Scholar
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* QR Code Verification Preview */}
                    <div className="mt-5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                          <QrCode className="h-full w-full text-slate-900" />
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-white">Deanery Verified</p>
                          <p className="text-[9px] text-emerald-200">Status: Cleared & In Good Standing</p>
                          <p className="text-[8.5px] font-mono text-emerald-300/70">ID: NASS/{(profile.matricNumber || '2026').slice(-4)}</p>
                        </div>
                      </div>
                      <Award className="h-6 w-6 text-amber-300 shrink-0" />
                    </div>
                  </div>

                  {/* View NASS Store Button */}
                  <div className="mt-6 pt-4 border-t border-white/15">
                    <Button
                      onClick={() => setActiveTab("store")}
                      className="w-full bg-white hover:bg-emerald-50 text-[#145a32] font-bold text-xs rounded-xl shadow-md gap-2"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>View NASS Store</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-6xl animate-reveal pb-10 space-y-5">
              {/* Collegiate Scholar Header Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-emerald-950/20 bg-gradient-to-r from-[#041c14] via-[#0b3b24] to-[#145a32] text-white p-5 sm:p-6 shadow-xl">
                {/* Ambient glow effects */}
                <div className="absolute right-0 top-0 h-48 w-48 bg-emerald-400/10 blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 h-32 w-32 bg-amber-400/10 blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                    {/* Scholar Avatar with dual rings */}
                    <div className="relative shrink-0">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-white/90 ring-offset-4 ring-offset-emerald-900 shadow-2xl overflow-hidden bg-emerald-950 flex items-center justify-center">
                        {profile.profileImage && typeof profile.profileImage === 'string' ? (
                          <img 
                            src={profile.profileImage.startsWith('http') 
                              ? profile.profileImage 
                              : `${API_BASE}${profile.profileImage.startsWith('/') ? profile.profileImage.substring(1) : profile.profileImage}`
                            } 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-emerald-950">
                            <User className="h-12 w-12 text-emerald-300/80" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110"
                        title="Upload New Portrait"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 mb-2">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-300" />
                        <span>COLLEGE OF BASIC SCIENCES • SCHOLAR DOSSIER</span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
                        {String(profile.fullName || "Scholar Dossier")}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                        {isFresherScholar ? (
                          <>
                            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                              📋 App ID: {profile.matricNumber}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30 font-bold">
                              🎓 Matric: Pending (100L)
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                            🆔 {profile.matricNumber || "MATRIC PENDING"}
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-semibold">
                          🔬 {profile.department || "Basic Sciences"}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30 font-bold">
                          🎓 {profile.level || "100L"}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${
                          profile.duesStatus === 'Paid' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        }`}>
                          {profile.duesStatus === 'Paid' ? '✓ Dues Cleared' : '⏳ Dues Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 shrink-0">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="bg-white/10 hover:bg-white/20 border-white/25 text-white font-bold text-xs rounded-xl gap-2 shadow-sm"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Change Portrait</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Container with 3 Clean Themed Section Cards */}
              <form onSubmit={handleUploadProfile} className="space-y-6">
                {/* 1. Academic & University Identity */}
                <div className="rounded-3xl border border-emerald-900/10 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900">Academic & Institutional Credentials</h3>
                        <p className="text-xs text-slate-500">Official student identity issued by LASUSTECH Secretariat.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Deanery Verified
                    </span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Full Name</span>
                      </label>
                      <Input 
                        value={profile.fullName ? profile.fullName.toUpperCase() : ""} 
                        onChange={(e) => {
                          setProfile({ ...profile, fullName: e.target.value.toUpperCase() });
                          setIsDirty(true);
                        }}
                        placeholder="e.g. ADEGOKE ADETOMI MUHAMMED"
                        className="h-11 rounded-xl border-2 border-slate-200/90 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 font-semibold text-sm bg-slate-50/50 focus:bg-white transition-all shadow-2xs uppercase tracking-wide"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{isFresherScholar ? "Provisional Scholar / Application ID" : "Matric Number"}</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase">Locked</span>
                      </label>
                      <Input 
                        value={profile.matricNumber} 
                        onChange={(e) => setProfile({ ...profile, matricNumber: e.target.value })}
                        className="h-11 rounded-xl border-2 border-slate-200 bg-slate-100/90 font-mono font-bold text-slate-700 cursor-not-allowed"
                        disabled
                      />
                      {isFresherScholar && (
                        <p className="text-[10px] font-medium text-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                          Matriculation Status: <strong>Pending 100L Clearance</strong>. Use the Update Desk above once assigned.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Chapter Designation / Role</span>
                      </label>
                      <Input 
                        value={profile.post || "Undergraduate Scholar"} 
                        className="h-11 rounded-xl border-2 border-emerald-200/60 bg-emerald-50/50 font-bold text-emerald-900 cursor-not-allowed"
                        disabled
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Current Academic Level</span>
                      </label>
                      <select 
                        value={profile.level} 
                        onChange={(e) => {
                          setProfile({ ...profile, level: e.target.value });
                          setIsDirty(true);
                        }}
                        className="flex h-11 w-full rounded-xl border-2 border-slate-200/90 bg-slate-50/50 px-3 font-semibold text-sm focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      >
                        <option value="100L">100 Level (Freshman)</option>
                        <option value="200L">200 Level (Sophomore)</option>
                        <option value="300L">300 Level (Penultimate)</option>
                        <option value="400L">400 Level (Finalist)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Official Communications & Receipt Notifications */}
                <div className="rounded-3xl border border-emerald-900/10 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-blue-100 text-[#1a4480] flex items-center justify-center font-bold">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900">Communication & Receipt Delivery</h3>
                        <p className="text-xs text-slate-500">Official dues receipts and store notifications are sent to these destinations.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      Receipt Delivery
                    </span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-blue-700" />
                          <span>Email Address *</span>
                        </div>
                        {initialEmailSet && (
                          <span className="text-[9.5px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </label>
                      <Input 
                        type="email"
                        placeholder="scholar@lasustech.edu.ng"
                        value={initialEmailSet ? hashEmail(profile.email) : profile.email} 
                        onChange={(e) => {
                          if (!initialEmailSet) {
                            setProfile({ ...profile, email: e.target.value });
                            setIsDirty(true);
                          }
                        }}
                        className={`h-11 rounded-xl border-2 font-semibold text-sm transition-all ${
                          initialEmailSet 
                            ? "bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed" 
                            : "border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-blue-50/20"
                        }`}
                        disabled={initialEmailSet}
                      />
                      {!initialEmailSet && (
                        <p className="text-[10.5px] text-blue-800 font-medium italic mt-1">
                          Important: Official payment receipts will be sent here. Please double check accuracy.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-700" />
                        <span>WhatsApp Number *</span>
                      </label>
                      <Input 
                        placeholder="+2348012345678"
                        value={profile.whatsappNumber} 
                        onChange={(e) => {
                          setProfile({ ...profile, whatsappNumber: e.target.value });
                          setIsDirty(true);
                        }}
                        className={`h-11 rounded-xl border-2 font-semibold text-sm transition-all ${
                          !profile.whatsappNumber 
                            ? "border-amber-400 bg-amber-50/30 focus:border-amber-600" 
                            : "border-slate-200/90 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50/50 focus:bg-white"
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Personal & Celebrations */}
                <div className="rounded-3xl border border-emerald-900/10 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Cake className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900">Personal & Faculty Records</h3>
                        <p className="text-xs text-slate-500">Demographic info and faculty birthday recognition.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Community
                    </span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Cake className="h-3.5 w-3.5 text-amber-600" />
                        <span>Date of Birth</span>
                      </label>
                      <Input 
                        type="date"
                        value={profile.birthday} 
                        onChange={(e) => {
                          setProfile({ ...profile, birthday: e.target.value });
                          setIsDirty(true);
                        }}
                        className="h-11 rounded-xl border-2 border-slate-200/90 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-semibold text-sm bg-slate-50/50 focus:bg-white"
                      />
                      <p className="text-[10px] text-slate-500 italic mt-0.5">Used by the NASS Welfare Committee to celebrate your birthday.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Gender</span>
                      </label>
                      <select 
                        value={profile.gender} 
                        onChange={(e) => {
                          setProfile({ ...profile, gender: e.target.value });
                          setIsDirty(true);
                        }}
                        className="flex h-11 w-full rounded-xl border-2 border-slate-200/90 bg-slate-50/50 px-3 font-semibold text-sm focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Action Ribbon */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0b3b24] to-[#145a32] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Ready to update your collegiate record?</span>
                    </p>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      Ensure your email and phone number are accurate before submitting.
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto gap-2 rounded-xl px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/20 hover:scale-[1.02] transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isDirty ? "Save All Changes" : "Update Profile Records"}</span>
                  </Button>
                </div>
              </form>

              {/* Account Security Section */}
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">Student Account Security</h3>
                    <p className="text-xs text-slate-500">Protect your collegiate credentials and academic record in good standing.</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Password & Authentication</p>
                    <p className="text-xs text-slate-500 mt-0.5">Requires secure 6-digit OTP verification sent to your registered email.</p>
                  </div>
                  <PasswordResetDialog matricNumber={profile.matricNumber} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="w-full max-w-6xl animate-reveal pb-12 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                    <CreditCard className="h-6 w-6 text-emerald-700" />
                    <span>Payment History & Official Receipts</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Statutory 2025/2026 collegiate session dues standing, verified transaction ledger, and official downloadable receipts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    profile.duesStatus === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  }`}>
                    {profile.duesStatus === 'Paid' ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Dues Cleared</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Payment Due (₦2,000)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* CASE 1: DUES CLEARED (High-density, smart presentation) */}
              {profile.duesStatus === 'Paid' ? (
                <div className="space-y-6">
                  {/* Hero Standing Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-950/20 bg-gradient-to-r from-[#041c14] via-[#0b3b24] to-[#145a32] p-5 sm:p-6 text-white shadow-lg">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Official Academic Standing • Cleared</span>
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-snug">
                          2025/2026 Statutory Session Dues
                        </h3>
                        <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                          Scholar: <strong className="text-white">{profile.fullName || "Student Scholar"}</strong> • {isFresherScholar ? (
                            <>App Ref: <span className="font-mono font-bold text-emerald-300">{profile.matricNumber}</span> • <span className="text-amber-300 font-bold">Matric: Pending (100L)</span></>
                          ) : (
                            <>Matric: <span className="font-mono font-bold text-emerald-300">{profile.matricNumber}</span></>
                          )} • {profile.department || "Basic Sciences"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono text-xs font-bold border border-white/15">
                            Amount Paid: ₦2,000.00
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-400/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30">
                            Outstanding: ₦0.00
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-200/90 font-mono text-xs">
                            ID: CBS-{(profile.matricNumber || '2026').slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        <Button
                          onClick={() => {
                            const found = payments.find(p => p.status === 'Paid') || {
                              reference: `NASS-DUES-${profile.matricNumber || 'PAID'}`,
                              student_name: profile.fullName || "Student Scholar",
                              matric_number: profile.matricNumber || "",
                              department: profile.department || "Basic Sciences",
                              level: profile.level || "100L",
                              payment_type: "2025/2026 Session Dues",
                              amount: 2000,
                              channel: "Verified Official",
                              status: "Paid",
                              created_at: new Date().toISOString(),
                            };
                            setActiveReceipt(found);
                            setReceiptModalOpen(true);
                          }}
                          className="rounded-xl text-xs sm:text-sm font-extrabold py-3 px-5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all"
                        >
                          <Printer className="h-4 w-4" />
                          <span>View / Print Official Receipt (A4)</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Email Delivery & Spam Instruction Notice */}
                  <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50/80 p-4 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                            Looking for your official email receipt copy?
                          </h4>
                          <span className="text-[10px] bg-emerald-200/90 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Check Spam / Junk
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed max-w-4xl">
                          Every cleared payment triggers an automated receipt to your registered Gmail (<strong className="text-emerald-950">{profile.email || "registered Gmail"}</strong>). If it has not arrived in your Primary inbox, please check your <strong>Spam / Junk folder</strong> or <strong>Promotions tab</strong>, and click <strong>"Report Not Spam"</strong> to guarantee all subsequent semester clearance passes land in your inbox.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Full-Width Verified Transactions & Receipts Ledger */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Verified Transactions & Official Receipts</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Audit trail of collegiate session dues and store purchases.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {payments.length} Record{payments.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {payments.length > 0 ? (
                        payments.map((pay, i) => {
                          const isInitiated = pay.status === "Initiated";
                          return (
                            <div 
                              key={i} 
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-500/30 hover:bg-emerald-50/20 transition-all gap-4"
                            >
                              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs shrink-0 ${
                                  isInitiated ? "bg-amber-500 text-slate-950 animate-pulse" : "bg-emerald-600 text-white"
                                }`}>
                                  {isInitiated ? <Clock className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                      {String(pay.payment_type || 'Session Dues').replace('_', ' ')}
                                    </p>
                                    {isInitiated ? (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                                        Initiated (Pending)
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                                        ✓ Verified
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                    <span className="font-mono text-slate-600 font-semibold">
                                      Ref: {pay.reference || `NASS-${pay.id || i}`}
                                    </span>
                                    <span>•</span>
                                    <span>{pay.created_at ? new Date(pay.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                                    {pay.channel && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-600">{pay.channel}</span>
                                      </>
                                    )}
                                    {pay.size && (
                                      <span className="bg-slate-200/70 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                        Size: {pay.size}
                                      </span>
                                    )}
                                    {pay.labcoat_name && (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                        Name: {pay.labcoat_name}
                                      </span>
                                    )}
                                    {pay.jersey_name && (
                                      <span className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                        Jersey: {pay.jersey_name} #{pay.jersey_number || '10'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                                <div className="text-left md:text-right">
                                  <p className="text-base font-mono font-black text-slate-900">
                                    ₦{((pay.amount || 0) > 10000 ? (pay.amount / 100) : (pay.amount || 0)).toLocaleString()}
                                  </p>
                                </div>
                                {isInitiated ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleResumePayment(pay)}
                                    className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-xs gap-1.5"
                                  >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    <span>Pay with Korapay</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setActiveReceipt({
                                        student_name: pay.student_name || profile.fullName,
                                        matric_number: pay.matric_number || profile.matricNumber,
                                        department: pay.department || profile.department,
                                        level: pay.level || profile.level,
                                        payment_type: pay.payment_type,
                                        size: pay.size,
                                        labcoat_name: pay.labcoat_name,
                                        jersey_name: pay.jersey_name,
                                        jersey_number: pay.jersey_number,
                                        whatsapp_number: pay.whatsapp_number || profile.whatsappNumber,
                                        amount: (pay.amount || 0) > 10000 ? (pay.amount / 100) : (pay.amount || 0),
                                        reference: pay.reference,
                                        created_at: pay.created_at
                                      });
                                      setReceiptModalOpen(true);
                                    }}
                                    className="h-8 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg gap-1.5 shadow-2xs"
                                  >
                                    <Printer className="h-3.5 w-3.5 text-emerald-700" />
                                    <span>View Receipt</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                          <CreditCard className="h-8 w-8 text-slate-400" />
                          <p className="mt-2 text-xs text-slate-600 font-medium">No prior payment records recorded on this device.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secondary Quick Action: Need to purchase essentials or make another payment? */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Custom Lab Coat & Practical Manuals</p>
                        <p className="text-[11px] text-slate-500">Order approved science essentials with custom name embroidery.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("store")}
                        className="shrink-0 h-8 text-xs bg-[#145a32] hover:bg-[#0f4426] text-white font-bold rounded-lg"
                      >
                        Visit Store
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Additional Session Payment</p>
                        <p className="text-[11px] text-slate-500">Need to make another transfer or dues installment via Korapay?</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePayment}
                        className="shrink-0 h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg"
                      >
                        Pay Again
                      </Button>
                    </div>
                  </div>

                  {/* Discreet Footer Security Note */}
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">256-Bit SSL Encrypted • Korapay Verified Gateway</span>
                    <span className="text-[11px] font-semibold text-emerald-800">DEVMOH-Led Administration</span>
                  </div>
                </div>
              ) : (
                /* CASE 2: PAYMENT DUE (Smart, compact 2-column checkout) */
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
                    {/* Left: Statement & Breakdown */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>Statutory Collegiate Dues</span>
                        </div>
                        <h3 className="font-display text-xl font-black text-slate-900 mt-2">
                          2025/2026 Academic Session
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          All enrolled College of Basic Sciences undergraduates are required to clear statutory session dues to validate departmental membership and official exam clearance.
                        </p>

                        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Student Scholar:</span>
                            <span className="font-bold text-slate-900">{profile.fullName || "Student Scholar"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Matric Number:</span>
                            <span className="font-mono font-bold text-slate-900">{profile.matricNumber || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Faculty & Department:</span>
                            <span className="font-medium text-slate-800">{profile.department || "Basic Sciences"}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="font-bold text-slate-900">Statutory Fee:</span>
                            <span className="font-mono font-black text-emerald-800 text-sm">₦2,000.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Instant official receipt issued upon confirmation.</span>
                      </div>
                    </div>

                    {/* Right: Payment Channels (Korapay + Direct Bank Transfer) */}
                    <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-200">
                          <CreditCard className="h-3 w-3 text-emerald-700" />
                          <span>Instant Checkout</span>
                        </div>
                        <h4 className="font-display text-lg font-black text-slate-900 mt-2">
                          Complete Payment Online
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pay securely via Debit Card, Bank Transfer, or USSD through Korapay Gateway.
                        </p>
                      </div>

                      <Button
                        onClick={handlePayment}
                        className="w-full rounded-xl text-sm font-bold py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#145a32] hover:from-emerald-700 hover:to-[#0f4426] text-white shadow-md shadow-emerald-900/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Pay ₦2,000 with Korapay</span>
                      </Button>

                      <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500 pt-2 border-t border-slate-100">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>256-Bit SSL Encrypted by <strong>Korapay</strong></span>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500 pt-2 border-t border-slate-100">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>256-Bit SSL Encrypted by <strong>Korapay</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Previous Transaction Attempts / History Ledger if any */}
                  {payments.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                      <h4 className="font-display text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>Previous Transactions / Initiated Checkouts</span>
                      </h4>
                      <div className="space-y-2">
                        {payments.map((pay, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{pay.payment_type || 'Session Dues'}</p>
                              <p className="text-[10px] text-slate-500 font-mono">Ref: {pay.reference}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900">₦{((pay.amount || 0) > 10000 ? (pay.amount / 100) : (pay.amount || 0)).toLocaleString()}</span>
                              <Button
                                size="sm"
                                onClick={() => handleResumePayment(pay)}
                                className="h-7 text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                              >
                                Resume
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* COLLEGE EVENTS & ACCREDITATION HUB */}
          {/* ======================================================== */}
          {activeTab === "events" && (
            <div className="max-w-6xl animate-reveal pb-10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Calendar className="h-7 w-7 text-emerald-700" />
                    <span>College of Basic Sciences Events & Activities</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Official faculty academic seminars, symposia, science day fairs, sports cups, and cultural festivals. Official registrations and delegate passes will open soon.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{collegiateEvents.length} Official Events • Scheduled</span>
                  </span>
                </div>
              </div>

              {/* Official Academic Calendar Section in Dashboard Events Tab */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#145a32] border border-emerald-800/15 mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Official Academic Session Schedule</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                      NASS LASUSTECH Calendar ({academicSession} Session)
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Official collegiate calendar approved for 100L to 400L across all constituent basic science departments.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCalendarPreviewOpen(true)}
                      className="h-9 gap-1.5 rounded-xl border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>Preview Document</span>
                    </Button>
                    <a
                      href={getDownloadUrl(calendarPdf, "NASS_LASUSTECH_2026-2027_Calendar (1).pdf")}
                      download="NASS_LASUSTECH_2026-2027_Calendar (1).pdf"
                      className="h-9 px-3.5 gap-1.5 rounded-xl bg-[#145a32] hover:bg-[#0f4426] text-white text-xs font-bold shadow-xs inline-flex items-center justify-center cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Official Calendar (PDF)</span>
                    </a>
                  </div>
                </div>

                {/* Calendar Semester Tabs */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setCalendarSemesterFilter("all")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        calendarSemesterFilter === "all"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All Milestones ({academicCalendar.length})
                    </button>
                    <button
                      onClick={() => setCalendarSemesterFilter("first")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        calendarSemesterFilter === "first"
                          ? "bg-[#145a32] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      First Semester ({firstSemesterCalendar.length})
                    </button>
                    <button
                      onClick={() => setCalendarSemesterFilter("second")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        calendarSemesterFilter === "second"
                          ? "bg-[#145a32] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Second Semester ({secondSemesterCalendar.length})
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    Long Vacation: {sessionKeyMilestones.longVacation}
                  </span>
                </div>

                {/* Calendar Activities Mini Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Activity & Milestone</th>
                          <th className="py-2.5 px-3.5">Semester</th>
                          <th className="py-2.5 px-3.5">Category</th>
                          <th className="py-2.5 px-3.5">Scheduled Dates</th>
                          <th className="py-2.5 px-3.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(calendarSemesterFilter === "first" 
                          ? firstSemesterCalendar 
                          : calendarSemesterFilter === "second" 
                          ? secondSemesterCalendar 
                          : academicCalendar
                        ).map((item) => (
                          <tr key={item.id} className={item.highlight ? "bg-emerald-50/25" : ""}>
                            <td className="py-2.5 px-3.5 font-bold text-slate-800">
                              {item.activity}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600">
                              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium">
                                {item.semester}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                              {item.date}
                            </td>
                            <td className="py-2.5 px-3.5 text-[11px] text-slate-500">
                              {item.notes || "Official Milestone"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <strong>Note:</strong> {sessionKeyMilestones.throughoutSession}
                  </span>
                  <span className="text-amber-800 font-semibold">
                    {sessionKeyMilestones.flexibleDatesNotice}
                  </span>
                </div>
              </div>

              {/* Proposed Schedule Notice */}
              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Notice on Event Dates & Schedules:</strong> All dates, times, and schedules listed are proposed collegiate schedules and remain subject to administrative adjustment or rescheduling by the CBS Deanery and NASS Executive Council.
                </p>
              </div>

              {/* Event Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: "all", label: `All Events (${collegiateEvents.length})` },
                  { id: "Academic & Science", label: "Academic & Science" },
                  { id: "Leadership & Training", label: "Leadership & Training" },
                  { id: "Social & Sports", label: "Social & Sports" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setEventFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      eventFilter === f.id
                        ? "bg-[#145a32] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Event Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {collegiateEvents
                  .filter((evt) => {
                    if (eventFilter === "all") return true;
                    return evt.category === eventFilter;
                  })
                  .map((evt) => {
                    return (
                      <div
                        key={evt.id}
                        className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-sm hover:border-emerald-600/40 hover:shadow-lg transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Card Top: Badges */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${evt.badgeColor}`}>
                              {evt.category}
                            </span>
                            <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono">
                              Coming Soon
                            </span>
                          </div>

                          {/* Event Title & Theme */}
                          <div className="mt-4">
                            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                              {evt.title}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-emerald-700 italic">
                              "{evt.theme}"
                            </p>
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                              {evt.description}
                            </p>
                          </div>

                          {/* Date, Time & Venue strip */}
                          <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 text-slate-700">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                              <span className="font-bold text-slate-900">{evt.date}</span>
                              <span>•</span>
                              <span className="text-slate-500 font-mono">{evt.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                              <span className="truncate text-slate-500">{evt.speakers.join(", ")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Action: Coming Soon */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Registration Pending
                            </span>
                          </div>

                          <Button
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: `Official registration for ${evt.title} will open soon. Accreditation announcements will be dispatched on your dashboard and WhatsApp line.`,
                              });
                            }}
                            size="sm"
                            className="rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs gap-1.5 transition-all hover:scale-[1.02]"
                          >
                            <Clock className="h-3.5 w-3.5 text-slate-950" />
                            <span>Coming Soon</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {eventFilter === "registered" && registeredEvents.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
                  <Ticket className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-display text-base font-bold text-slate-800">No Event Passes Registered Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Browse the upcoming faculty events above and register online to receive your door accreditation pass and WhatsApp reminders.
                  </p>
                  <Button
                    onClick={() => setEventFilter("all")}
                    className="mt-4 bg-[#145a32] text-white text-xs font-bold rounded-xl"
                  >
                    Browse All Events
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* NASS STORE & LABORATORY ESSENTIALS */}
          {/* ======================================================== */}
          {activeTab === "store" && (
            <div className="max-w-6xl animate-reveal pb-10 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <ShoppingBag className="h-7 w-7 text-emerald-700" />
                    <span>NASS Store & Laboratory Essentials</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Official College of Basic Sciences lab coats, customised embroidery, and Deanery-approved practical manuals.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setActiveTab("payments")}
                    variant="outline"
                    className="gap-2 rounded-xl border-slate-300 font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <CreditCard className="h-4 w-4 text-emerald-700" />
                    <span>View Payment History & Receipts</span>
                  </Button>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="rounded-3xl border border-emerald-950/20 bg-gradient-to-r from-[#041c14] via-[#0b3b24] to-[#145a32] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 mb-3">
                    <Sparkles className="h-3 w-3" />
                    Official CBS Attire & Curricula
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                    Equip Yourself for Laboratory Practical Sessions
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                    All undergraduate science students taking practical courses are required to wear the official customized CBS lab coat and use authorized Deanery practical logbooks. Lab coats feature bespoke chest embroidery with your requested name.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Custom Name Embroidered</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Collection at College of Basic Science Ground Floor</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. FEATURED ACTIVE APPAREL: OFFICIAL CUSTOMISED LAB COAT */}
              {(() => {
                const labcoatItem = storeItems.find(i => i.id === "labcoat");
                const upcomingItems = storeItems.filter(i => i.id !== "labcoat");

                return (
                  <div className="space-y-6">
                    {labcoatItem && (
                      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                        <div className="grid gap-8 lg:grid-cols-12 items-center">
                          {/* Left: Physical Sample Photo Showcase */}
                          <div className="lg:col-span-5 flex flex-col items-center">
                            <div 
                              className="group/img relative w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/80 flex items-center justify-center p-4 cursor-pointer overflow-hidden transition-all hover:border-emerald-600 hover:shadow-lg"
                              onClick={() => setSelectedLabcoatPreview(labcoatItem.image!)}
                            >
                              <img
                                src={labcoatItem.image}
                                alt="Official CBS Customised Lab Coat Physical Sample"
                                className="h-full w-full object-contain transition-transform duration-300 group-hover/img:scale-105 drop-shadow-md"
                              />
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#145a32] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                                <Sparkles className="h-3 w-3" />
                                <span>Official Physical Sample</span>
                              </div>
                              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xl">
                                  <Eye className="h-4 w-4 text-[#145a32]" />
                                  <span>Click to Zoom High-Res</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-3 w-full flex items-center justify-between text-xs text-slate-600 px-1">
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-slate-400">Embroidery:</span>
                                <strong className="text-slate-900 font-mono">Adegoke M. A.</strong>
                              </span>
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <span>NASS Pocket Crest</span>
                              </span>
                            </div>
                          </div>

                          {/* Right: Specifications & Direct Ordering */}
                          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {labcoatItem.badge}
                                </span>
                                <span className="font-mono text-2xl sm:text-3xl font-black text-[#145a32]">
                                  ₦{labcoatItem.price.toLocaleString()}
                                </span>
                              </div>

                              <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-3">
                                {labcoatItem.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                                {labcoatItem.description}
                              </p>

                              {/* Quick Spec Tags */}
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Bespoke Student Name Stitched on Chest</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Official NASS Embroidered Pocket Crest</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Sizes S, M, L, XL, XXL</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>100% Acid & Stain Resistant Cotton Drill</span>
                                </span>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="pt-4 border-t border-slate-100">
                              <Button
                                onClick={() => handleInitiateStorePayment(labcoatItem)}
                                className="w-full sm:w-auto px-8 rounded-xl py-3.5 bg-[#145a32] hover:bg-[#0f4426] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                <span>Order Customised Lab Coat • ₦6,500</span>
                              </Button>
                              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                                <span>Collection at College of Basic Science Ground Floor upon completion of custom embroidery.</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. UPCOMING ESSENTIALS (CLEAN & NON-CUMBERSOME) */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-display text-base font-bold text-slate-900">
                            Upcoming Collegiate Essentials
                          </h3>
                          <p className="text-xs text-slate-500">
                            Official student gear currently in production for the session.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          Pending Price Enactment
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {upcomingItems.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                  {item.category === "jersey" ? "Athletic Apparel" : item.category === "manual" ? "Academic Logbooks" : item.badge || "Collegiate Gear"}
                                </span>
                                {item.priceConfirmed && item.price > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    <span>Available Now</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                    <Clock className="h-3 w-3 text-amber-700" />
                                    <span>Check back later...</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="font-display text-base font-bold text-slate-900 mt-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              {item.priceConfirmed && item.price > 0 ? (
                                <>
                                  <span className="font-mono text-base font-black text-[#145a32]">
                                    ₦{item.price.toLocaleString()}
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleInitiateStorePayment(item)}
                                    className="h-8 text-xs font-semibold bg-[#145a32] hover:bg-[#0f4426] text-white gap-1.5 rounded-lg"
                                  >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    <span>Order Now</span>
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="text-[11px] text-slate-400 italic">
                                    Official CBS price pending confirmation
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      toast({
                                        title: "Price Confirmation Pending",
                                        description: `Official collegiate price for ${item.title} has not been confirmed yet by the CBS Deanery/Secretariat. Please check back later.`,
                                      });
                                    }}
                                    className="h-8 text-xs font-semibold text-amber-900 hover:bg-amber-50 gap-1.5"
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Check back later...</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Secretariat Collection Guidelines */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Secretariat Dispatch & Kit Collection Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      How kit fulfillment and collection work at the College of Basic Sciences.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                    <span className="font-black font-mono text-emerald-700 text-xs">STEP 01</span>
                    <h5 className="font-bold text-slate-900">Customise & Order</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Choose your size, specify the exact name you want embroidered on your lab coat, and enter your WhatsApp contact.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                    <span className="font-black font-mono text-emerald-700 text-xs">STEP 02</span>
                    <h5 className="font-bold text-slate-900">Secure Online Checkout</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Pay instantly with Korapay via Card, Bank Transfer, or USSD. Your official electronic payment receipt is immediately issued.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
                    <span className="font-black font-mono text-emerald-700 text-xs">STEP 03</span>
                    <h5 className="font-bold text-slate-900">Secretariat Pickup</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Receive collection alert on WhatsApp. Present your printed or digital receipt at NASS Secretariat, College of Basic Science Ground Floor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ACADEMIC & SCIENCE RESOURCES HUB */}
          {/* ======================================================== */}
          {activeTab === "resources" && (
            <div className="max-w-6xl animate-reveal pb-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2.5">
                    <BookOpen className="h-7 w-7 text-[#1a4480]" />
                    <span>Academic & Science Resources</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Curated faculty past questions, laboratory practical manuals, and lecture syllabi across all 5 departments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Downloads Coming Soon</span>
                  </span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search course code, subject, or department (e.g. MTH 101, Physics, Lab)..."
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    className="pl-9 bg-white rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                  />
                </div>

                {/* Level Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["all", "100L", "200L"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setResourceLevel(lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                        resourceLevel === lvl
                          ? "bg-[#1a4480] text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {lvl === "all" ? "All Levels" : lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {["all", "Past Questions", "Lab Manuals", "Lecture Notes"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setResourceCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                      resourceCategory === cat
                        ? "bg-emerald-800 text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>

              {/* Resources Cards Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {academicResources
                  .filter((res) => {
                    const matchSearch =
                      resourceSearch === "" ||
                      res.code.toLowerCase().includes(resourceSearch.toLowerCase()) ||
                      res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
                      res.department.toLowerCase().includes(resourceSearch.toLowerCase());
                    const matchCategory =
                      resourceCategory === "all" || res.category === resourceCategory;
                    const matchLevel =
                      resourceLevel === "all" || res.level === resourceLevel;
                    return matchSearch && matchCategory && matchLevel;
                  })
                  .map((res) => (
                    <div
                      key={res.id}
                      className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-[#1a4480]/50 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-[#1a4480] border border-blue-200/70">
                            {res.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {res.category} • {res.level}
                          </span>
                        </div>

                        <h3 className="mt-3 font-display text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1a4480] transition-colors leading-snug">
                          {res.title}
                        </h3>

                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Official Syllabi</span>
                          </span>
                          <span>•</span>
                          <span>{res.category}</span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleDownloadResource(res)}
                          className="h-8 gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 shadow-2xs transition-all hover:scale-[1.02]"
                        >
                          <Clock className="h-3.5 w-3.5 text-slate-950" />
                          <span>Coming Soon</span>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          </div>
        </main>

        {/* Mobile Bottom Navigation - 6 items with compact touch targets */}
        <nav className="fixed bottom-0 left-0 right-0 z-[100] flex w-full items-center justify-around border-t border-emerald-950/70 bg-[#041c14]/95 text-white/70 px-1 py-2 pb-safe backdrop-blur-xl lg:hidden shadow-2xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 transition-all ${
              activeTab === "overview" ? "text-emerald-300 font-bold scale-105" : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-[8.5px]">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("store")}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 transition-all ${
              activeTab === "store" ? "text-emerald-300 font-bold scale-105" : "text-white/60 hover:text-white"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="text-[8.5px]">NASS Store</span>
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 transition-all ${
              activeTab === "payments" ? "text-emerald-300 font-bold scale-105" : "text-white/60 hover:text-white"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span className="text-[8.5px]">Receipts</span>
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 transition-all ${
              activeTab === "events" ? "text-emerald-300 font-bold scale-105" : "text-white/60 hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-[8.5px]">Events</span>
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 transition-all ${
              activeTab === "resources" ? "text-emerald-300 font-bold scale-105" : "text-white/60 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-[8.5px]">Resources</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 transition-all ${
              activeTab === "profile" ? "text-emerald-300 font-bold scale-105" : "text-white/60 hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span className="text-[8.5px]">Profile</span>
          </button>
        </nav>

        {/* ======================================================== */}
        {/* MODAL 1: STORE ITEM ORDERING DIALOG (LAB COAT & MANUALS) */}
        {/* ======================================================== */}
        <Dialog open={storeModalOpen} onOpenChange={setStoreModalOpen}>
          <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden border-emerald-950/20 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            {selectedStoreItem && (
              <div>
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-[#041c14] via-[#0b3b24] to-[#145a32] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      <ShoppingBag className="h-3 w-3" />
                      <span>{selectedStoreItem.badge}</span>
                    </span>
                    <span className="font-mono text-xl font-black text-amber-300">
                      ₦{selectedStoreItem.category === "manual" && orderManualType.includes("3-in-1") 
                        ? "7,000" 
                        : selectedStoreItem.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg sm:text-xl font-black text-white leading-tight">
                    {selectedStoreItem.title}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-200/80 leading-relaxed">
                    {selectedStoreItem.description}
                  </p>
                </div>

                <div className="p-6 space-y-5 bg-white">
                  {/* LAB COAT REAL SAMPLE PREVIEW BANNER IN MODAL */}
                  {selectedStoreItem.category === "labcoat" && selectedStoreItem.image && (
                    <div className="rounded-2xl border border-emerald-900/15 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 p-3.5 flex items-center gap-3.5">
                      <div 
                        className="h-20 w-16 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden p-1 flex items-center justify-center cursor-pointer shadow-xs hover:border-emerald-600 transition-all group/thumb"
                        onClick={() => setSelectedLabcoatPreview(selectedStoreItem.image!)}
                        title="Click to zoom physical sample"
                      >
                        <img
                          src={selectedStoreItem.image}
                          alt="Lab Coat Sample"
                          className="h-full w-full object-contain group-hover/thumb:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-[#145a32] bg-emerald-100/80 px-2 py-0.5 rounded">
                            Official Sample Attire
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedLabcoatPreview(selectedStoreItem.image!)}
                            className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Zoom Full Sample</span>
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          NASS LASUSTECH Crest + Your Name
                        </p>
                        <p className="text-[10.5px] text-slate-600 mt-0.5 leading-snug">
                          Left pocket features the embroidered NASS crest; right chest carries your exact custom name in green stitching (as shown on President Adegoke M. A.'s sample).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SPECIFIC SELECTOR 1: LAB COAT SIZES */}
                  {selectedStoreItem.category === "labcoat" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Choose Your Lab Coat Size</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-semibold">Standard Nigerian Fit</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { size: "Small (S)" as const, chest: "Chest: 36 - 38 in", note: "Fitted" },
                          { size: "Medium (M)" as const, chest: "Chest: 38 - 40 in", note: "Standard" },
                          { size: "Large (L)" as const, chest: "Chest: 40 - 42 in", note: "Popular", badge: "Recommended" },
                          { size: "Extra Large (XL)" as const, chest: "Chest: 44 - 46 in", note: "Relaxed" },
                        ].map((s) => (
                          <button
                            key={s.size}
                            type="button"
                            onClick={() => setOrderSize(s.size)}
                            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                              orderSize === s.size
                                ? "border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs"
                                : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/60"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-black ${orderSize === s.size ? "text-emerald-900" : "text-slate-800"}`}>
                                  {s.size}
                                </span>
                                {orderSize === s.size && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{s.chest}</p>
                            </div>
                            {s.badge && (
                              <span className="mt-1.5 inline-block text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded w-max">
                                {s.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        Tip: If wearing lab attire over regular collegiate clothing, choosing <strong>Large (L)</strong> ensures comfortable movement during experiments.
                      </p>

                      {/* REQUIRED FIELD: EMBROIDERED NAME ON LAB COAT */}
                      <div className="space-y-1.5 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Name on Lab Coat (Embroidered)</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Front Chest
                          </span>
                        </div>
                        <Input
                          type="text"
                          placeholder="e.g. ADEGOKE M. A. or BABATUNDE T."
                          value={orderLabcoatName}
                          onChange={(e) => setOrderLabcoatName(e.target.value.toUpperCase())}
                          className="h-11 rounded-xl border-slate-300 bg-slate-50/70 font-mono font-bold text-sm uppercase pl-3 focus:border-emerald-600 focus:bg-white"
                        />
                        <p className="text-[10px] text-slate-500 italic">
                          This exact name will be custom embroidered on the right chest of your official CBS lab coat in collegiate green stitching (as demonstrated on President Adegoke M. A.'s physical sample).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SPECIFIC SELECTOR 1.5: CBS SPORT JERSEY */}
                  {selectedStoreItem.category === "jersey" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Choose Jersey Size</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-semibold">Athletic Dry-Fit Cut</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { size: "Small (S)" as const, chest: "Chest: 36 - 38 in" },
                            { size: "Medium (M)" as const, chest: "Chest: 38 - 40 in" },
                            { size: "Large (L)" as const, chest: "Chest: 40 - 42 in", badge: "Popular" },
                            { size: "Extra Large (XL)" as const, chest: "Chest: 44 - 46 in" },
                            { size: "2X Large (XXL)" as const, chest: "Chest: 46 - 48 in" },
                          ].map((s) => (
                            <button
                              key={s.size}
                              type="button"
                              onClick={() => setOrderSize(s.size)}
                              className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                                orderSize === s.size
                                  ? "border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs"
                                  : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/60"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-black ${orderSize === s.size ? "text-emerald-900" : "text-slate-800"}`}>
                                    {s.size}
                                  </span>
                                  {orderSize === s.size && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                  )}
                                </div>
                                <p className="text-[9.5px] text-slate-500 mt-0.5">{s.chest}</p>
                              </div>
                              {s.badge && (
                                <span className="mt-1 inline-block text-[8.5px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-1 py-0.5 rounded w-max">
                                  {s.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Back Name & Squad Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Jersey Back Name</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Heat-Pressed
                            </span>
                          </div>
                          <Input
                            type="text"
                            placeholder="e.g. ADEGOKE or DAVID"
                            value={orderJerseyName}
                            onChange={(e) => setOrderJerseyName(e.target.value.toUpperCase())}
                            className="h-11 rounded-xl border-slate-300 bg-slate-50/70 font-mono font-bold text-sm uppercase pl-3 focus:border-emerald-600 focus:bg-white"
                          />
                          <p className="text-[10px] text-slate-500 italic">
                            This name will be printed across the upper back of your jersey.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                            <span>Squad No.</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="10"
                            maxLength={3}
                            value={orderJerseyNumber}
                            onChange={(e) => setOrderJerseyNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            className="h-11 rounded-xl border-slate-300 bg-slate-50/70 font-mono font-bold text-sm text-center focus:border-emerald-600 focus:bg-white"
                          />
                          <p className="text-[10px] text-slate-500 italic text-center">
                            e.g. 7, 10, 23
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPECIFIC SELECTOR 2: PRACTICAL MANUALS */}
                  {selectedStoreItem.category === "manual" && selectedStoreItem.manualOptions && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Select Practical Manual or Pack</span>
                          <span className="text-red-500">*</span>
                        </label>
                      </div>

                      <div className="space-y-2">
                        {selectedStoreItem.manualOptions.map((opt) => (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setOrderManualType(opt.name)}
                            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                              orderManualType === opt.name
                                ? "border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs"
                                : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                orderManualType === opt.name
                                  ? "border-emerald-700 bg-emerald-700"
                                  : "border-slate-300 bg-white"
                              }`}>
                                {orderManualType === opt.name && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <div>
                                <p className={`text-xs font-bold leading-snug ${
                                  orderManualType === opt.name ? "text-emerald-950" : "text-slate-800"
                                }`}>
                                  {opt.name}
                                </p>
                                {opt.discount && (
                                  <span className="inline-block mt-0.5 text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                    {opt.discount}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                              ₦{opt.price.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REQUIRED FIELD: WHATSAPP PHONE NUMBER */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Phone Number (WhatsApp preferably)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Dispatch Alert
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="tel"
                        placeholder="e.g. 08012345678 or 09087654321"
                        value={orderWhatsApp}
                        onChange={(e) => setOrderWhatsApp(e.target.value)}
                        className="h-11 rounded-xl border-slate-300 bg-slate-50/70 font-mono text-sm pl-10 focus:border-emerald-600 focus:bg-white"
                      />
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/80 p-2.5 text-[11px] text-emerald-950 leading-relaxed flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Required for Pickup Alert:</strong> CBS Secretariat officers will dispatch an official collection SMS/WhatsApp confirmation to this number as soon as your order is packed and ready at College of Basic Science Ground Floor.
                      </span>
                    </div>
                  </div>

                  {/* Summary & Korapay Action */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Recipient / Matric:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {profile.fullName.split(' ')[0]} ({profile.matricNumber || 'Student'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Order Item:</span>
                      <span className="font-bold text-slate-900">
                        {selectedStoreItem.category === "labcoat"
                          ? `Customised Lab Coat (${orderSize})`
                          : selectedStoreItem.category === "jersey"
                            ? `Customised Jersey (${orderSize})`
                            : selectedStoreItem.category === "manual"
                              ? orderManualType
                              : selectedStoreItem.title}
                      </span>
                    </div>
                    {selectedStoreItem.category === "labcoat" && orderLabcoatName && (
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Embroidered Name:</span>
                        <span className="font-bold text-emerald-800 font-mono uppercase">
                          {orderLabcoatName}
                        </span>
                      </div>
                    )}
                    {selectedStoreItem.category === "jersey" && orderJerseyName && (
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Jersey Customization:</span>
                        <span className="font-bold text-emerald-800 font-mono uppercase">
                          {orderJerseyName} #{orderJerseyNumber || '10'} ({orderSize})
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={handleConfirmStoreOrder}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#041c14] via-[#0b3b24] to-[#145a32] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-4 w-4 text-emerald-300" />
                      <span>
                        Proceed to Secure Checkout • ₦
                        {selectedStoreItem.category === "manual" && orderManualType.includes("3-in-1")
                          ? "7,000"
                          : selectedStoreItem.price.toLocaleString()}
                      </span>
                    </Button>

                    <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Protected by Korapay Central Gateway • Official CBS Secretariat Receipt Issued</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL 2: OFFICIAL ELECTRONIC PAYMENT RECEIPT */}
        {/* ======================================================== */}
        <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
          <DialogContent className="w-[96vw] max-w-xl p-0 overflow-hidden border-emerald-950/20 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[92vh] flex flex-col bg-white">
            {activeReceipt && (
              <div className="flex flex-col h-full max-h-[92vh] overflow-hidden bg-white">
                {/* Print Control Toolbar (Hidden on Print) */}
                <div className="bg-[#041c14] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between text-white border-b border-emerald-800/40 shrink-0 no-print">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-300 truncate">
                      Official Payment Receipt
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <Button
                      onClick={handleDownloadReceiptPdf}
                      disabled={downloadingPdf}
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs px-2.5 sm:px-3"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingPdf ? "Generating..." : "Download PDF"}</span>
                    </Button>
                    <Button
                      onClick={() => printElementById("printable-receipt", "NASS LASUSTECH - Official Payment Receipt")}
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs shadow-xs px-2 sm:px-2.5 hidden sm:inline-flex"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print</span>
                    </Button>
                    <Button
                      onClick={() => setReceiptModalOpen(false)}
                      size="sm"
                      variant="ghost"
                      className="h-8 text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold px-2"
                    >
                      Close
                    </Button>
                  </div>
                </div>

                {/* Printable Receipt Body */}
                <div className="overflow-y-auto flex-1 p-2 sm:p-5 bg-slate-100/60">
                  <div 
                    id="printable-receipt"
                    className="p-3 sm:p-6 bg-white text-slate-900 font-sans relative rounded-2xl shadow-xs"
                  >
                    {/* Decorative Outer Guilloche Frame */}
                    <div className="border-[1.5px] sm:border-[2.5px] border-[#145a32] p-3 sm:p-6 rounded-xl sm:rounded-2xl relative bg-white">
                      {/* Watermark Crest */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                        <img src={nassLogo} alt="" className="w-56 h-56 sm:w-72 sm:h-72 object-contain" />
                      </div>

                      {/* Receipt Header: Logos & Institutional Hierarchy */}
                      <div className="flex items-center justify-between gap-2 sm:gap-3 border-b-2 border-[#145a32] pb-3 sm:pb-4">
                        {/* LASUSTECH Crest */}
                        <div className="shrink-0">
                          <img 
                            src={lasustechLogo} 
                            alt="LASUSTECH" 
                            className="h-10 sm:h-16 w-auto object-contain" 
                          />
                        </div>

                        {/* Header Typography */}
                        <div className="text-center flex-1 px-1">
                          <h2 className="text-[9px] sm:text-xs font-serif font-black tracking-wide text-slate-900 uppercase leading-tight">
                            LAGOS STATE UNIVERSITY OF SCIENCE AND TECHNOLOGY
                          </h2>
                          <h3 className="text-[10.5px] sm:text-sm font-sans font-black text-[#145a32] uppercase tracking-wider mt-0.5">
                            COLLEGE OF BASIC SCIENCES
                          </h3>
                          <h4 className="text-[9px] sm:text-xs font-sans font-extrabold text-slate-800 uppercase tracking-widest mt-0.5">
                            NIGERIAN ASSOCIATION OF SCIENCE STUDENTS (NASS)
                          </h4>
                          <p className="text-[7px] sm:text-[9.5px] text-slate-500 font-medium italic mt-0.5">
                            Ikorodu Main Campus, Lagos State • Secretariat Desk, CBS Ground Floor
                          </p>
                        </div>

                        {/* NASS Crest */}
                        <div className="shrink-0">
                          <img 
                            src={nassLogo} 
                            alt="NASS" 
                            className="h-10 w-10 sm:h-16 sm:w-16 object-contain rounded-full p-0.5 bg-white border border-[#145a32]/30" 
                          />
                        </div>
                      </div>

                      {/* Receipt Title Ribbon */}
                      <div className="my-2.5 sm:my-3.5 text-center">
                        <div className="inline-block bg-[#145a32] text-white font-serif font-bold text-[10px] sm:text-xs px-4 sm:px-6 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-xs">
                          OFFICIAL ELECTRONIC PAYMENT RECEIPT
                        </div>
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1.5 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                          <span>Ref: <strong className="text-slate-900">{activeReceipt.reference || `NASS-PAY-${(profile.matricNumber || '2026').slice(-4)}`}</strong></span>
                          <span>•</span>
                          <span>Issued: <strong className="text-slate-900">{activeReceipt.created_at ? new Date(activeReceipt.created_at).toLocaleDateString() : 'Today'}</strong></span>
                        </div>
                      </div>

                      {/* BIG BOLD PAYMENT PURPOSE BANNER (PROMINENT HIGHLIGHT) */}
                      <div 
                        style={{ backgroundColor: '#041c14' }}
                        className="my-2.5 sm:my-3.5 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#041c14] via-[#0b3b24] to-[#145a32] text-white text-center shadow-md border-2 border-emerald-500/40 relative overflow-hidden"
                      >
                        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-amber-300">
                          OFFICIAL PURPOSE OF PAYMENT
                        </p>
                        <h1 className="text-base sm:text-2xl md:text-3xl font-serif font-black uppercase tracking-tight text-white mt-1 leading-snug break-words">
                          {activeReceipt.payment_type ? activeReceipt.payment_type.replace(/_/g, ' ') : "COLLEGE OF BASIC SCIENCES ANNUAL DUES"}
                        </h1>
                        <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-white/20">
                          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-200 font-bold">TOTAL VERIFIED:</span>
                          <span className="font-mono text-sm sm:text-base font-black text-amber-300">
                            ₦{Number(activeReceipt.amount || 0).toLocaleString()} NAIRA
                          </span>
                        </div>
                      </div>

                      {/* Verified Status Banner */}
                      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-950 truncate">Payment Verified & Settled</p>
                            <p className="text-[8.5px] sm:text-[9.5px] text-emerald-700 truncate">Processed securely via Korapay Central Gateway</p>
                          </div>
                        </div>
                        <span className="font-mono font-black text-sm sm:text-lg text-emerald-900 shrink-0">
                          ₦{Number(activeReceipt.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Particulars Table */}
                      <div className="border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden divide-y divide-slate-100 text-[11px] sm:text-xs mb-3.5 sm:mb-5">
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 bg-slate-50/70 items-center">
                          <span className="font-bold text-slate-500 uppercase text-[8.5px] sm:text-[9.5px]">Student Full Name:</span>
                          <span className="font-bold text-slate-900 uppercase font-serif break-words">
                            {activeReceipt.student_name || profile.fullName || "Student Scholar"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 items-center">
                          <span className="font-bold text-slate-500 uppercase text-[8.5px] sm:text-[9.5px]">
                            {(activeReceipt.level === "100L" || (activeReceipt.matric_number && activeReceipt.matric_number.startsWith("FSH"))) ? "App / Scholar Ref:" : "Matriculation No:"}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-[#1a4480]">
                              {activeReceipt.matric_number || profile.matricNumber || "N/A"}
                            </span>
                            {(activeReceipt.level === "100L" || (activeReceipt.matric_number && activeReceipt.matric_number.startsWith("FSH"))) && (
                              <span className="text-[8px] sm:text-[8.5px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300">
                                Matric: Pending (100L)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 bg-slate-50/70 items-center">
                          <span className="font-bold text-slate-500 uppercase text-[8.5px] sm:text-[9.5px]">Department & Level:</span>
                          <span className="font-semibold text-slate-800 break-words">
                            {activeReceipt.department || profile.department || "Basic Sciences"} • {activeReceipt.level || profile.level || "Undergraduate"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2.5 sm:p-3 bg-amber-50/60 border-y border-amber-200 items-center">
                          <span className="font-black text-amber-950 uppercase text-[8.5px] sm:text-[9.5px]">Item / Purpose:</span>
                          <span className="font-black text-xs sm:text-base text-slate-900 uppercase font-serif break-words">
                            {activeReceipt.payment_type || "2025/2026 SESSION DUES"}
                          </span>
                        </div>

                        {/* Lab Coat / Jersey Size */}
                        {activeReceipt.size && (
                          <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 bg-slate-50/70 items-center">
                            <span className="font-bold text-slate-500 uppercase text-[8.5px] sm:text-[9.5px]">Selected Size:</span>
                            <span className="font-mono font-bold text-emerald-900">
                              {activeReceipt.size}
                            </span>
                          </div>
                        )}

                        {/* Lab Coat Custom Embroidered Name */}
                        {activeReceipt.labcoat_name && (
                          <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 bg-amber-50/40 items-center">
                            <span className="font-bold text-amber-800 uppercase text-[8.5px] sm:text-[9.5px]">Embroidered Name:</span>
                            <span className="font-mono font-black text-amber-950 uppercase tracking-wider break-words">
                              {activeReceipt.labcoat_name}
                            </span>
                          </div>
                        )}

                        {/* Jersey Customization */}
                        {activeReceipt.jersey_name && (
                          <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 bg-blue-50/40 items-center">
                            <span className="font-bold text-[#1a4480] uppercase text-[8.5px] sm:text-[9.5px]">Jersey Customization:</span>
                            <span className="font-mono font-black text-blue-950 uppercase tracking-wider break-words">
                              {activeReceipt.jersey_name} #{activeReceipt.jersey_number || '10'} {activeReceipt.size ? `(${activeReceipt.size})` : ''}
                            </span>
                          </div>
                        )}

                        {/* WhatsApp Contact */}
                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 items-center">
                          <span className="font-bold text-slate-500 uppercase text-[8.5px] sm:text-[9.5px]">WhatsApp Contact:</span>
                          <span className="font-mono font-bold text-slate-800 break-words">
                            {activeReceipt.whatsapp_number || profile.whatsappNumber || "Registered on Portal"}
                          </span>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2 sm:p-2.5 bg-slate-50/70 items-center">
                          <span className="font-bold text-slate-500 uppercase text-[8.5px] sm:text-[9.5px]">Channel & Gateway:</span>
                          <span className="font-medium text-slate-700 text-[10px] sm:text-xs">
                            Korapay Central Gateway • 256-Bit SSL Encrypted
                          </span>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[135px_1fr] p-2.5 sm:p-3 bg-emerald-50/60 font-bold items-center">
                          <span className="uppercase text-[9px] sm:text-[10px] text-emerald-950">Total Amount Paid:</span>
                          <span className="font-mono text-sm sm:text-base font-black text-emerald-900">
                            ₦{Number(activeReceipt.amount || 0).toLocaleString()} (Naira)
                          </span>
                        </div>
                      </div>

                      {/* Pickup / Clearance Notice */}
                      {activeReceipt.payment_type && !String(activeReceipt.payment_type).toLowerCase().includes("due") ? (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 sm:p-3 text-[9.5px] sm:text-[10.5px] text-amber-950 mb-3.5 sm:mb-5 leading-relaxed">
                          <strong>Collection Instructions:</strong> Present this receipt (printed or on your phone) at the <strong>NASS Secretariat, College of Basic Science Ground Floor</strong>. Official dispatch notification will also be sent to your WhatsApp line.
                        </div>
                      ) : (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 sm:p-3 text-[9.5px] sm:text-[10.5px] text-emerald-950 mb-3.5 sm:mb-5 leading-relaxed">
                          <strong>Academic Standing:</strong> This confirms statutory 2025/2026 collegiate dues payment. Valid for presentation during course registration, laboratory practical clearance, and semester examinations.
                        </div>
                      )}

                      {/* Signatures & Seal Block: President & Treasurer */}
                      <div className="pt-3 sm:pt-4 border-t-2 border-[#145a32]/30 grid grid-cols-3 items-end gap-1 sm:gap-4 text-center">
                        {/* Executive President Manual Signature Space */}
                        <div className="flex flex-col items-center">
                          <div className="h-6 sm:h-10 w-full" aria-hidden="true" />
                          <div className="border-t border-slate-700 pt-1 w-full">
                            <p className="text-[8px] sm:text-[11px] font-bold text-slate-900 leading-tight">Comr. Adegoke Muhammed A.</p>
                            <p className="text-[6.5px] sm:text-[8.5px] font-medium text-slate-500 uppercase">Executive President, NASS</p>
                          </div>
                        </div>

                        {/* Official Digital Verification QR Code */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-1 sm:p-1.5 bg-white border-2 border-dashed border-[#145a32] rounded-lg sm:rounded-xl shadow-xs flex items-center justify-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=1&data=${encodeURIComponent(
                                `${typeof window !== "undefined" ? window.location.origin : "https://nasslasustech.com"}/verify-receipt?ref=${encodeURIComponent(activeReceipt.reference || activeReceipt.transaction_reference || "NASS-DUES")}&matric=${encodeURIComponent(activeReceipt.matric_number || profile.matricNumber || "")}&name=${encodeURIComponent(activeReceipt.full_name || profile.fullName || "")}&dept=${encodeURIComponent(activeReceipt.department || profile.department || "")}&level=${encodeURIComponent(activeReceipt.level || profile.level || "")}&type=${encodeURIComponent(activeReceipt.payment_type || "2025/2026 SESSION DUES")}&amount=${encodeURIComponent(String(activeReceipt.amount || 3000))}&date=${encodeURIComponent(activeReceipt.paid_at || activeReceipt.created_at || new Date().toISOString())}`
                              )}`}
                              alt="Receipt Verification QR Code"
                              className="w-11 h-11 sm:w-16 sm:h-16 object-contain"
                            />
                          </div>
                          <span className="mt-0.5 sm:mt-1 text-[6.5px] sm:text-[7.5px] font-extrabold text-[#145a32] uppercase tracking-wider">
                            Scan to Verify
                          </span>
                        </div>

                        {/* Executive Treasurer Manual Signature Space */}
                        <div className="flex flex-col items-center">
                          <div className="h-6 sm:h-10 w-full" aria-hidden="true" />
                          <div className="border-t border-slate-700 pt-1 w-full">
                            <p className="text-[8px] sm:text-[11px] font-bold text-slate-900 leading-tight">Comr. Oladepo Damilare</p>
                            <p className="text-[6.5px] sm:text-[8.5px] font-medium text-slate-500 uppercase">Executive Treasurer, NASS</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Verification Notice */}
                      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 text-center">
                        <p className="text-[7.5px] sm:text-[8.5px] text-slate-400 font-mono">
                          Official Computer-Generated Receipt • Security Hash: SHA256-{(profile.matricNumber || '2026').slice(-4)}-VALIDATED
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls (Hidden on Print) */}
                <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 no-print">
                  <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1.5 hidden sm:flex">
                    <Printer className="h-3.5 w-3.5 text-slate-400" />
                    <span>Formatted for standard A4 paper & digital clearance</span>
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      onClick={handleDownloadReceiptPdf}
                      disabled={downloadingPdf}
                      className="bg-[#145a32] hover:bg-[#0f4426] text-white font-bold text-xs rounded-xl shadow-md gap-1.5 flex-1 sm:flex-initial h-9"
                    >
                      <Download className="h-4 w-4" />
                      <span>{downloadingPdf ? "Downloading..." : "Download PDF Receipt"}</span>
                    </Button>
                    <Button
                      onClick={() => printElementById("printable-receipt", "NASS LASUSTECH - Official Payment Receipt")}
                      variant="outline"
                      className="rounded-xl border-slate-300 font-bold text-xs text-slate-700 gap-1.5 h-9"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print (A4)</span>
                    </Button>
                    <Button
                      onClick={() => setReceiptModalOpen(false)}
                      variant="ghost"
                      className="rounded-xl font-bold text-xs text-slate-600 h-9"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL 3: EVENT REGISTRATION DIALOG */}
        {/* ======================================================== */}
        <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-emerald-950/20 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            {selectedEvent && (
              <div>
                <div className="bg-gradient-to-br from-[#041c14] to-[#145a32] p-6 text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    <Ticket className="h-3 w-3" />
                    <span>{selectedEvent.category}</span>
                  </span>
                  <h3 className="mt-3 font-display text-lg font-black text-white leading-tight">
                    {selectedEvent.title}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-200/90 italic">
                    "{selectedEvent.theme}"
                  </p>
                </div>

                <div className="p-6 space-y-4 bg-white">
                  <div className="space-y-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      <span><strong>Date:</strong> {selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      <span><strong>Time:</strong> {selectedEvent.time}</span>
                    </div>
                  </div>

                  {/* Registered Delegate Information */}
                  <div className="rounded-xl border border-slate-200 p-3 space-y-1 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accredited Delegate</p>
                    <p className="font-bold text-slate-900">{profile.fullName || 'Student'}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{profile.matricNumber} • {profile.department} ({profile.level})</p>
                  </div>

                  {/* REQUIRED FIELD: WHATSAPP PHONE NUMBER */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Phone Number (WhatsApp preferably)</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Gate Pass Dispatch
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="tel"
                        placeholder="e.g. 08012345678"
                        value={eventWhatsApp}
                        onChange={(e) => setEventWhatsApp(e.target.value)}
                        className="h-11 rounded-xl border-slate-300 bg-slate-50/70 font-mono text-sm pl-10 focus:border-emerald-600 focus:bg-white"
                      />
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Your digital QR gate pass, room entry allocation, and program updates will be dispatched to this WhatsApp line.
                    </p>
                  </div>

                  <Button
                    onClick={handleConfirmEventRegistration}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#041c14] to-[#145a32] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <Ticket className="h-4 w-4 text-emerald-400" />
                    <span>Confirm Event Registration (Free)</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL 4: DIGITAL EVENT PASS / ACCREDITATION BADGE */}
        {/* ======================================================== */}
        <Dialog open={passModalOpen} onOpenChange={setPassModalOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-emerald-950/20 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            {activePass && (
              <div id="printable-pass" className="bg-white">
                {/* Badge Top Header */}
                <div className="bg-gradient-to-br from-[#041c14] via-[#0b3b24] to-[#145a32] p-6 text-white text-center relative">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-white p-1 flex items-center justify-center shadow-xs">
                      <img src={nassLogo} alt="NASS" className="h-full w-full object-contain" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white p-1 flex items-center justify-center shadow-xs">
                      <img src={lasustechLogo} alt="LASUSTECH" className="h-full w-full object-contain" />
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300">
                    College of Basic Sciences • Deanery Accreditation
                  </p>
                  <h3 className="mt-1 font-display text-lg font-black text-white">
                    Official Delegate Event Pass
                  </h3>
                  <div className="mt-2 inline-block rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 font-mono text-xs font-black text-amber-300">
                    {activePass.passCode}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Event Particulars */}
                  <div className="text-center border-b border-slate-100 pb-4">
                    <h4 className="font-display text-base font-bold text-slate-900 leading-snug">
                      {activePass.eventTitle}
                    </h4>
                    {activePass.eventTheme && (
                      <p className="text-xs text-slate-500 italic mt-0.5">"{activePass.eventTheme}"</p>
                    )}
                    <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold">{activePass.date}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold">{activePass.time}</span>
                    </div>
                  </div>

                  {/* Attendee Details & Barcode */}
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/70 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accredited Delegate:</span>
                      <span className="font-bold text-slate-900">{activePass.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Matric Number:</span>
                      <span className="font-mono font-bold text-slate-900">{activePass.matricNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{activePass.department} ({activePass.level})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">WhatsApp Alert Line:</span>
                      <span className="font-mono font-bold text-emerald-800">{activePass.whatsappNumber}</span>
                    </div>
                  </div>

                  {/* Visual QR / Barcode Card */}
                  <div className="rounded-2xl border-2 border-dashed border-emerald-700/30 p-4 text-center bg-slate-50 flex flex-col items-center justify-center">
                    <QrCode className="h-16 w-16 text-emerald-900" />
                    <p className="font-mono text-[10px] font-black text-emerald-900 mt-2 tracking-widest uppercase">
                      {activePass.passCode}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Present at Faculty Hall Gate for fast digital accreditation
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => printElementById("printable-pass", "NASS LASUSTECH - Delegate Event Pass")}
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-slate-300 font-bold text-slate-800 gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Pass</span>
                    </Button>
                    <Button
                      onClick={() => setPassModalOpen(false)}
                      className="flex-1 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* OFFICIAL ACADEMIC CALENDAR DOCUMENT MODAL */}
        <Dialog open={calendarPreviewOpen} onOpenChange={setCalendarPreviewOpen}>
          <DialogContent className="max-w-4xl p-5 bg-slate-950 text-white border-slate-800 rounded-2xl">
            <DialogHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
              <div>
                <DialogTitle className="text-white font-display text-base sm:text-lg font-bold">
                  NASS LASUSTECH Academic Calendar ({academicSession} Session)
                </DialogTitle>
                <DialogDescription className="text-emerald-300 text-xs">
                  Ratified by College of Basic Sciences Deanery • 100L to 400L
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center mr-6">
                <a
                  href="/NASS_LASUSTECH_2026-2027_Calendar (1).pdf?view=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md inline-flex items-center justify-center transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Open PDF</span>
                </a>
                <a
                  href={getDownloadUrl(calendarPdf, "NASS_LASUSTECH_2026-2027_Calendar (1).pdf")}
                  download="NASS_LASUSTECH_2026-2027_Calendar (1).pdf"
                  className="h-9 px-3 gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md inline-flex items-center justify-center rounded-md cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Calendar (PDF)</span>
                </a>
              </div>
            </DialogHeader>
            <div className="relative max-h-[72vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-900 rounded-xl mt-2">
              <img
                src={calendarImage}
                alt="NASS LASUSTECH Official Academic Calendar"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* LIGHTBOX FOR LAB COAT SAMPLE PREVIEW */}
        {selectedLabcoatPreview && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedLabcoatPreview(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full"
              onClick={() => setSelectedLabcoatPreview(null)}
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative max-w-lg max-h-[88vh] overflow-hidden rounded-2xl bg-white p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 px-1">
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-900">Official CBS Customised Lab Coat</h4>
                  <p className="text-[11px] text-slate-500">Official Physical Sample • Name Embroidery & NASS LASUSTECH Crest</p>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Sample
                </span>
              </div>
              <div className="max-h-[75vh] overflow-y-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
                <img 
                  src={selectedLabcoatPreview} 
                  alt="Official NASS Lab Coat Sample" 
                  className="max-h-[72vh] w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-1">
                <span className="text-slate-600 font-medium">Embroidered: Right chest (Name) + Left chest pocket (NASS Crest)</span>
                <button
                  type="button"
                  onClick={() => setSelectedLabcoatPreview(null)}
                  className="font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
const PasswordResetDialog = ({ matricNumber }: { matricNumber: string }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ matric_number: matricNumber, email }),
      });
      toast({ title: "OTP Sent", description: "Check your email (and spam folder) for the code." });
      setStep("otp");
      setCountdown(60); // Start 60s countdown
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Email verification failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ matric_number: matricNumber, otp }),
      });
      toast({ title: "Verified", description: "Identity confirmed. Set your new password." });
      setStep("password");
    } catch (err: any) {
      toast({ title: "Error", description: "Invalid or expired OTP.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ matric_number: matricNumber, otp, new_password: newPassword }),
      });
      toast({ title: "Success", description: "Password changed successfully!" });
      setOpen(false);
      setStep("email");
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to reset password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setStep("email");
        setCountdown(0);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl h-10 gap-2 px-6 border-primary/20 hover:bg-primary/5 text-primary">
          <Lock className="h-4 w-4" />
          Request Password Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] border-border/50 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">
            {step === "email" ? "Verify Identity" : step === "otp" ? "Enter OTP" : "New Password"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === "email" 
              ? "Type in your email to change your password." 
              : step === "otp" 
                ? "Enter the 6-digit code sent to your email. Check your spam folder if you don't see it."
                : "Create a strong new password for your account."}
          </DialogDescription>
        </DialogHeader>

        {step === "email" && (
          <form onSubmit={handleRequestOTP} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Registered Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-border/50 bg-muted/30"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Sending..." : "Get Verification Code"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground">6-Digit OTP</label>
                <button 
                  type="button" 
                  onClick={() => handleRequestOTP()}
                  disabled={loading || countdown > 0}
                  className={`text-[10px] font-bold uppercase tracking-wider ${countdown > 0 ? "text-muted-foreground" : "text-primary hover:underline"}`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Email"}
                </button>
              </div>
              <Input 
                placeholder="123456" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="rounded-xl border-border/50 bg-muted/30 text-center font-mono text-lg tracking-widest"
              />
              <p className="text-[10px] text-muted-foreground text-center italic mt-2">
                Can't find it? Please check your **Spam/Junk** folder.
              </p>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-xs" 
              onClick={() => setStep("email")}
            >
              Back to Email
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">New Password</label>
              <Input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                className="rounded-xl border-border/50 bg-muted/30"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Saving..." : "Save New Password"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Dashboard;
