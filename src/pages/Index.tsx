import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LogIn,
  CreditCard,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  Layers,
  GraduationCap,
  FlaskConical,
  Atom,
  Users,
  Building2,
  Quote,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ExecutiveCard from "@/components/ExecutiveCard";
import LoginModal from "@/components/LoginModal";
import AssociationCard from "@/components/AssociationCard";
import nassLogo from "@/assets/nass_logo.png";
import lasustechLogo from "@/assets/lasustech_logo.png";
import cbsFacultyBuilding from "@/assets/cbs_faculty_building.jpg";
import { executives as staticExecutives } from "@/data/executives";
import { events as staticEvents } from "@/data/events";
import { departments, collegeInfo, affiliatedInstitutions } from "@/data/college";

// Latest Chapter Moments & Action
import symposiumStage from "@/assets/nass_symposium_stage.jpg";
import academicExcellence from "@/assets/academic_excellence_awards.jpg";
import pioneersAwards from "@/assets/pioneers_awards_president.png";
import behindAcademicWall from "@/assets/behind_academic_wall_auditorium.jpg";

const quickActions = [
  { icon: Layers, label: "Departments Directory", path: "/associations", desc: "5 Accredited Academic Departments" },
  { icon: Users, label: "Student Executive Council", path: "/executives", desc: "Elected Collegiate Leadership" },
  { icon: BookOpen, label: "Science Resources", path: "#", action: "login", targetTab: "resources", desc: "Past Questions & Lab Manuals" },
  { icon: CreditCard, label: "Pay College Dues", path: "#", action: "login", targetTab: "dues", desc: "Annual Dues Administration" },
];

const stats = [
  { value: "5", label: "Academic Departments", icon: Building2 },
  { value: "4,500+", label: "Science Scholars", icon: GraduationCap },
  { value: "14", label: "Research Laboratories", icon: FlaskConical },
  { value: "100%", label: "Unified Representation", icon: Atom },
];

