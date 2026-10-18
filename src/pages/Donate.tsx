import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Heart,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Building2,
  Flame,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api";
import { triggerKorapayCheckout } from "@/lib/korapay";

const PRESET_TIERS = [
  { amount: 2000, label: "Event Supporter", desc: "Grassroots Event Contributor" },
  { amount: 5000, label: "Initiative Patron", desc: "Workshop & Seminar Materials" },
  { amount: 10000, label: "Hackathon Sponsor", desc: "Student Innovation Project Support" },
  { amount: 25000, label: "Collegiate Partner", desc: "Flagship Science Week Sponsor" },
  { amount: 50000, label: "Dean's Circle Sponsor", desc: "Major College-Wide Initiative" },
];

const FUND_ALLOCATIONS = [
  "General Collegiate Events & Student Initiatives (Greatest Need)",
  "Flagship College Science Week & Symposium",
  "Student Hackathons & Tech Innovation Challenges",
  "Academic Outreach, STEM Bootcamps & Mentorship Clinics",
  "Student Welfare Support & Meritorious Event Awards",
];

const Donate = () => {
  const [amount, setAmount] = useState<number | "">(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [allocation, setAllocation] = useState(FUND_ALLOCATIONS[0]);
  const [donorRole, setDonorRole] = useState("Alumni / Well-wisher");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectTier = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setAmount(val ? Number(val) : "");
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(amount);

    if (!finalAmount || finalAmount < 500) {
      toast({
        title: "Invalid Sponsorship Amount",
        description: "Please specify a sponsorship contribution of at least ₦500.",
        variant: "destructive",
      });
      return;
    }

    if (!email || !name) {
      toast({
        title: "Donor Information Required",
        description: "Please provide your full name and email address for official receipting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetchApi("/payments/donate", {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: finalAmount,
          full_name: `${name} [${donorRole} - ${allocation}]`,
        }),
      });

      if (res?.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }
    } catch (err: any) {
      console.warn("Backend donate endpoint offline, launching direct Korapay checkout:", err.message);
    }

    // Direct inline Korapay modal checkout
    const opened = await triggerKorapayCheckout({
      amount: finalAmount,
      email,
      name,
      reference: `NASS-SPONSOR-${Date.now()}`,
      merchant_bears_cost: false,
      narration: `NASS Sponsorship - ${allocation} (${name})`,
      onSuccess: () => {
        toast({
          title: "Sponsorship Contribution Successful!",
          description: `Thank you for contributing ₦${finalAmount.toLocaleString()} to NASS events and initiatives.`,
        });
        setLoading(false);
      },
      onClose: () => {
        setLoading(false);
      },
      onFailed: (err: any) => {
        toast({
          title: "Transaction Incomplete",
          description: err?.message || "Payment could not be processed.",
          variant: "destructive",
        });
        setLoading(false);
      },
    });

    if (!opened) {
      toast({
        title: "Gateway Initialization Error",
        description: "Failed to initialize Korapay payment gateway. Please verify network access.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* ======================================================== */}
      {/* 1. EXECUTIVE INSTITUTIONAL SPONSORSHIP BANNER            */}
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
                Academic Events & Student Initiatives Sponsorship
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                Partner with NASS LASUSTECH to empower over 4,500 natural and computational science scholars. Your sponsorship directly funds landmark collegiate events, technological hackathons, student innovation challenges, and leadership development initiatives.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Official College Sponsorship
                </span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>Transparently Audited by Student Executive Council</span>
                <span className="text-emerald-700 hidden sm:inline">•</span>
                <span>Secured via Korapay Institutional Gateway</span>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-xl border border-white/20 bg-[#072414]/90 p-5 shadow-xl backdrop-blur-md max-w-xs text-white">
                <span className="text-[10.5px] font-bold text-sky-300 uppercase tracking-widest">
                  Direct Impact
                </span>
                <p className="font-display text-base font-bold text-white mt-1">
                  Events & Initiatives
                </p>
                <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                  100% of sponsorship contributions are channeled directly into student hackathons, Science Week, workshops, and scholar empowerment programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-8 md:py-10 bg-[#f8faf8]">
        <div className="container max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            
            {/* Left Column: Sponsorship Impact & Scientific Pillars */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#145a32]">
                  Strategic Priorities
                </span>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Where Your Sponsorship Directs Impact
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Every sponsorship commitment to the NASS LASUSTECH Chapter is designated to supporting high-impact collegiate events and transformative student initiatives.
                </p>
              </div>

              {/* 4 Pillars Focused on Events & Initiatives */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#145a32] mb-3">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Flagship Science Week & Symposium
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Sponsoring the landmark annual College Science Week, research symposiums, keynote panel sessions, and scientific exhibitions bringing together all 5 departments.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1a4480] mb-3">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Hackathons & Innovation Challenges
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Funding competitive software hackathons, biotech pitch contests, robotics exhibitions, and data challenges with prize bounties and project seed-grants.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800 mb-3">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Outreach & Mentorship Initiatives
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Supporting intensive pre-exam tutorial bootcamps, secondary school STEM outreach, peer-to-peer research clinics, and leadership development workshops.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-800 mb-3">
                    <Award className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Scholar Empowerment & Event Awards
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Underwriting event logistics, student conference attendance grants, competition awards, and recognizing outstanding student innovators.
                  </p>
                </div>
              </div>

              {/* Institutional Accountability Box */}
              <div className="rounded-xl border border-emerald-800/15 bg-emerald-50/50 p-5">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-[#145a32] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-display text-xs font-bold text-[#145a32] uppercase tracking-wider">
                      Fiduciary Governance & Transparency
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      All sponsorship funds are administered under the joint oversight of the Student Executive Council (SEC) and the Deanery Liaison. Complete disbursement audits and event impact reports are published to all constituent departments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Formal Sponsorship Contribution Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#145a32]">
                    Official Sponsorship Portal
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                    Sponsorship Contribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a sponsorship tier or enter a custom contribution amount.
                  </p>
                </div>

                <form onSubmit={handleDonate} className="space-y-4">
                  {/* Preset Tiers */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                      Sponsorship Tier
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_TIERS.map((tier) => {
                        const isSelected = amount === tier.amount && !customAmount;
                        return (
                          <button
                            key={tier.amount}
                            type="button"
                            onClick={() => handleSelectTier(tier.amount)}
                            className={`rounded-lg border p-2.5 text-left transition-all ${
                              isSelected
                                ? "border-[#145a32] bg-emerald-50/70 text-[#145a32] ring-1 ring-[#145a32]"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="font-bold text-xs">₦{tier.amount.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500 font-medium truncate">{tier.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Or Custom Sponsorship (₦)
                    </label>
                    <Input
                      type="number"
                      min={500}
                      step={500}
                      placeholder="e.g. 15,000"
                      value={customAmount}
                      onChange={handleCustomChange}
                      className="rounded-lg text-xs"
                    />
                  </div>

                  {/* Fund Allocation Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Designate Event or Initiative
                    </label>
                    <select
                      value={allocation}
                      onChange={(e) => setAllocation(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {FUND_ALLOCATIONS.map((alloc) => (
                        <option key={alloc} value={alloc}>
                          {alloc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Donor Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Sponsor / Organization Name
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Dr. A. B. Adeyemi / Tech Partner / Class of 2024"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-lg text-xs"
                    />
                  </div>

                  {/* Donor Email */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Official Receipt Email
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="sponsor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg text-xs"
                    />
                  </div>

                  {/* Donor Designation */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Affiliation / Category
                    </label>
                    <select
                      value={donorRole}
                      onChange={(e) => setDonorRole(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Alumni">College Alumni</option>
                      <option value="Corporate / Brand Partner">Corporate / Brand Partner</option>
                      <option value="Faculty / Staff">Faculty / University Staff</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Student Scholar">Science Student Scholar</option>
                      <option value="Well-wisher">Friend of Basic Sciences</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#145a32] hover:bg-[#0c3e21] text-white font-semibold py-5 text-xs gap-1.5 shadow-xs"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current text-white" />
                    <span>
                      {loading
                        ? "Connecting Gateway..."
                        : `Contribute ₦${(Number(amount) || 0).toLocaleString()} to Sponsorship`}
                    </span>
                  </Button>

                  <p className="text-[10px] text-slate-400 text-center leading-normal">
                    Transactions are routed via Korapay 256-bit SSL encrypted institutional gateway. Official collegiate receipts are automatically dispatched upon clearance.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
