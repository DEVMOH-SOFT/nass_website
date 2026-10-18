import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Globe, ExternalLink, Heart } from "lucide-react";
import nassLogo from "@/assets/nass_logo.png";
import lasustechLogo from "@/assets/lasustech_logo.png";
import LoginModal from "@/components/LoginModal";
import { departments } from "@/data/college";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "About College & NASS", path: "/about" },
  { label: "Department Directory", path: "/associations" },
  { label: "Executive Council", path: "/executives" },
  { label: "College Events", path: "/events" },
  { label: "Contact", path: "/contact" },
];

const Footer = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <footer className="border-t border-emerald-950/20 bg-[#082013] text-white">
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <div className="container py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Col 1: Identity & Purpose */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-0.5 border border-emerald-500/30 shadow-xs shrink-0 overflow-hidden"
                style={{ clipPath: "circle(50% at 50% 50%)" }}
              >
                <img 
                  src={nassLogo} 
                  alt="NASS Emblem" 
                  className="h-full w-full object-contain rounded-full" 
                  style={{ clipPath: "circle(50% at 50% 50%)" }}
                />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-0.5 border border-white/40 shadow-xs shrink-0">
                <img src={lasustechLogo} alt="LASUSTECH Crest" className="h-full w-full object-contain" />
              </div>

              <div className="flex flex-col leading-none">
                <span className="font-display text-sm font-bold text-white tracking-tight">
                  NASS LASUSTECH
                </span>
                <span className="mt-1 text-[11px] font-medium text-emerald-300">
                  College of Basic Sciences
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-300 max-w-sm">
              Nigerian Association of Science Students (NASS), LASUSTECH Chapter. The collegiate representative body uniting students across Computer Science, Mathematics, Chemistry, Biology, and Physics.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-blue-950/80 border border-blue-800/60 px-3 py-1.5 text-[11px] text-sky-300 font-semibold">
                <span>Discovery • Innovation • Excellence</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-950/90 border border-emerald-600/60 px-3 py-1.5 text-[11px] text-emerald-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DEVMOH Led Administration</span>
              </div>
            </div>
          </div>

          {/* Col 2: 5 Constituent Departments */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-3">
              Constituent Departments
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {departments.map((dept) => (
                <li key={dept.id}>
                  <Link
                    to={`/associations#${dept.id}`}
                    className="hover:text-sky-300 transition-colors flex items-center justify-between"
                  >
                    <span>{dept.name.replace("Department of ", "")}</span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      {dept.code}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Collegiate Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Secretariat & Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-3">
              College Secretariat
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>College of Basic Science Ground Floor, LASUSTECH Main Campus, Ikorodu, Lagos</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <a href="mailto:nasslasustech@gmail.com" className="hover:text-sky-300 transition-colors">
                  nasslasustech@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
                <a
                  href="https://lasustech.edu.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                  <span>lasustech.edu.ng</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-10 border-t border-emerald-900/50 pt-6 flex flex-col items-center justify-center text-center text-xs text-slate-400 gap-2.5">
          <p>© {new Date().getFullYear()} Nigerian Association of Science Students (NASS) LASUSTECH Chapter</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <Link to="/about" className="hover:text-slate-200 transition-colors">About</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-200 transition-colors">Secretariat Support</Link>
            <span>•</span>
            <Link to="/constitution" className="hover:text-slate-200 transition-colors">Constitution</Link>
          </div>
          <p className="mt-1 text-xs text-emerald-300 font-semibold tracking-wide">
            Built with <span className="inline-block text-[#1a56db] mx-0.5 align-middle" style={{ color: "#1a56db" }} title="LASUSTECH Blue">💙</span> by DevMoh Technologies
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;