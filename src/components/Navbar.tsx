import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  Shield,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/LoginModal";
import { logoutStudent } from "@/lib/student-auth";
import nassLogo from "@/assets/nass_logo.png";
import lasustechLogo from "@/assets/lasustech_logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "College Profile", path: "/about" },
  { label: "Departments", path: "/associations" },
  { label: "Executives", path: "/executives" },
  { label: "Events", path: "/events" },
  { label: "Sponsorship", path: "/donate" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (profileMenuOpen && !target.closest(".profile-menu-container")) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileMenuOpen]);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>
      {/* Unified Sticky Header: Keeps the white masthead & nav bar permanently visible while scrolling */}
      <header className={`sticky top-0 z-50 w-full transition-shadow ${scrolled ? "shadow-md" : "shadow-xs"}`}>
        {/* ======================================================== */}
        {/* TIER 1: SLIM INSTITUTIONAL IDENTITY MASTHEAD (WHITE)     */}
        {/* ======================================================== */}
        <div className="bg-white border-b border-slate-200 select-none py-1.5 sm:py-2">
          <div className="container flex items-center justify-between gap-4">
            {/* Left: Academic Collegiate Identity */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-95 min-w-0"
            >
              {/* Dual Seals */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white p-0.5 border-2 border-emerald-900/40 shadow-2xs overflow-hidden shrink-0 ring-1 ring-emerald-500/20"
                  style={{ clipPath: "circle(50% at 50% 50%)" }}
                >
                  <img
                    src={nassLogo}
                    alt="NASS Emblem"
                    className="h-full w-full object-contain rounded-full"
                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                  />
                </div>

                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

                <div className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white p-0.5 border-2 border-[#1a4480]/50 shadow-2xs shrink-0 ring-1 ring-blue-500/20">
                  <img
                    src={lasustechLogo}
                    alt="LASUSTECH Crest"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Typography */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                    COLLEGE OF BASIC SCIENCES
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[9.5px] font-bold text-[#1a4480] border border-blue-200">
                    LASUSTECH
                  </span>
                </div>
                <span className="text-[9px] sm:text-[11px] font-semibold text-emerald-800 tracking-normal leading-tight truncate">
                  Nigerian Association of Science Students
                </span>
              </div>
            </Link>

            {/* Right: Compact Utilities & Action */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Session Pill */}
              <div className="hidden lg:flex items-center gap-1.5 rounded border border-emerald-700/20 bg-emerald-50/60 px-2.5 py-1 text-[10.5px] text-emerald-900 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>DEVMOH Led Administration • 2026/2027</span>
              </div>

              {/* University Portal Link (LASUSTECH Blue) */}
              <a
                href="https://lasustech.edu.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a4480] hover:text-[#0f2952] transition-colors hidden md:inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50/70 hover:bg-blue-100/60 border border-blue-200/80 px-2.5 py-1 rounded"
              >
                <span>University Portal</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-80" />
              </a>

              {/* Student Portal Button */}
              {isLoggedIn ? (
                <div className="relative group profile-menu-container">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex h-8 w-8 overflow-hidden rounded-md border border-emerald-700/40 transition-all hover:border-emerald-700 bg-slate-100 items-center justify-center shadow-xs"
                  >
                    <Users className="h-3.5 w-3.5 text-emerald-800" />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl animate-reveal z-50">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate uppercase">
                          {(() => {
                            try {
                              const u = JSON.parse(localStorage.getItem("user") || "{}");
                              return String(u.full_name || u.name || "Science Scholar").toUpperCase();
                            } catch (e) {
                              return "SCIENCE SCHOLAR";
                            }
                          })()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {localStorage.getItem("student_matric") || "Collegiate Portal"}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Shield className="h-3.5 w-3.5 text-emerald-700" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logoutStudent();
                          window.location.href = "/";
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-[#1a4480] hover:bg-[#143766] text-white border border-blue-400/40 px-3 py-1.5 text-[11px] font-bold tracking-wide shadow-2xs transition-colors"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-sky-200" />
                  <span>Access Portal</span>
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden shrink-0"
              >
                {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TIER 2: CRISP COLLEGIATE FOREST NAVIGATION BAR           */}
        {/* ======================================================== */}
        <div
          style={{ backgroundColor: "#061d10" }}
          className="text-white border-t-2 border-[#1a4480] shadow-sm select-none"
        >
          <div className="container">
          <div className="flex h-10 items-center justify-between">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center h-full">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`h-full text-[11.5px] uppercase tracking-wider px-3.5 transition-all flex items-center font-bold ${
                      isActive
                        ? "text-sky-300 bg-[#0c2f1b] border-b-2 border-sky-400 font-extrabold"
                        : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Quick Collegiate Status in Nav Bar */}
            <div className="hidden lg:flex items-center gap-2 text-[10.5px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              <span>5 Accredited Science Departments</span>
            </div>

            {/* Mobile Bar representation */}
            <div className="flex lg:hidden items-center justify-between w-full h-full text-xs">
              <span className="text-sky-300 font-bold uppercase tracking-wider text-[10px] sm:text-[10.5px] flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-sky-400" />
                <span>DEVMOH Led Administration</span>
              </span>
              <button
                onClick={() => setLoginOpen(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-sky-300 hover:underline"
              >
                Access Portal →
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            style={{ backgroundColor: "#072414" }}
            className="border-t border-emerald-950 px-4 py-3 lg:hidden animate-reveal text-white"
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "bg-blue-600/25 text-sky-300 border-l-3 border-blue-500 font-extrabold"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-900/60">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#1a4480] hover:bg-[#143766] text-xs font-extrabold uppercase tracking-wider text-white shadow-xs"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Open Student Dashboard</span>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginOpen(true);
                  }}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#1a4480] hover:bg-[#143766] text-xs font-extrabold uppercase tracking-wider text-white shadow-xs"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-sky-200" />
                  <span>Access Student Portal</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;