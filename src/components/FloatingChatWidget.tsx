import { useState, useEffect } from "react";
import { MessageCircle, X, ShieldCheck, HeartHandshake, ExternalLink, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after 3 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const welfareWaLink = "https://wa.me/2348113040343?text=Hello%20NASS%20Welfare%20Desk,%20I%20am%20a%20basic%20science%20student%20and%20I%20have%20a%20complaint/inquiry:";
  const presidentWaLink = "https://wa.me/2349077299644?text=Hello%20President%20Adegoke,%20I%20am%20a%20NASS%20science%20student%20reaching%20out%20with%20an%20inquiry/complaint:";
  const welfare2WaLink = "https://wa.me/2347066540947?text=Hello%20Welfare%20Director,%20I%20have%20a%20student%20complaint/inquiry:";

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* 1. CHAT / COMPLAINTS POPUP CARD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-[calc(100vw-32px)] sm:w-96 rounded-2xl border border-emerald-950/20 bg-white shadow-2xl overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#041c14] via-[#0b3b24] to-[#145a32] p-4 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
                    {/* Official WhatsApp SVG */}
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold leading-none text-white">
                      NASS Direct Complaints & Support
                    </h3>
                    <p className="text-[11px] text-emerald-200/90 mt-1 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Online • Connects to WhatsApp directly</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3 bg-slate-50/50">
              <p className="text-xs text-slate-600 leading-relaxed">
                Need prompt assistance, have an academic complaint, or seeking student welfare support? Tap below to chat directly with leadership on WhatsApp:
              </p>

              {/* Action 1: Student Welfare Desk */}
              <a
                href={welfareWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-emerald-900/15 bg-white p-3.5 shadow-xs transition-all hover:border-[#25D366] hover:bg-emerald-50/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 group-hover:bg-[#25D366] group-hover:text-white group-hover:border-[#25D366] transition-colors">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#145a32] bg-emerald-100 px-2 py-0.5 rounded">
                      Primary for Complaints
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#25D366] transition-colors" />
                  </div>
                  <h4 className="font-display text-xs font-bold text-slate-900 mt-1 group-hover:text-emerald-800 transition-colors">
                    Student Welfare Directorate
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Kanu Eberechi & Welfare Team • Academic issues, relief & student care
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#145a32] mt-1.5 group-hover:underline">
                    <span>Chat on Welfare WhatsApp</span>
                    <Send className="h-2.5 w-2.5" />
                  </span>
                </div>
              </a>

              {/* Action 2: Presidential Escalation Desk */}
              <a
                href={presidentWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      Presidential Escalation
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-display text-xs font-bold text-slate-900 mt-1 group-hover:text-blue-900 transition-colors">
                    NASS Chapter President
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Comr. Adegoke Muhammed Abiola • Official executive matters & advocacy
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 mt-1.5 group-hover:underline">
                    <span>Chat with President Adegoke</span>
                    <Send className="h-2.5 w-2.5" />
                  </span>
                </div>
              </a>

              {/* Action 3: Welfare Line 2 */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Alternative Welfare Line:</span>
                <a
                  href={welfare2WaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Olatunji O. (Welfare 2)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200/80 text-[10.5px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-700" />
              <span>College of Basic Science Ground Floor • LASUSTECH Secretariat</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FLOATING TRIGGER BUTTON & CALLOUT TOOLTIP */}
      <div className="relative flex items-center">
        {/* Helper Tooltip Badge (auto-fades or closes on click) */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="hidden sm:flex items-center gap-2 mr-3 rounded-full bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl border border-white/10 whitespace-nowrap cursor-pointer hover:bg-slate-900 transition-colors"
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
            >
              <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>Have a Complaint? Chat with Leadership</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="ml-1 text-white/60 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating WhatsApp Action Trigger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none ${
            isOpen
              ? "bg-slate-900 text-white border-2 border-white/20 rotate-90"
              : "bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] text-white hover:shadow-emerald-500/30"
          }`}
          aria-label="Student Complaints and WhatsApp Support"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              {/* WhatsApp Icon */}
              <svg className="h-5 w-5 sm:h-5.5 sm:w-5.5 fill-current drop-shadow-sm" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>

              {/* Pulsing Alert Notification Dot */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingChatWidget;
