import { Link } from "react-router-dom";
import {
  GraduationCap,
  Building2,
  Atom,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Target,
  CheckCircle2,
  Users,
  FlaskConical,
  MapPin,
  Calendar,
  Sparkles,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import nassLogo from "@/assets/nass_logo.png";
import lasustechLogo from "@/assets/lasustech_logo.png";
import cbsFacultyBuilding from "@/assets/cbs_faculty_building.jpg";
import symposiumStage from "@/assets/nass_symposium_stage.jpg";
import academicExcellence from "@/assets/academic_excellence_awards.jpg";
import pioneersAwards from "@/assets/pioneers_awards_president.png";
import behindAcademicWall from "@/assets/behind_academic_wall_auditorium.jpg";

const corePillars = [
  {
    icon: Atom,
    title: "Scientific Inquiry & Empirical Rigor",
    desc: "Cultivating fundamental research, laboratory investigation, and curiosity-driven discovery across mathematics, computing, and natural sciences.",
  },
  {
    icon: Target,
    title: "Interdisciplinary Innovation",
    desc: "Bridging computational algorithms, mathematical modeling, and experimental sciences to engineer solutions for industrial and societal challenges.",
  },
  {
    icon: ShieldCheck,
    title: "Student Advocacy & Academic Welfare",
    desc: "Protecting the rights, laboratory access standards, and educational welfare of over 4,500 scholars across all five academic departments.",
  },
  {
    icon: Award,
    title: "Professional & Technical Excellence",
    desc: "Equipping undergraduates with certification bootcamps, academic conferences, hackathons, and global career mentorship opportunities.",
  },
];

const governanceBodies = [
  {
    title: "Student Executive Council (SEC)",
    role: "Collegiate Executive Governance",
    desc: "The constitutionally elected student cabinet steering overall collegiate administration, policy execution, welfare initiatives, and representation before the university management.",
    link: "/executives",
    linkText: "View Executive Cabinet",
  },
  {
    title: "Departmental Student Councils",
    role: "Constituent Discipline Leadership",
    desc: "Constituent departmental student associations administering department-specific curricula, laboratories, and student welfare.",
    link: "/associations",
    linkText: "Explore Departments",
  },
  {
    title: "Student Representative Council (SRC)",
    role: "Legislative Oversight & Advocacy",
    desc: "Elected departmental parliamentarians and honorables providing democratic checks, budgetary review, and student representation across all academic levels.",
    link: "/constitution",
    linkText: "Read Governing Charter",
  },
];

const galleryMoments = [
  { image: symposiumStage, title: "Collegiate Symposium & Leaders", caption: "Collegiate leadership, faculty advisors, and departmental executives on stage." },
  { image: academicExcellence, title: "Academic Excellence Honors", caption: "Celebrating collegiate scholars for distinction and outstanding empirical performance." },
  { image: pioneersAwards, title: "The Pioneers Awards Night", caption: "Honoring pioneering student leaders and scholars under President Comrade Adegoke." },
  { image: behindAcademicWall, title: "Behind the Academic Wall Conference", caption: "Collegiate tech conference, keynote addresses, and symposium in the university auditorium." },
];

const About = () => {
  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL HERO BANNER                   */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-[#061d10] text-white py-14 sm:py-18 lg:py-22 border-b border-emerald-950">
        {/* Architectural Facade Watermark */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={cbsFacultyBuilding}
            alt="College of Basic Sciences Complex"
            className="h-full w-full object-cover object-[80%_32%] md:object-[75%_35%] mix-blend-luminosity filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061d10] via-[#061d10]/75 to-[#061d10]/90" />
        </div>

        <div className="container relative z-10">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              {/* Breadcrumb / Institutional Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-[#071d33]/90 px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>COLLEGE OF BASIC SCIENCES • LASUSTECH</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                About NASS LASUSTECH
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
                The apex collegiate student governing body representing and empowering over 4,500 natural and computational science scholars at Lagos State University of Science and Technology.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-300" />
                  Main Campus, Ikorodu
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-sky-300" />
                  Basic Sciences Complex
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-300" />
                  Est. Under LASUSTECH Charter (2022)
                </span>
              </div>
            </div>

            {/* Right: Architectural Plaque */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                  <div 
                    className="h-10 w-10 rounded-full border border-white/30 bg-white p-0.5 shrink-0 overflow-hidden"
                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                  >
                    <img src={nassLogo} alt="NASS Emblem" className="h-full w-full object-contain rounded-full" />
                  </div>
                  <img src={lasustechLogo} alt="LASUSTECH Crest" className="h-9 w-auto object-contain shrink-0" />
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                    Institutional Jurisdiction
                  </p>
                  <p className="font-display text-sm font-bold text-white">
                    College of Basic Sciences
                  </p>
                  <p className="text-xs text-emerald-100/80 leading-relaxed pt-1">
                    Uniting 5 accredited academic departments under one collegiate charter.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Metrics Strip */}
          <div className="mt-10 rounded-xl border border-emerald-900/60 bg-[#04150b]/80 p-4 backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-900/60">
              <div className="p-2">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">5</p>
                <p className="text-xs text-emerald-300/90 font-medium mt-0.5">Academic Departments</p>
              </div>
              <div className="p-2">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">4,500+</p>
                <p className="text-xs text-emerald-300/90 font-medium mt-0.5">Enrolled Scholars</p>
              </div>
              <div className="p-2">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">14</p>
                <p className="text-xs text-emerald-300/90 font-medium mt-0.5">Specialization Labs</p>
              </div>
              <div className="p-2">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-emerald-300/90 font-medium mt-0.5">Student Representation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. OUR FOUNDATION & INSTITUTIONAL MANDATE                */}
      {/* ======================================================== */}
      <section className="py-8 md:py-12 bg-white border-b border-slate-200">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left Column: Authoritative Editorial Copy */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0f3d23]">
                  Foundational Charter & Mandate
                </span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  The Intellectual Bedrock of Scientific Inquiry at LASUSTECH
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600">
                <p>
                  Established in strict accordance with the founding statutes of the Lagos State University of Science and Technology, the College of Basic Sciences serves as the intellectual cornerstone for all technological, applied, and industrial disciplines across the institution.
                </p>
                <p>
                  The Nigerian Association of Science Students (NASS) LASUSTECH Chapter operates as the central collegiate authority uniting every undergraduate scholar across five accredited academic departments: <strong>Computer Science</strong>, <strong>Mathematical Sciences</strong>, <strong>Chemical Sciences</strong>, <strong>Biological Sciences</strong>, and <strong>Physics (with Science Laboratory Technology)</strong>.
                </p>
                <p>
                  Beyond student advocacy, NASS bridges the gap between academic theory and practical innovation. We administer collegiate tutorial programs, facilitate inter-departmental symposia, curate developer and scientific bootcamps, and foster research partnerships to prepare LASUSTECH scientists for global impact.
                </p>
              </div>

              {/* Dignified Quote Callout */}
              <div className="rounded-xl border-l-4 border-[#1a4480] bg-blue-50/50 p-5 text-slate-800">
                <div className="flex gap-3">
                  <Quote className="h-5 w-5 text-[#1a4480] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm italic font-medium leading-relaxed text-slate-800">
                      "Our mandate is to uphold the integrity of scientific inquiry while cultivating leaders who apply rigorous empirical principles to solve pressing technological and socio-economic challenges."
                    </p>
                    <p className="mt-2 text-[11px] font-bold text-[#1a4480] uppercase tracking-wider">
                      — Student Executive Council, NASS LASUSTECH
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/associations">
                  <Button className="h-10 rounded-lg bg-[#0b2918] hover:bg-[#061d10] text-white text-xs font-semibold gap-1.5 px-5">
                    <span>Explore 5 Departments</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link to="/executives">
                  <Button variant="outline" className="h-10 rounded-lg border-slate-300 text-xs font-semibold gap-1.5 px-5">
                    <Users className="h-3.5 w-3.5 text-[#1a4480]" />
                    <span>Executive Council</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Formal Collegiate Heraldry Plaque */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 shadow-xs">
                {/* Plaque Header */}
                <div className="text-center pb-5 border-b border-slate-200">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div 
                      className="h-12 w-12 rounded-full border border-emerald-900/20 bg-white p-1 shadow-xs overflow-hidden"
                      style={{ clipPath: "circle(50% at 50% 50%)" }}
                    >
                      <img src={nassLogo} alt="NASS Seal" className="h-full w-full object-contain rounded-full" />
                    </div>
                    <div className="h-12 w-12 rounded-full border border-slate-200 bg-white p-1 shadow-xs flex items-center justify-center">
                      <img src={lasustechLogo} alt="LASUSTECH Crest" className="h-full w-full object-contain" />
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900">
                    Official Collegiate Insignia
                  </h3>
                  <p className="text-xs font-semibold text-[#1a4480] tracking-wider uppercase mt-0.5">
                    Discovery • Innovation • Excellence
                  </p>
                </div>

                {/* Identity Dossier Details */}
                <div className="py-5 space-y-3.5 text-xs border-b border-slate-200">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10.5px]">Apex Student Body</span>
                    <span className="font-bold text-slate-900">NASS LASUSTECH Chapter</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10.5px]">Faculty Jurisdiction</span>
                    <span className="font-bold text-slate-900">College of Basic Sciences</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10.5px]">Statutory Oversight</span>
                    <span className="font-medium text-slate-700">Deanery of Basic Sciences</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10.5px]">Chapter Headquarters</span>
                    <span className="font-medium text-slate-700">Basic Sciences Complex, Ikorodu</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10.5px]">Institutional Colors</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-[#0b2918] border border-black/20" />
                      <span className="h-3 w-3 rounded-full bg-[#1a4480] border border-black/20" />
                      <span className="text-xs font-medium text-slate-700">Forest Green & LASUSTECH Royal Blue</span>
                    </div>
                  </div>
                </div>

                {/* Plaque Footer */}
                <div className="pt-4 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recognized University Chapter
                  </span>
                  <Link to="/contact" className="text-slate-500 hover:text-slate-900 font-medium">
                    Contact Secretariat →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FOUR CORE STRATEGIC PILLARS                           */}
      {/* ======================================================== */}
      <section className="py-8 md:py-12 bg-slate-50 border-b border-slate-200">
        <div className="container">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0f3d23]">
              Strategic Foundations
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Core Pillars Guiding Our Collegiate Mission
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              The four foundational principles driving student leadership, laboratory excellence, and career advancement across the college.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {corePillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-700/40 hover:shadow-sm transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 mb-4">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. GOVERNANCE ARCHITECTURE                               */}
      {/* ======================================================== */}
      <section className="py-8 md:py-12 bg-white border-b border-slate-200">
        <div className="container">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0f3d23]">
              Collegiate Governance
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Constitutional Governance Structure
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              A balanced, democratic framework establishing accountability, student advocacy, and administrative synergy across all academic levels.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {governanceBodies.map((body, idx) => (
              <div
                key={body.title}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                    {body.role}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                    {body.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {body.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Link
                    to={body.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 hover:text-emerald-950 transition-colors"
                  >
                    <span>{body.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. COLLEGIATE LIFE & GALLERY                             */}
      {/* ======================================================== */}
      <section className="py-8 md:py-12 bg-slate-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0f3d23]">
                Campus & Chapter Life
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Moments of Discovery & Academic Fellowship
              </h2>
            </div>
            <Link to="/events">
              <Button variant="outline" size="sm" className="h-9 gap-1 text-xs font-semibold">
                <span>View Collegiate Calendar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {galleryMoments.map((item, idx) => (
              <div
                key={item.title}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all"
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3.5">
                  <h4 className="font-display text-xs font-bold text-slate-900">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
