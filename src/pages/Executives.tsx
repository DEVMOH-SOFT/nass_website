import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ExecutiveCard from "@/components/ExecutiveCard";
import { executives as fallbackExecutives, Executive } from "@/data/executives";
import { fetchExecutives } from "@/lib/content-service";

const Executives = () => {
  const [execList, setExecList] = useState<Executive[]>(fallbackExecutives);

  useEffect(() => {
    fetchExecutives().then((data) => {
      if (data && data.length > 0) {
        setExecList(data);
      }
    });
  }, []);

  const presidium = execList.filter((e) => e.arm === "SEC" && (e.post.toLowerCase().includes("president")));
  const cabinet = execList.filter((e) => e.arm === "SEC" && !e.post.toLowerCase().includes("president"));
  const srcOfficers = execList.filter((e) => e.arm === "SRC" && (e.post.toLowerCase().includes("speaker") || e.post.toLowerCase().includes("clerk") || e.post.toLowerCase().includes("whip")));
  const srcMembers = execList.filter((e) => e.arm === "SRC" && !e.post.toLowerCase().includes("speaker") && !e.post.toLowerCase().includes("clerk") && !e.post.toLowerCase().includes("whip"));

  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL LEADERSHIP BANNER            */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-[#061d10] text-white py-8 sm:py-10 border-b border-emerald-950">
        <div className="container relative z-10">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-[#071d33]/90 px-3.5 py-1 text-xs font-semibold text-sky-300 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>COLLEGE OF BASIC SCIENCES • LASUSTECH</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Collegiate Leadership Directory
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                The constitutionally elected officers of the Student Executive Council (SEC) and the Student Representative Council (SRC) administering student affairs, advocacy, and academic governance across all 5 basic science departments.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  2026/2027 Collegiate Administration
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>Dual Arms: Executive Council (SEC) & Legislature (SRC)</span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>5 Constituent Science Departments</span>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-widest">
                  Governance Structure
                </span>
                <p className="font-display text-base font-bold text-white mt-1">
                  Apex Student Governance
                </p>
                <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                  Steering academic welfare, inter-departmental collaboration, and constitutional representation under the NASS Supreme Constitution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Sections */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-[#061d10] via-[#04170e] to-[#020e07] text-white border-t border-emerald-950">
        <div className="container max-w-6xl space-y-10">
          {/* ======================================================== */}
          {/* SECTION 1: STUDENT EXECUTIVE COUNCIL (SEC)              */}
          {/* ======================================================== */}
          <div>
            <div className="mb-5">
              <span className="inline-block rounded-full bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Arm 1: Student Executive Council (SEC)
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
                Executive Presidium
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/70 mt-1 max-w-2xl">
                The apex student executive officers directing collegiate administration, student welfare, and college-level initiatives.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="grid gap-6 w-full max-w-3xl sm:grid-cols-2">
                {presidium.map((exec) => (
                  <ExecutiveCard key={exec.name} {...exec} />
                ))}
              </div>
            </div>
          </div>

          {/* Cabinet Officers */}
          <div className="pt-8 border-t border-emerald-900/50">
            <div className="mb-5">
              <span className="inline-block rounded-full bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Cabinet Officers & Council Directors
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
                Council Secretariat & Portfolio Directors
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/70 mt-1 max-w-2xl">
                Executive directors managing academic affairs, treasury, public relations, welfare, sports, and social programs.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cabinet.map((exec) => (
                <ExecutiveCard key={exec.name} {...exec} />
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: STUDENT REPRESENTATIVE COUNCIL (SRC)         */}
          {/* ======================================================== */}
          <div className="pt-8 border-t-2 border-sky-900/50">
            <div className="mb-5">
              <span className="inline-block rounded-full bg-sky-950/90 border border-sky-400/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                Arm 2: Student Representative Council (SRC)
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
                Parliamentary Presiding Officers
              </h2>
              <p className="text-xs sm:text-sm text-sky-200/70 mt-1 max-w-2xl">
                The presiding leadership of the legislative chamber overseeing constitutional governance, debates, and official records.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="grid gap-6 w-full max-w-5xl sm:grid-cols-2 lg:grid-cols-4">
                {srcOfficers.map((exec) => (
                  <ExecutiveCard key={exec.name} {...exec} />
                ))}
              </div>
            </div>
          </div>

          {/* Departmental Honorables */}
          <div className="pt-8 border-t border-sky-900/30">
            <div className="mb-5">
              <span className="inline-block rounded-full bg-sky-950/90 border border-sky-400/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                Legislative Chamber
              </span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
                Departmental Honorable Members
              </h2>
              <p className="text-xs sm:text-sm text-sky-200/70 mt-1 max-w-2xl">
                Elected representatives advocating student welfare and legislative motions across the 5 constituent basic science departments.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {srcMembers.map((exec) => (
                <ExecutiveCard key={exec.name} {...exec} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Executives;
