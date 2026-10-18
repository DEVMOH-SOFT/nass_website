import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Layers,
  GraduationCap,
  Building2,
  Users,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FlaskConical,
  X,
  Award,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { departments, affiliatedInstitutions } from "@/data/college";

const Associations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"departments" | "institutions">("departments");

  const filteredDepartments = departments.filter((dept) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      dept.name.toLowerCase().includes(query) ||
      dept.code.toLowerCase().includes(query) ||
      (dept.units && dept.units.some((d) => d.toLowerCase().includes(query)));

    const matchesFilter =
      activeFilter === "all" ||
      dept.id === activeFilter ||
      dept.code.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const filteredInstitutions = affiliatedInstitutions.filter((inst) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      inst.name.toLowerCase().includes(query) ||
      inst.acronym.toLowerCase().includes(query) ||
      inst.servedDepartments.some((d) => d.toLowerCase().includes(query))
    );
  });

  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL DIRECTORY BANNER             */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-[#061d10] text-white py-8 sm:py-10 border-b border-emerald-950">
        <div className="container relative z-10">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-3">
              {/* Breadcrumb / Institutional Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-[#071d33]/90 px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>COLLEGE OF BASIC SCIENCES • LASUSTECH</span>
              </div>

              {/* Clear, Bold Modern Heading */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Academic Departments & Affiliated Associations
              </h1>

              {/* Informative Lead Text */}
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                Official collegiate directory of accredited academic departments, departmental leadership, curriculum disciplines, and officially affiliated student institutions across the College of Basic Sciences, Lagos State University of Science and Technology.
              </p>

              {/* Structured Metric Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  5 Accredited Departments
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-emerald-400" />
                  14 Laboratories & Facilities
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-sky-300" />
                  {affiliatedInstitutions.length} Affiliated Associations
                </span>
              </div>
            </div>

            {/* Quick Directory Count Plaque */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-widest">
                  Organization Structure
                </span>
                <p className="font-display text-base font-bold text-white mt-1">
                  Departments & Institutions
                </p>
                <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                  Academic departments are administered by University faculty HODs, alongside officially chartered student representative institutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Navigation & Category Switcher */}
      <section className="sticky top-[64px] sm:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-2xs">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Primary Category Switcher (Separating Departments from Affiliated Institutions) */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => {
                  setActiveTab("departments");
                  setActiveFilter("all");
                }}
                className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "departments"
                    ? "bg-[#145a32] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Academic Departments ({departments.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("institutions");
                  setActiveFilter("all");
                }}
                className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "institutions"
                    ? "bg-[#1a4480] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Affiliated Associations ({affiliatedInstitutions.length})
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "departments"
                    ? "Search department, code, or HOD..."
                    : "Search student association or acronym..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-6 md:py-8 bg-slate-50/50">
        <div className="container">
          {/* TAB 1: ACADEMIC DEPARTMENTS */}
          {activeTab === "departments" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    Academic Departments of Basic Sciences
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore faculty leadership, undergraduate degree programs, and official departmental portals.
                  </p>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                      activeFilter === "all"
                        ? "bg-[#145a32] text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    All ({departments.length})
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setActiveFilter(dept.id)}
                      className={`rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                        activeFilter === dept.id
                          ? "bg-[#145a32] text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {dept.code}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDepartments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white max-w-md mx-auto shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mx-auto text-slate-400 mb-3">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">No Department Found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    No departmental record matches "{searchQuery}".
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    className="mt-4 text-xs font-semibold"
                  >
                    Reset Directory Filter
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredDepartments.map((dept, idx) => (
                    <motion.article
                      key={dept.id}
                      id={dept.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-emerald-700/40 hover:shadow-sm transition-all"
                    >
                      {/* Card Header Strip */}
                      <div className="bg-slate-50/90 px-6 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0b2918] text-white tracking-wider">
                            {dept.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                            Est. {dept.established || "2022"} • LASUSTECH Main Campus
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Accredited Academic Department</span>
                          </div>

                          {/* Department Website Button in Header */}
                          <a
                            href={dept.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#1a4480] hover:bg-[#133463] text-white px-3 py-1 text-xs font-bold transition-colors shadow-2xs"
                          >
                            <span>Department Website</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Card Main Body */}
                      <div className="p-6 sm:p-7">
                        <div className="grid gap-6 lg:grid-cols-12 items-start">
                          {/* Left: Department Details & Disciplines */}
                          <div className="lg:col-span-7 space-y-4">
                            <div>
                              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                {dept.name}
                              </h2>
                              <p className="mt-1 text-xs font-semibold text-emerald-800">
                                Head of Department: {dept.headOfDepartment}
                              </p>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {dept.description}
                            </p>

                            {/* Academic Units (Only for departments that have units) */}
                            {dept.units && dept.units.length > 0 && (
                              <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2">
                                  Academic Units
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {dept.units.map((item) => (
                                    <span
                                      key={item}
                                      className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-900"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Structured Department Dossier */}
                          <div className="lg:col-span-5 rounded-xl bg-slate-50 p-5 border border-slate-200/90">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5 border-b border-slate-200 pb-2 flex items-center justify-between">
                              <span>Department Dossier</span>
                              <span className="text-[10px] font-semibold text-emerald-800 uppercase">Active Session</span>
                            </h4>

                            <div className="space-y-3">
                              {/* HOD - Kept cleanly, department desk removed */}
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                                  <Building2 className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Head of Department (HOD)</p>
                                  <p className="text-xs font-bold text-slate-900">{dept.headOfDepartment}</p>
                                </div>
                              </div>

                              {/* Scholars */}
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                                  <Users className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Scholars</p>
                                  <p className="text-xs font-bold text-slate-900">{dept.studentBodyCount}</p>
                                </div>
                              </div>

                              {/* Degree */}
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-[#1a4480] shrink-0 mt-0.5">
                                  <GraduationCap className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Degrees Conferred</p>
                                  <div className="mt-0.5 space-y-0.5">
                                    {dept.degreesOffered.map((deg) => (
                                      <p key={deg} className="text-xs font-medium text-slate-800">
                                        • {deg}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Footer Action: Department Website Link Button */}
                            <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                Faculty Portal
                              </span>
                              <a
                                href={dept.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-[#1a4480] hover:text-[#0f2a52] transition-colors"
                              >
                                <span>Go to Department Website</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AFFILIATED ASSOCIATIONS */}
          {activeTab === "institutions" && (
            <div>
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Affiliated Associations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Officially chartered student professional associations under NASS LASUSTECH Chapter representing student interests across the basic sciences.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInstitutions.map((inst, idx) => (
                  <motion.div
                    key={inst.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#1a4480]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`rounded-md px-3 py-1 text-xs font-bold border ${inst.badgeColor}`}>
                          {inst.acronym}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {inst.studentCount}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
                        {inst.name}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {inst.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Constituent Academic Departments
                        </p>
                        <div className="space-y-1">
                          {inst.servedDepartments.map((dep) => (
                            <div key={dep} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              <span>{dep}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        NASS LASUSTECH Affiliate
                      </span>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        <span>Secretariat Liaison</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Associations;
