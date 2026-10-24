import React from "react";
import { ShieldCheck } from "lucide-react";

interface TreasurerESignatureProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: boolean;
}

/**
 * Official Collegiate Electronic Signature (E-Sign) for the Executive Treasurer,
 * Nigerian Association of Science Students (NASS), LASUSTECH Chapter.
 * Designed for pixel-perfect rendering across HTML, html2canvas, and PDF exports.
 */
export const TreasurerESignature: React.FC<TreasurerESignatureProps> = ({
  size = "md",
  className = "",
  showBadge = true,
}) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Official Digital Certificate Stamp / Badge */}
      {showBadge && (
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold uppercase tracking-wider shadow-xs mb-1 ${
            isSm ? "text-[6px]" : isLg ? "text-[8px]" : "text-[7px] sm:text-[7.5px]"
          }`}
        >
          <ShieldCheck className={isSm ? "h-2 w-2 text-emerald-600 shrink-0" : "h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0"} />
          <span>Officially E-Signed & Validated</span>
        </div>
      )}

      {/* Realistic Cursive Calligraphic E-Signature Graphic */}
      <div className={`flex items-center justify-center relative ${isSm ? "h-7" : isLg ? "h-11 sm:h-12" : "h-9 sm:h-10"}`}>
        <svg
          viewBox="0 0 220 60"
          className={`text-[#0f2a4a] overflow-visible ${
            isSm ? "w-28 h-7" : isLg ? "w-44 sm:w-48 h-11 sm:h-12" : "w-36 sm:w-40 h-9 sm:h-10"
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="E-Signature of Comr. Oladepo Damilare David"
        >
          {/* Main cursive handwritten signature strokes */}
          <path
            d="M 18 40 C 14 26, 20 12, 28 10 C 36 8, 41 20, 36 34 C 33 44, 22 48, 16 42 C 12 36, 18 22, 30 16 C 42 10, 52 24, 46 34 C 43 39, 49 41, 55 34 C 61 27, 65 32, 69 36 C 73 40, 78 28, 84 30 C 90 32, 92 37, 98 33 C 103 29, 108 31, 114 35 M 122 28 C 116 16, 126 12, 134 19 C 141 26, 136 40, 128 38 C 123 36, 130 27, 139 25 C 148 23, 151 36, 157 34 C 163 32, 168 28, 173 32 C 178 36, 184 31, 190 33"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ascender loop flourish on 'd' & 'l' */}
          <path
            d="M 28 10 C 32 4, 38 6, 36 14 M 134 19 C 137 10, 143 8, 141 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Underline sweeping flourish & terminal dot */}
          <path
            d="M 22 48 C 55 45, 110 47, 165 43 C 185 41, 198 39, 194 45 C 190 50, 175 48, 160 50"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="198" cy="45" r="1.6" fill="currentColor" />
        </svg>
      </div>

      {/* Official Signatory Details */}
      <div className={`border-t border-slate-700 pt-0.5 sm:pt-1 w-full ${isSm ? "max-w-[140px]" : "max-w-[190px] sm:max-w-[220px]"}`}>
        <p className={`font-black text-slate-900 leading-tight ${isSm ? "text-[8px]" : isLg ? "text-[11px] sm:text-xs" : "text-[9px] sm:text-[10.5px]"}`}>
          Comr. Oladepo Damilare David
        </p>
        <p className={`font-bold text-[#145a32] uppercase tracking-wider ${isSm ? "text-[6px]" : isLg ? "text-[8px] sm:text-[8.5px]" : "text-[7px] sm:text-[7.5px]"}`}>
          Executive Treasurer, NASS
        </p>
        <p className={`text-slate-400 font-mono tracking-tight ${isSm ? "text-[5.5px]" : "text-[6px] sm:text-[7px]"}`}>
          Secretariat Treasury • 2025/2026 Session
        </p>
      </div>
    </div>
  );
};

export default TreasurerESignature;
