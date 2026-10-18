import { useState } from "react";
import Layout from "@/components/Layout";
import { X, Download, Calendar, Eye, FileText, Search, AlertCircle, Clock, Sparkles, Flag, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { downloadFile, getDownloadUrl } from "@/lib/download";
const calendarImage = "/NASS_LASUSTECH_CALENDAR_2026_2027.png";
const calendarPdf = "/NASS_LASUSTECH_2026-2027_Calendar (1).pdf";

import { 
  academicCalendar, 
  firstSemesterCalendar,
  secondSemesterCalendar,
  sessionKeyMilestones,
  generalElections2027,
  publicHolidays,
  academicSession, 
  semesterTitle, 
  collegeName 
} from "@/data/calendar";

// Just the pictures - clean, direct showcase of collegiate events & flyers
const eventPictures = [
  { id: "p1", src: "/events/NASS_HOD_Cup_Grand_Finale.jpg", filename: "NASS_HOD_Cup_Grand_Finale.jpg" },
  { id: "p2", src: "/events/NASS_Ladies_In_Tech_Empowerment.jpg", filename: "NASS_Ladies_In_Tech_Empowerment.jpg" },
  { id: "p3", src: "/events/NASS_HOD_Cup_Tournament.jpg", filename: "NASS_HOD_Cup_Tournament.jpg" },
  { id: "p4", src: "/events/NASS_Science_Innovation_Bootcamp.jpg", filename: "NASS_Science_Innovation_Bootcamp.jpg" },
  { id: "p5", src: "/events/NASS_Science_Collegiate_Symposium.jpg", filename: "NASS_Science_Collegiate_Symposium.jpg" },
  { id: "p6", src: "/events/NASS_Behind_Academic_Wall_Conference.jpg", filename: "NASS_Behind_Academic_Wall_Conference.jpg" },
  { id: "p7", src: "/events/NASS_Academic_Excellence_Awards.jpg", filename: "NASS_Academic_Excellence_Awards.jpg" },
  { id: "p8", src: "/events/NASS_Pioneers_Awards_Night.png", filename: "NASS_Pioneers_Awards_Night.png" },
];

const Events = () => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; filename: string } | null>(null);
  const [calendarSearch, setCalendarSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<"all" | "first" | "second" | "auxiliary">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleDownload = (imageUrl: string, filename: string) => {
    downloadFile(imageUrl, filename);
  };

  const baseCalendarList = selectedSemester === "first" 
    ? firstSemesterCalendar 
    : selectedSemester === "second" 
    ? secondSemesterCalendar 
    : academicCalendar;

  const filteredCalendar = baseCalendarList.filter((item) => {
    const matchesSearch = item.activity.toLowerCase().includes(calendarSearch.toLowerCase()) ||
      item.date.toLowerCase().includes(calendarSearch.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Registration", "Lectures", "Orientation", "Events & Culture", "Examinations", "Break"];

  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL EVENTS BANNER                */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-[#061d10] text-white py-8 sm:py-10 border-b border-emerald-950">
        <div className="container relative z-10">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-[#072414]/90 px-3.5 py-1 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>COLLEGE OF BASIC SCIENCES • LASUSTECH</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Programs & Academic Calendar
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                Official calendar and program schedule for the <strong>{academicSession} Academic Session</strong> across 100L to 400L. Track First and Second Semester lectures, Science Day, Matriculation, examinations, and flagship student initiatives.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Official {academicSession} Calendar
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>First & Second Semesters (100L - 400L)</span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>All Constituent Science Departments</span>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-widest">
                  Academic Sessions
                </span>
                <p className="font-display text-base font-bold text-white mt-1">
                  CBS Calendar {academicSession}
                </p>
                <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                  Lectures, Science Day, ECOInnovate, CBS Got Talent, Build with AI, and Examination schedules ratified for science students.
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedImage({ url: calendarImage, filename: "NASS_LASUSTECH_2026-2027_Calendar (1).pdf" })}
                    className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-8 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Calendar Document</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. OFFICIAL ACADEMIC CALENDAR (2026/2027 SESSION)         */}
      {/* ======================================================== */}
      <section className="py-10 md:py-14 bg-white border-b border-slate-200">
        <div className="container max-w-6xl">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#145a32] border border-emerald-800/15 mb-2">
                <FileText className="h-3.5 w-3.5 text-emerald-700" />
                <span>Official Collegiate Academic Schedule</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                NASS LASUSTECH Calendar ({academicSession} Session)
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                Nigerian Association of Science Students, College of Basic Sciences • 100L to 400L.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage({ url: calendarImage, filename: "NASS_LASUSTECH_2026-2027_Calendar (1).pdf" })}
                className="h-9 gap-1.5 rounded-lg border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span>Preview Document</span>
              </Button>
              <a
                href={getDownloadUrl(calendarPdf, "NASS_LASUSTECH_2026-2027_Calendar (1).pdf")}
                download="NASS_LASUSTECH_2026-2027_Calendar (1).pdf"
                className="h-9 px-3.5 gap-1.5 rounded-lg bg-[#145a32] hover:bg-[#0f4426] text-white text-xs font-semibold shadow-xs inline-flex items-center justify-center cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Official Calendar (PDF)</span>
              </a>
            </div>
          </div>

          {/* Proposed Dates & Rescheduling Advisory */}
          <div className="mb-6 rounded-xl border border-amber-200/90 bg-amber-50/70 p-3.5 sm:p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                Administrative Schedule Notice:
              </span>
              <p className="mt-0.5 text-amber-900 leading-relaxed">
                Please note that all listed event dates, times, and calendar milestones are proposed collegiate schedules and remain subject to administrative adjustment, rescheduling, or ratification by the College of Basic Sciences Deanery and NASS Executive Council.
              </p>
            </div>
          </div>

          {/* Key Session Milestones Strip */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-emerald-600 text-white p-2 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">Science Day 2026</h4>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">Tuesday 10th Nov 2026</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Collegiate exhibitions & symposium.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-amber-600 text-white p-2 shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-900">*Matriculation</h4>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">Wednesday 25th Nov 2026</p>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">*Date subject to Senate advisory.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-purple-600 text-white p-2 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-900">CBS GOT TALENT</h4>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">Monday 12th April 2027</p>
                  <p className="text-[11px] text-purple-800/80 mt-0.5">Talent & creative arts show.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-blue-600 text-white p-2 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">CBS Build with AI</h4>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">Wednesday 19th May 2027</p>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">AI tech hackathon & summit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Semester Selector Tabs */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setSelectedSemester("all")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedSemester === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Activities ({academicCalendar.length})
              </button>
              <button
                onClick={() => setSelectedSemester("first")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedSemester === "first"
                    ? "bg-[#145a32] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                First Semester ({firstSemesterCalendar.length})
              </button>
              <button
                onClick={() => setSelectedSemester("second")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedSemester === "second"
                    ? "bg-[#145a32] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Second Semester ({secondSemesterCalendar.length})
              </button>
              <button
                onClick={() => setSelectedSemester("auxiliary")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedSemester === "auxiliary"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Elections & Holidays
              </button>
            </div>

            {/* Throughout the Session Note Badge */}
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-700" />
              <span><strong>Note:</strong> Sports, academic tutorials and welfare initiatives run throughout the session.</span>
            </div>
          </div>

          {/* Main Table or Auxiliary View */}
          {selectedSemester !== "auxiliary" ? (
            <>
              {/* Filter Bar & Search */}
              <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-[#145a32] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search activities & dates..."
                    value={calendarSearch}
                    onChange={(e) => setCalendarSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#145a32]/20 focus:border-[#145a32]"
                  />
                </div>
              </div>

              {/* Calendar Activities Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 min-w-[280px]">Academic Activity & Milestone</th>
                        <th className="py-3 px-4 min-w-[120px]">Semester</th>
                        <th className="py-3 px-4 min-w-[120px]">Category</th>
                        <th className="py-3 px-4 min-w-[260px]">Scheduled Dates</th>
                        <th className="py-3 px-4 min-w-[160px]">Status & Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredCalendar.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`transition-colors hover:bg-slate-50/80 ${
                            item.highlight ? "bg-emerald-50/20 font-medium" : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {item.highlight && (
                                <span className="h-2 w-2 rounded-full bg-[#145a32] shrink-0" />
                              )}
                              <span className={`text-slate-900 ${item.highlight ? "font-bold text-[13px]" : "font-semibold"}`}>
                                {item.activity}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {item.semester}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                item.category === "Registration"
                                  ? "bg-purple-100 text-purple-800"
                                  : item.category === "Lectures"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.category === "Orientation"
                                  ? "bg-amber-100 text-amber-800"
                                  : item.category === "Examinations"
                                  ? "bg-rose-100 text-rose-800"
                                  : item.category === "Break"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {item.notes ? (
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                                {item.notes}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Scheduled Milestone</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCalendar.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No calendar milestones found matching "{calendarSearch}".
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Elections, Founders Day & Holidays Detailed Cards */
            <div className="grid gap-6 md:grid-cols-2 animate-reveal">
              {/* Nigeria 2027 General Elections Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="rounded-lg bg-slate-900 text-white p-2">
                    <Flag className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Nigeria's 2027 General Elections
                    </h3>
                    <p className="text-xs text-slate-500">
                      National and state elections during the 2026/2027 academic year.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {generalElections2027.map((el, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-800">{el.title}</span>
                      <span className="font-bold text-slate-900 shrink-0 font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {el.date}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950">
                  <strong>LASUSTECH Founders Day:</strong> Tuesday 2nd February 2027.
                </div>
              </div>

              {/* Official Public Holidays */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="rounded-lg bg-amber-500 text-white p-2">
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Public Holidays & Observances
                    </h3>
                    <p className="text-xs text-slate-500">
                      Statutory national and religious holidays observed across the session.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {publicHolidays.map((h, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-slate-800">{h.name}</span>
                      <span className="font-semibold text-slate-700 shrink-0">{h.date}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-100 text-xs text-slate-700 flex items-center justify-between">
                  <span><strong>Long Vacation:</strong></span>
                  <span className="font-semibold">{sessionKeyMilestones.longVacation}</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Footer Note */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800">Key Calendar Advisory: </span>
              <span>{sessionKeyMilestones.flexibleDatesNotice}</span>
            </div>
            <div className="shrink-0 text-slate-500 font-medium">
              Long Vacation: {sessionKeyMilestones.longVacation}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. EVENT PICTURES & FLYERS GALLERY (JUST THE PICTURES)   */}
      {/* ======================================================== */}
      <section className="py-10 md:py-14 bg-[#f8faf8] border-b border-slate-200">
        <div className="container max-w-6xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                Event Gallery & Media
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Event Flyers & Pictures
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Click any flyer or picture to view in high resolution or download directly to your device.
              </p>
            </div>
          </div>

          {/* Direct Picture Grid - NO fake titles, NO write-ups */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {eventPictures.map((pic, idx) => (
              <div
                key={pic.id}
                onClick={() => setSelectedImage({ url: pic.src, filename: pic.filename })}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all hover:border-emerald-600/40 flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                  <img
                    src={pic.src}
                    alt={`Event Flyer ${idx + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Desktop Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur-xs">
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </span>

                    <a
                      href={getDownloadUrl(pic.src, pic.filename)}
                      download={pic.filename}
                      title="Download picture"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#145a32] px-2.5 py-1 text-[11px] font-bold text-white shadow-md hover:bg-[#0f4426] transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Always-visible action bar below picture for mobile and immediate clarity */}
                <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedImage({ url: pic.src, filename: pic.filename })}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>View</span>
                  </button>
                  <a
                    href={getDownloadUrl(pic.src, pic.filename)}
                    download={pic.filename}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Resolution Document & Picture Lightbox (Portaled to body, always visible & centered) */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-4 sm:p-6 bg-slate-950 text-white border-slate-800 rounded-2xl shadow-2xl">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10 gap-3 pr-8">
            <div className="text-left">
              <DialogTitle className="text-white font-display text-sm sm:text-base font-bold truncate max-w-[200px] sm:max-w-md">
                {selectedImage?.filename.replace(/_/g, " ").replace(/\.[^/.]+$/, "")}
              </DialogTitle>
              <DialogDescription className="text-emerald-400 text-xs">
                NASS LASUSTECH Official Document / Media
              </DialogDescription>
            </div>
            {selectedImage && (() => {
              const isCal = selectedImage.filename.toLowerCase().includes("calendar");
              const targetUrl = isCal ? calendarPdf : selectedImage.url;
              const targetName = isCal ? "NASS_LASUSTECH_2026-2027_Calendar (1).pdf" : selectedImage.filename;
              const viewUrl = isCal ? "/NASS_LASUSTECH_2026-2027_Calendar (1).pdf?view=1" : selectedImage.url;
              const downloadUrl = getDownloadUrl(targetUrl, targetName);

              return (
                <div className="flex items-center gap-2">
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 sm:h-9 px-3 gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md inline-flex items-center justify-center transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{isCal ? "Open Official PDF" : "Open in New Tab"}</span>
                    <span className="sm:hidden">{isCal ? "PDF" : "Open"}</span>
                  </a>
                  <a
                    href={downloadUrl}
                    download={targetName}
                    className="h-8 sm:h-9 px-3 gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shrink-0 cursor-pointer inline-flex items-center justify-center rounded-md"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isCal ? "Download Calendar (PDF)" : "Download Picture"}</span>
                  </a>
                </div>
              );
            })()}
          </DialogHeader>

          <div className="relative max-h-[72vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-900/90 rounded-xl mt-2">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
            <span className="truncate max-w-[180px] sm:max-w-sm">
              File: {selectedImage?.filename.toLowerCase().includes("calendar") ? "NASS_LASUSTECH_2026-2027_Calendar (1).pdf" : selectedImage?.filename}
            </span>
            {selectedImage && (() => {
              const isCal = selectedImage.filename.toLowerCase().includes("calendar");
              const targetUrl = isCal ? calendarPdf : selectedImage.url;
              const targetName = isCal ? "NASS_LASUSTECH_2026-2027_Calendar (1).pdf" : selectedImage.filename;
              const viewUrl = isCal ? "/NASS_LASUSTECH_2026-2027_Calendar (1).pdf?view=1" : selectedImage.url;
              const downloadUrl = getDownloadUrl(targetUrl, targetName);

              return (
                <div className="flex items-center gap-2">
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-3 text-xs border border-white/20 text-slate-300 hover:bg-white/10 cursor-pointer inline-flex items-center justify-center rounded-md"
                  >
                    {isCal ? "View PDF" : "View Full Size"}
                  </a>
                  <a
                    href={downloadUrl}
                    download={targetName}
                    className="h-7 px-3 text-xs border border-emerald-600/50 text-emerald-300 hover:bg-emerald-950/50 cursor-pointer inline-flex items-center justify-center rounded-md"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {isCal ? "Save Calendar (PDF)" : "Save to Computer"}
                  </a>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Events;
