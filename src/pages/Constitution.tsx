import { Clock, Shield, Scale, ScrollText, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const Constitution = () => {
  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL CHARTER BANNER               */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-[#061d10] text-white py-8 sm:py-10 border-b border-emerald-950">
        <div className="container relative z-10">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/60 px-3.5 py-1 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-md">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>LEGISLATIVE REVIEW IN PROGRESS • CHECK BACK LATER</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                NASS Supreme Governing Constitution
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                The fundamental legal charter and governing framework of the Nigerian Association of Science Students (LASUSTECH Chapter). The updated 2026/2027 collegiate statute is currently undergoing formal legislative ratification by the Student Representative Council (SRC).
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Scale className="h-4 w-4 text-emerald-400" />
                  Official Legislative Charter
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>Student Representative Council (SRC)</span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>College of Basic Sciences, LASUSTECH</span>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>Statute Status</span>
                </span>
                <p className="font-display text-base font-bold text-white mt-1">
                  Check Back Later...
                </p>
                <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                  The complete official constitution is being revised and gazetted. The ratified electronic version will be published here upon parliamentary enactment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Constitution Body */}
      <section className="py-8 md:py-10 bg-[#f8faf8]">
        <div className="container max-w-4xl">
          {/* Official Notice Card */}
          <div className="mb-6 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                      Constitutional Document Pending Official Publication
                    </h3>
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      Check Back Later
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The official NASS LASUSTECH Chapter Constitution is presently undergoing legislative review, clause refinement, and formal gazetting by the Speaker and Honorables of the Student Representative Council (SRC). The downloadable PDF will be uploaded once ratified.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <Button 
                  disabled 
                  variant="outline" 
                  className="rounded-xl border-amber-300 bg-amber-100/60 text-amber-900 font-bold text-xs h-10 gap-2 cursor-not-allowed opacity-90 shadow-2xs"
                >
                  <Clock className="h-4 w-4 text-amber-800" />
                  <span>Check Back Later...</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                  Governing Framework & Principles Overview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Foundational pillars established under the College of Basic Sciences Chapter
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-[#145a32]">
                <Shield className="h-3.5 w-3.5" />
                <span>Collegiate Principles</span>
              </span>
            </div>

            <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
              <div className="rounded-xl border border-emerald-800/15 bg-emerald-50/50 p-4">
                <h4 className="flex items-center gap-2 font-display text-xs font-bold text-[#145a32] uppercase tracking-wider">
                  <ScrollText className="h-4 w-4" />
                  Guiding Preamble
                </h4>
                <p className="mt-2 text-slate-700 italic leading-relaxed">
                  "We, the Science Students of Lagos State University of Science and Technology (LASUSTECH),
                  conscious of our historical mission to foster scientific discovery, academic excellence,
                  uncompromising integrity, and student welfare across all basic science departments,
                  remain committed to constitutional governance, transparency, and collegiate fellowship."
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="border-b border-slate-100 pb-4">
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    Chapter I: Supremacy of the Constitution
                  </h4>
                  <p className="mt-1 text-slate-600">
                    The Constitution shall be supreme and binding upon all recognized departmental bodies, executive councils, student parliamentarians, and undergraduate scholars across all constituent science departments.
                  </p>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    Chapter II: Student Rights, Welfare & Advocacy
                  </h4>
                  <p className="mt-1 text-slate-600">
                    Every registered science student possesses fundamental rights to equitable representation, academic grievance redress, access to collegiate resources, and democratic participation in student unionism.
                  </p>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    Chapter III: Separation of Powers
                  </h4>
                  <p className="mt-1 text-slate-600">
                    Institutional governance is partitioned between the Student Executive Council (SEC) for administrative execution, and the Student Representative Council (SRC) for legislative oversight and budgetary approval.
                  </p>
                </div>

                <div>
                  <h4 className="font-display text-sm font-bold text-slate-900">
                    Chapter IV: Electoral Guidelines
                  </h4>
                  <p className="mt-1 text-slate-600">
                    Democratic transitions shall be overseen by the independent NASS-IEC, guaranteeing free, fair, and transparent electronic and physical collegiate balloting.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Home</span>
                  </Button>
                </Link>

                <p className="text-[11px] text-slate-400 italic">
                  Official PDF will be published upon conclusion of SRC legislative readings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Constitution;
