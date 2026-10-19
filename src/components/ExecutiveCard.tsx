import { Phone, Mail, MessageSquare, ShieldCheck, Award } from "lucide-react";
import nassLogo from "@/assets/nass_logo.png";

interface ExecutiveCardProps {
  name: string;
  preferredName?: string;
  post: string;
  level: string;
  department?: string;
  description: string;
  image: string;
  arm?: "SEC" | "SRC";
  objectPosition?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

const ExecutiveCard = ({
  name,
  preferredName,
  post,
  level,
  department,
  description,
  image,
  arm = "SEC",
  objectPosition = "object-center",
  phone,
  whatsapp,
  email,
}: ExecutiveCardProps) => {
  const isLogoPlaceholder = !image || image === nassLogo || image.includes("nass_logo") || image.includes("placeholder");

  return (
    <div className="group rounded-2xl border border-emerald-900/60 bg-gradient-to-b from-[#072517] via-[#051c11] to-[#04170e] overflow-hidden shadow-lg transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/80 hover:-translate-y-1 flex flex-col h-full text-white">
      {/* Top Collegiate Accent Line */}
      <div className={`h-1 w-full ${arm === "SRC" ? "bg-gradient-to-r from-[#1a4480] via-sky-500 to-[#145a32]" : "bg-gradient-to-r from-[#145a32] via-emerald-500 to-[#1a4480]"}`} />

      {/* Portrait Stage */}
      <div className="aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#062013] to-[#04190e] relative shrink-0">
        {isLogoPlaceholder ? (
          /* Official Parliamentary Chamber Seal for Members without Individual Photo */
          <div className="w-full h-full bg-gradient-to-br from-[#061d10] via-[#09351e] to-[#04190e] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Subtle Radial Glow */}
            <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

            {/* Circular Medallion */}
            <div className="relative w-28 h-28 rounded-full p-3 bg-white/10 backdrop-blur-md border-2 border-emerald-400/40 shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img
                src={nassLogo}
                alt="NASS Collegiate Crest"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="mt-4 relative z-10 space-y-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Parliamentary Chamber
              </span>
              <p className="text-[10px] text-emerald-200/70 font-medium">
                Official Seat of Representation
              </p>
            </div>
          </div>
        ) : (
          /* High-Definition Executive Studio Portrait with Directional Dark Forest Vignette */
          <>
            <img
              src={image}
              alt={name}
              loading="lazy"
              style={
                objectPosition
                  ? {
                      objectPosition: objectPosition
                        .replace(/^object-/, "")
                        .replace(/\[|\]/g, "")
                        .replace(/_/g, " "),
                    }
                  : undefined
              }
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] filter brightness-[1.01] contrast-[1.05] saturate-[1.04]"
            />

            {/* Studio Lighting Vignette: Smooth bottom gradient ensuring badges pop & portraits look editorial */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#04170e] via-[#04170e]/25 to-transparent pointer-events-none opacity-90 group-hover:opacity-75 transition-opacity duration-300" />
          </>
        )}

        {/* Top Leadership Arm Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md border ${
            arm === "SRC"
              ? "bg-[#071d33]/90 text-sky-300 border-sky-400/35"
              : "bg-[#072414]/90 text-emerald-300 border-emerald-400/35"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${arm === "SRC" ? "bg-sky-400" : "bg-emerald-400"}`} />
            <span>{arm === "SRC" ? "SRC Legislator" : "SEC Executive"}</span>
          </span>
        </div>

        {/* Executive Preferred Name Plaque */}
        {preferredName && (
          <div className="absolute bottom-2.5 right-2.5 z-10 rounded-lg bg-slate-950/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-extrabold text-amber-300 shadow-lg border border-amber-400/35 flex items-center gap-1">
            <span className="text-[10px] text-amber-400/70 font-mono">“</span>
            <span>{preferredName}</span>
            <span className="text-[10px] text-amber-400/70 font-mono">”</span>
          </div>
        )}
      </div>

      {/* Executive Particulars */}
      <div className="p-4 sm:p-5 flex flex-col grow">
        <span className="inline-block self-start rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
          {post}
        </span>
        <h3 className="mt-2 font-display text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
          {name}
        </h3>
        <p className="mt-0.5 text-[11.5px] font-medium text-emerald-200/70">
          {department ? `${department} • ${level}` : level}
        </p>
        <p className="mt-2.5 text-xs leading-relaxed text-slate-300 line-clamp-3">
          {description}
        </p>

        {/* Direct Executive Contact Actions */}
        {(phone || email || whatsapp) && (
          <div className="mt-auto pt-3.5 border-t border-emerald-900/40 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-300/70">
              Direct Contact
            </span>
            <div className="flex items-center gap-1.5">
              {whatsapp && (
                <a
                  href={`https://wa.me/234${whatsapp.replace(/\D/g, "").replace(/^0/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-600 hover:text-white transition-colors shadow-2xs"
                  title={`Chat with ${name} on WhatsApp`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors shadow-2xs"
                  title={`Call ${name} (${phone})`}
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-950/90 text-sky-300 border border-blue-700/60 hover:bg-blue-600 hover:text-white transition-colors shadow-2xs"
                  title={`Email ${name}`}
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveCard;
