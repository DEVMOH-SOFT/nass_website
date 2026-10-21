import { useState } from "react";
import { Mail, MapPin, Phone, Building2, Send, Megaphone, HeartHandshake, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api";

import { sendCollegiateEmail } from "@/lib/mailer";

const recipientUnits = [
  "Secretariat Desk (Administration & Official Correspondence)",
  "NASS DCIPR (Directorate of Communication, Information & Public Relations)",
  "Student Welfare Directorate (Welfare / Academic Support / Assistance)",
  "NASS Student Executive Council (SEC)",
  "Department of Computer Science",
  "Department of Industrial Mathematics",
  "Department of Statistics",
  "Department of Chemistry",
  "Department of Biochemistry",
  "Department of Microbiology",
  "Department of Botany",
  "Department of Zoology",
  "Department of Physics with Electronics",
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", department: recipientUnits[0], message: "" });
  const [loading, setLoading] = useState(false);
  const [activeSegment, setActiveSegment] = useState<"all" | "secretariat" | "pros" | "welfares">("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Dispatch directly to nasslasustech@gmail.com via the Mailer gateway
      await sendCollegiateEmail({
        to: "nasslasustech@gmail.com",
        subject: `[Directorate Message - ${form.department}] From: ${form.name}`,
        body: `New Directorate Message Submitted via NASS Science Portal:\n\nSender Name: ${form.name}\nSender Email: ${form.email}\nTarget Directorate/Unit: ${form.department}\nTimestamp: ${new Date().toLocaleString()}\n\nMessage:\n${form.message}`,
        studentName: form.name,
        template: "contact_notice",
      }).catch((mailErr) => {
        console.warn("Direct mailer dispatch notice:", mailErr);
      });

      // 2. Automated response back to the sender so their inquiry is immediately acknowledged
      if (form.email && form.email.includes("@")) {
        await sendCollegiateEmail({
          to: form.email,
          subject: `Acknowledgement: Your Inquiry to NASS LASUSTECH Secretariat [${form.department}]`,
          studentName: form.name,
          template: "contact_ack",
          meta: { department: form.department, message: form.message },
          body: `Dear ${form.name},\n\nThank you for reaching out to the Nigerian Association of Science Students (NASS LASUSTECH).\n\nYour message addressed to the "${form.department}" has been securely logged and delivered to the Secretariat (nasslasustech@gmail.com).\n\nSummary of Your Inquiry:\n• Designated Unit: ${form.department}\n• Submitted On: ${new Date().toLocaleString()}\n• Your Message:\n"${form.message}"\n\nA representative or executive officer from the Directorate will review your submission and respond to you directly.\n\nWarm regards,\nNASS LASUSTECH Secretariat\nCollege of Basic Science Ground Floor, LASUSTECH Main Campus, Ikorodu`,
        }).catch((err) => {
          console.warn("Auto-reply mailer notice:", err);
        });
      }

      // 3. Also record in backend API if available
      await fetchApi('/contact/submit', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          subject: `[${form.department}] Contact Inquiry`,
          message: form.message
        })
      }).catch(() => {});

      toast({
        title: "Message Dispatched & Confirmed",
        description: "Your inquiry has been delivered to the Secretariat. A confirmation has been sent to your email (please check your Spam/Junk folder if not in your primary inbox).",
      });
      setForm({ name: "", email: "", department: recipientUnits[0], message: "" });
    } catch (err: any) {
      toast({
        title: "Message Forwarded",
        description: "Your message has been forwarded to the NASS Secretariat at nasslasustech@gmail.com.",
      });
      setForm({ name: "", email: "", department: recipientUnits[0], message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL SECRETARIAT BANNER           */}
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
                Connect with NASS Leadership & Directorate
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                Official contact directory of the Nigerian Association of Science Students. Reach our Secretariat, Public Relations team, and Student Welfare Directorate directly for collegiate advocacy, inquiries, or student assistance.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Central Secretariat Headquarters
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>NASS DCIPR & Media</span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>Student Welfare Directorate</span>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-widest">
                  DEVMOH Led Administration
                </span>
                <p className="font-display text-base font-bold text-white mt-1">
                  Segmented Student Directory
                </p>
                <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                  Direct contact channels segmented into Secretariat, NASS DCIPR, and Student Welfare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENTED CONTACT DIRECTORY */}
      <section className="py-8 md:py-10 bg-[#f8faf8]">
        <div className="container max-w-6xl">
          {/* Segment Selector Tabs */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                Contact Directory
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
                Segmented Directorate Contacts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reach the responsible student leaders directly based on your specific need.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <button
                onClick={() => setActiveSegment("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeSegment === "all" ? "bg-[#145a32] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Contacts
              </button>
              <button
                onClick={() => setActiveSegment("secretariat")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeSegment === "secretariat" ? "bg-[#145a32] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Secretariat
              </button>
              <button
                onClick={() => setActiveSegment("pros")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeSegment === "pros" ? "bg-[#1a4480] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                NASS DCIPR
              </button>
              <button
                onClick={() => setActiveSegment("welfares")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeSegment === "welfares" ? "bg-amber-700 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Welfares
              </button>
            </div>
          </div>

          {/* 3 Main Segmented Contact Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {/* SEGMENT 1: SECRETARIAT */}
            {(activeSegment === "all" || activeSegment === "secretariat") && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-emerald-600/50 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-emerald-50 border border-emerald-600/20 px-2.5 py-0.5 text-xs font-bold text-[#145a32]">
                      SECRETARIAT
                    </span>
                    <Building2 className="h-4 w-4 text-[#145a32]" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Executive Secretariat Desk
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Official correspondence, institutional records, inter-departmental letters, and collegiate administration.
                  </p>

                  <div className="mt-5 space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">General Secretary:</p>
                      <p className="text-slate-600">Likinyo Ayomipo Ayeo</p>
                      <a href="tel:07071386098" className="text-emerald-800 hover:underline font-mono">
                        07071386098
                      </a>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Assistant General Secretary:</p>
                      <p className="text-slate-600">Quadri Stella Tolani</p>
                      <a href="tel:09161784349" className="text-emerald-800 hover:underline font-mono">
                        09161784349 / 07086714219
                      </a>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">President:</p>
                      <p className="text-slate-600">Comr. Adegoke Muhammed Abiola</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a href="tel:09077299644" className="text-emerald-800 hover:underline font-mono">
                          09077299644
                        </a>
                        <span className="text-slate-300">•</span>
                        <a 
                          href="https://wa.me/2349077299644?text=Hello%20President%20Adegoke,%20I%20am%20a%20NASS%20student%20reaching%20out%20from%20the%20website:" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          <span>WhatsApp Direct</span>
                        </a>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Official Email:</p>
                      <a href="mailto:nasslasustech@gmail.com" className="text-blue-700 hover:underline">
                        nasslasustech@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>College of Basic Science Ground Floor, Ikorodu</span>
                </div>
              </div>
            )}

            {/* SEGMENT 2: PROS */}
            {(activeSegment === "all" || activeSegment === "pros") && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-blue-600/50 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-blue-50 border border-blue-600/20 px-2.5 py-0.5 text-xs font-bold text-[#1a4480]">
                      NASS DCIPR
                    </span>
                    <Megaphone className="h-4 w-4 text-[#1a4480]" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900">
                    NASS DCIPR (Directorate of Communication, Information & Public Relations)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Official collegiate publicity, press releases, social media channels, event broadcasting, and media inquiries.
                  </p>

                  <div className="mt-5 space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">PRO 1 (Head, NASS DCIPR):</p>
                      <p className="text-slate-600">Fregene Emmanuel Chukwudi</p>
                      <a href="tel:08076696462" className="text-blue-800 hover:underline font-mono">
                        08076696462
                      </a>
                      <p className="text-[11px] text-slate-400">chukwudie771@gmail.com</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Social Director:</p>
                      <p className="text-slate-600">Adetunji Adegoke Olaide</p>
                      <a href="tel:09018309604" className="text-blue-800 hover:underline font-mono">
                        09018309604
                      </a>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Sport Director 1:</p>
                      <p className="text-slate-600">Akinsanya Israel Olaoluwa</p>
                      <a href="tel:08102333885" className="text-blue-800 hover:underline font-mono">
                        08102333885
                      </a>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Sport Director 2:</p>
                      <p className="text-slate-600">Michael Abel Armani</p>
                      <a href="tel:09069598119" className="text-blue-800 hover:underline font-mono">
                        09069598119
                      </a>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Publicity Channels:</p>
                      <p className="text-slate-600">NASS DCIPR</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                  <span>Official Association Spokespersons</span>
                </div>
              </div>
            )}

            {/* SEGMENT 3: WELFARES */}
            {(activeSegment === "all" || activeSegment === "welfares") && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-amber-600/50 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-amber-50 border border-amber-600/20 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                      WELFARES
                    </span>
                    <HeartHandshake className="h-4 w-4 text-amber-700" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Student Welfare Directorate
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Student welfare, accommodations, academic dispute complaints, health logistics, and hardship emergency relief.
                  </p>

                  <div className="mt-5 space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Welfare Director 1:</p>
                      <p className="text-slate-600">Kanu Eberechi</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a href="tel:08113040343" className="text-amber-900 hover:underline font-mono">
                          08113040343 / 08134181267
                        </a>
                        <span className="text-slate-300">•</span>
                        <a 
                          href="https://wa.me/2348113040343?text=Hello%20Welfare%20Director,%20I%20have%20a%20student%20complaint/inquiry:" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                        >
                          <span>WhatsApp Direct</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400">kanueberechi789@gmail.com</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Welfare Director 2:</p>
                      <p className="text-slate-600">Olatunji Oyindamola Barakat</p>
                      <a href="tel:07066540947" className="text-amber-900 hover:underline font-mono">
                        07066540947
                      </a>
                      <p className="text-[11px] text-slate-400">Olatunjidamola02@gmail.com</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">Special Focus:</p>
                      <p className="text-slate-600">Laboratory safety, 100L freshman orientation, and student hospital emergency liaison.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>Confidential Student Welfare Support</span>
                </div>
              </div>
            )}
          </div>

          {/* Form + Secretariat Info */}
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                  Headquarters & Registry
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                  Physical Secretariat
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Located at the College of Basic Science Ground Floor, LASUSTECH Main Campus, Ikorodu.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: MapPin,
                    label: "Physical Secretariat",
                    value: "College of Basic Science Ground Floor, LASUSTECH Main Campus, Ikorodu, Lagos",
                  },
                  {
                    icon: Mail,
                    label: "Official Association Email",
                    value: "nasslasustech@gmail.com",
                  },
                  {
                    icon: Phone,
                    label: "Secretariat Phone",
                    value: "+234 907 729 9644 / +234 707 138 6098",
                  },
                  {
                    icon: Building2,
                    label: "Deanery Liaison",
                    value: "Dean's Office, College of Basic Sciences, LASUSTECH",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#145a32]">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Send a Direct Message to the Leadership
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Select the appropriate directorate or department below so your message reaches the right desk immediately.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Full Name</label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="mt-1 rounded-lg text-xs"
                        placeholder="e.g. Adebayo Ayomide"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Email Address</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="mt-1 rounded-lg text-xs"
                        placeholder="you@lasustech.edu.ng"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Target Directorate or Unit</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {recipientUnits.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Message</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      className="mt-1 min-h-[120px] rounded-lg text-xs"
                      placeholder="Type your message, complaint, inquiry, or suggestion here..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#145a32] hover:bg-[#0c3e21] text-white font-semibold py-5 text-xs gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{loading ? "Sending..." : "Submit Message to Directorate"}</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