const galleryImages = [
  { src: symposiumStage, caption: "Collegiate Symposium & Faculty Leaders on Stage" },
  { src: academicExcellence, caption: "Academic Excellence Honors & Recognition" },
  { src: pioneersAwards, caption: "The Pioneers Awards Night & Presidential Accolades" },
  { src: behindAcademicWall, caption: "Behind the Academic Wall Conference & Tech Hub" },
];

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [redirectTab, setRedirectTab] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleAction = (item: typeof quickActions[0]) => {
    if (item.action === "login") {
      if (isLoggedIn) {
        navigate("/dashboard", { state: { tab: item.targetTab } });
      } else {
        setRedirectTab(item.targetTab);
        setLoginOpen(true);
      }
    }
  };

  const filteredDepts = selectedDeptFilter === "all"
    ? departments
    : departments.filter((d) => d.id === selectedDeptFilter || d.code.toLowerCase() === selectedDeptFilter);

  return (
    <>
      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setRedirectTab(undefined);
        }}
        redirectTab={redirectTab}
      />
      <Layout>
        {/* ======================================================== */}
        {/* EDITORIAL HERO BANNER (COLLEGE BUILDING AS BACKGROUND) */}
        {/* ======================================================== */}
        <section className="relative isolate overflow-hidden bg-[#05180d] text-white border-b border-emerald-950/60 pt-5 pb-8 sm:pt-7 sm:pb-10 md:pt-8 md:pb-12 lg:pt-9 lg:pb-14 flex items-center">
          {/* Authentic College Building Image with controlled transparency so text is 100% visible */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={cbsFacultyBuilding}
              alt="College of Basic Sciences Complex, LASUSTECH Main Campus"
              className="h-full w-full object-cover object-[80%_30%] sm:object-[78%_35%] md:object-[75%_35%] opacity-40 sm:opacity-55 md:opacity-70 filter brightness-[0.88] contrast-[1.08] saturate-[1.15]"
            />
          </div>

          {/* Directional Scrim Overlays: Deep dark institutional gradient protecting text readability on mobile and desktop */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#05180d]/95 via-[#061d10]/85 to-[#05180d]/90 sm:bg-gradient-to-r sm:from-[#05180d]/98 sm:via-[#061d10]/85 md:via-[#072414]/70 sm:to-transparent" />

          {/* 2. Vertical vignette: Soft anchoring at top and bottom edges */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#05180d] via-transparent to-[#05180d]/40" />

          <div className="container relative z-10 w-full">
            <div className="max-w-2xl lg:max-w-3xl">
              {/* Institutional Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/35 bg-[#071d33]/90 px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-md backdrop-blur-md tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>COLLEGE OF BASIC SCIENCES • LASUSTECH</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                Nigerian Association of Science Students
              </h1>

              <p className="mt-1.5 text-sm sm:text-base font-bold text-emerald-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                NASS LASUSTECH Chapter
              </p>

              <p className="mt-3 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                The central collegiate student body uniting undergraduates across 5 accredited scientific departments. Driving empirical research, academic excellence, and student advocacy across Lagos State University of Science and Technology.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Link to="/associations" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-10 sm:h-11 gap-2 rounded-lg bg-[#1a4480] hover:bg-[#143766] px-4 sm:px-5 text-xs font-bold text-white border border-blue-400/30 shadow-md transition-colors justify-center"
                  >
                    <Layers className="h-4 w-4 text-sky-200" />
                    <span>Explore Departments</span>
                  </Button>
                </Link>

                <Link to="/events" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-10 sm:h-11 gap-2 rounded-lg border-white/30 bg-white/10 px-4 sm:px-5 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur-xs transition-colors justify-center"
                  >
                    <Calendar className="h-4 w-4 text-emerald-300" />
                    <span>College Events</span>
                  </Button>
                </Link>

                <Button
                  size="lg"
                  onClick={() => {
                    setLoginOpen(true);
                  }}
                  className="w-full sm:w-auto h-10 sm:h-11 gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-400/40 shadow-md transition-colors justify-center"
                >
                  <CreditCard className="h-4 w-4 text-emerald-100" />
                  <span>Pay Dues</span>
                </Button>
              </div>

              {/* Institutional Metrics Strip */}
              <div className="mt-6 sm:mt-7 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-4 max-w-md">
                <div>
                  <p className="font-display text-lg sm:text-2xl font-bold text-white">5</p>
                  <p className="text-[9.5px] sm:text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider mt-0.5 truncate">Departments</p>
                </div>
                <div className="border-l border-white/15 pl-2.5 sm:pl-4">
                  <p className="font-display text-lg sm:text-2xl font-bold text-sky-300">4,500+</p>
                  <p className="text-[9.5px] sm:text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider mt-0.5 truncate">Undergrads</p>
                </div>
                <div className="border-l border-white/15 pl-2.5 sm:pl-4">
                  <p className="font-display text-lg sm:text-2xl font-bold text-white">14</p>
                  <p className="text-[9.5px] sm:text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider mt-0.5 truncate">Laboratories</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* ESSENTIAL STUDENT SERVICES (QUICK ACCESS) */}
        {/* ======================================================== */}
        <section className="py-3.5 sm:py-4 bg-[#f8faf8] border-b border-slate-200/80">
          <div className="container">
            <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
              {quickActions.map((item) => (
                <div key={item.label}>
                  {item.path !== "#" ? (
                    <Link
                      to={item.path}
                      className="group flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 rounded-lg border border-slate-200/90 bg-white p-2.5 sm:p-3 transition-all hover:border-[#145a32]/50 hover:bg-emerald-50/20 hover:shadow-xs h-full"
                    >
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#145a32] group-hover:bg-[#145a32] group-hover:text-white transition-colors">
                        <item.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#145a32] transition-colors leading-snug">
                          {item.label}
                        </h3>
                        <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAction(item)}
                      className="w-full text-left group flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 rounded-lg border border-slate-200/90 bg-white p-2.5 sm:p-3 transition-all hover:border-[#145a32]/50 hover:bg-emerald-50/20 hover:shadow-xs h-full"
                    >
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#145a32] group-hover:bg-[#145a32] group-hover:text-white transition-colors">
                        <item.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#145a32] transition-colors leading-snug">
                          {item.label}
                        </h3>
                        <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* LEADERSHIP PERSPECTIVES & WELCOME ADDRESS */}
        {/* ======================================================== */}
        <section className="pt-6 pb-10 md:pt-8 md:pb-12 bg-white border-b border-slate-200/80">
          <div className="container">
            <div className="max-w-3xl mb-5 sm:mb-6">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#145a32]">
                College Leadership & Governance
              </span>
              <h2 className="mt-0.5 font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                Perspectives on Scientific Leadership
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Official perspectives from the Dean of the College, the College Staff Adviser Dr. Joshua Ajilore, and the President of the NASS Chapter on our collective academic charter.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* 1. Dean's Welcome - DEAN IMAGE FIRST */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-xs hover:border-blue-400/50 transition-all">
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-xl border-2 border-[#1a4480]/40 shadow-sm">
                      <img
                        src={collegeInfo.deanImage}
                        alt={collegeInfo.dean}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a4480]">
                        Faculty Patronage
                      </span>
                      <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                        {collegeInfo.dean}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {collegeInfo.deanTitle}
                      </p>
                      <a
                        href={`mailto:${collegeInfo.deanEmail}`}
                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="h-3 w-3" />
                        <span>{collegeInfo.deanEmail}</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 border-l-2 border-[#1a4480]/50 pl-3">
                    "{collegeInfo.deanMessage}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 text-[11px]">
                    College of Basic Sciences
                  </span>
                  <a
                    href="https://lasustech.edu.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#1a4480] hover:text-blue-900 text-[11px]"
                  >
                    <span>University Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 2. College Staff Adviser - DR JOSHUA AJILORE */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-xs hover:border-emerald-600/50 transition-all">
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-700/40 shadow-sm">
                      <img
                        src={collegeInfo.advisorImage}
                        alt={collegeInfo.advisorName}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        College Staff Adviser
                      </span>
                      <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                        {collegeInfo.advisorName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {collegeInfo.advisorTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 border-l-2 border-emerald-600/50 pl-3">
                    "{collegeInfo.advisorMessage}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 text-[11px]">
                    Academic Mentorship
                  </span>
                  <span className="text-emerald-800 font-semibold text-[11px]">
                    Staff Advisory
                  </span>
                </div>
              </div>

              {/* 3. President's Welcome */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-xs hover:border-[#145a32]/50 transition-all">
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-xl border-2 border-[#145a32]/40 shadow-sm">
                      <img
                        src={collegeInfo.presidentImage}
                        alt={collegeInfo.presidentName}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#145a32]">
                        Student Leadership
                      </span>
                      <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                        {collegeInfo.presidentName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {collegeInfo.presidentTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 italic border-l-2 border-[#145a32]/50 pl-3">
                    "{collegeInfo.presidentSpeech}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 text-[11px]">
                    NASS Student Executive Council
                  </span>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1 font-semibold text-[#145a32] hover:text-[#0c3e21] text-[11px]"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SIGNATURE FEATURE: CONSTITUENT DEPARTMENTS & AFFILIATED BODIES */}
        {/* ======================================================== */}
        <section className="py-8 md:py-12 bg-[#f8faf8] border-b border-slate-200/80">
          <div className="container">
            {/* Header + Filter Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-5 sm:mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                  Academic Organization
                </span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Academic Departments of the College
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl">
                  Accredited academic departments offering specialized undergraduate degrees in computing, physical, mathematical, and life sciences.
                </p>
              </div>

              <Link to="/associations">
                <Button className="h-9 gap-1.5 rounded-lg bg-[#145a32] hover:bg-[#0c3e21] text-white text-xs font-semibold">
                  <span>Full Directory Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Department Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
              <button
                onClick={() => setSelectedDeptFilter("all")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                  selectedDeptFilter === "all"
                    ? "bg-[#145a32] text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                All Departments ({departments.length})
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptFilter(d.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                    selectedDeptFilter === d.id
                      ? "bg-[#145a32] text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {d.code} • {d.name.replace("Department of ", "")}
                </button>
              ))}
            </div>

            {/* Department Cards Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredDepts.map((dept, idx) => (
                <AssociationCard key={dept.id} dept={dept} index={idx} />
              ))}
            </div>

            {/* SEPARATED SECTION: AFFILIATED ASSOCIATIONS */}
            <div className="mt-14 pt-10 border-t border-slate-200/90">
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a4480]">
                  Collegiate Student Bodies
                </span>
                <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Affiliated Associations
                </h3>
                <p className="mt-1 text-xs text-slate-600 max-w-2xl">
                  Officially chartered student professional associations operating under NASS LASUSTECH Chapter jurisdiction across the basic sciences.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {affiliatedInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-[#1a4480]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold border ${inst.badgeColor}`}>
                          {inst.acronym}
                        </span>
                        <span className="text-[10.5px] font-medium text-slate-500">
                          {inst.studentCount}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-900 mt-2">
                        {inst.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                        {inst.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Serving Departments
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {inst.servedDepartments.map((dep) => (
                          <span
                            key={dep}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                          >
                            {dep.replace("Department of ", "")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* STUDENT EXECUTIVE COUNCIL PREVIEW */}
        {/* ======================================================== */}
        <section className="py-8 md:py-12 bg-white border-b border-slate-200/80">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                  Collegiate Leadership
                </span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  NASS LASUSTECH Student Executive Council
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Elected officers representing science students across all constituent departments.
                </p>
              </div>
              <Link to="/executives">
                <Button variant="outline" className="h-9 gap-1.5 rounded-lg border-slate-300 text-xs font-semibold">
                  <span>View All Council Members</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {staticExecutives.slice(0, 5).map((exec) => (
                <ExecutiveCard key={exec.name + exec.post} {...exec} />
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* COLLEGE HAPPENINGS & ACADEMIC CALENDAR */}
        {/* ======================================================== */}
        <section className="py-8 md:py-12 bg-[#f8faf8] border-b border-slate-200/80">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                  Calendar & Happenings
                </span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Upcoming Events & Programs
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Academic symposiums, Science Week celebrations, tech bootcamps, and research seminars.
                </p>
              </div>
              <Link to="/events">
                <Button variant="outline" className="h-9 gap-1.5 rounded-lg border-slate-300 text-xs font-semibold">
                  <span>Full Events Calendar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Proposed Schedule Notice */}
            <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span><strong>Proposed Schedule:</strong> Event dates and milestones are proposed collegiate schedules and subject to administrative adjustment.</span>
              </span>
              <Link to="/events" className="text-amber-800 font-bold hover:underline shrink-0 text-[11px] hidden sm:inline">
                Full Details →
              </Link>
            </div>

            {/* Editorial Event Timeline List */}
            <div className="space-y-3">
              {staticEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#145a32]/30 hover:shadow-xs"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-[#145a32] border border-emerald-800/15">
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                        {event.date.split(" ")[0]}
                      </span>
                      <span className="font-display text-lg font-extrabold leading-tight">
                        {event.date.split(" ")[1]?.replace(",", "") || "15"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {event.category || "Academic"}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <Link to={`/events#${event.id}`} className="shrink-0 self-end md:self-center">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-semibold text-[#145a32] hover:bg-emerald-50">
                      <span>Event Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* COLLEGE MOMENTS & RESEARCH ACTIVITIES */}
        {/* ======================================================== */}
        <section className="py-8 md:py-12 bg-white border-b border-slate-200/80">
          <div className="container">
            <div className="max-w-2xl mb-5 sm:mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                Campus Life
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Science Students in Action
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Snapshots from inter-departmental laboratory sessions, student summits, and campus workshops.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 aspect-square"
                >
                  <img
                    src={img.src}
                    alt={img.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end">
                    <p className="text-[11px] font-medium text-white leading-snug">
                      {img.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ======================================================== */}
        {/* INSTITUTIONAL CALLOUT & SECRETARIAT ACCESS */}
        {/* ======================================================== */}
        <section className="bg-[#0b2918] py-8 md:py-12 text-white">
          <div className="container text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Lagos State University of Science and Technology
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Advancing Scientific Discovery & Leadership
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300">
              Engage with your departmental student association, access past examination papers, participate in college-wide research, and manage your student dues through the verified portal.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/associations">
                <Button className="h-10 rounded-lg bg-white font-semibold text-[#0b2918] hover:bg-slate-100 px-5 text-xs">
                  <span>Explore Department Directory</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  if (isLoggedIn) {
                    navigate("/dashboard");
                  } else {
                    setLoginOpen(true);
                  }
                }}
                className="h-10 rounded-lg border-emerald-600/40 text-emerald-200 hover:bg-white/10 hover:text-white px-5 text-xs font-semibold"
              >
                <span>Access Student Portal</span>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Index;
