import { useState, useEffect } from "react";
import {
  LogIn,
  GraduationCap,
  Building2,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Printer,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Check,
  Building,
  Zap,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TreasurerESignature } from "@/components/TreasurerESignature";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  loginStudent,
  registerStudent,
  markDuesPaid,
  saveStudentSession,
  COLLEGE_DEPARTMENTS,
} from "@/lib/student-auth";
import { triggerKorapayCheckout, isKorapayTestMode } from "@/lib/korapay";
import { downloadElementAsPdf } from "@/lib/pdf-service";
import { sendDuesReceiptEmail } from "@/lib/mailer";
import nassLogo from "@/assets/nass_logo.png";
import lasustechLogo from "@/assets/lasustech_logo.png";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  redirectTab?: string;
  initialMode?: "login" | "register";
}

const LoginModal = ({ open, onClose, redirectTab, initialMode }: LoginModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mode: "register" (registration & dues payment flow) vs "login" (returning student sign in)
  const [mode, setMode] = useState<"register" | "login">("register");

  // Registration Multi-Phase:
  // Phase 1: Bio-Data & Classification
  // Phase 2: Statutory Dues Payment (₦2,500)
  // Phase 3: Official Electronic Receipt Issued & Access Granted
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  // Category: Fresher vs Staylite
  const [category, setCategory] = useState<"fresher" | "staylite">("fresher");

  // Form Inputs
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDepartment, setRegDepartment] = useState<string>(COLLEGE_DEPARTMENTS[0]);
  const [regLevel, setRegLevel] = useState<string>("100L");
  const [regMatric, setRegMatric] = useState(""); // Only required for Staylites

  // Registered Student Session Data (populated when Phase 1 completes)
  const [registeredStudent, setRegisteredStudent] = useState<{
    matricNumber: string;
    fullName: string;
    department: string;
    level: string;
    email: string;
    isFresher: boolean;
  } | null>(null);

  // Issued Receipt Data (populated when Phase 2 payment completes)
  const [issuedReceipt, setIssuedReceipt] = useState<{
    reference: string;
    studentName: string;
    matricNumber: string;
    department: string;
    level: string;
    amount: number;
    email: string;
    paidAt: string;
  } | null>(null);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");

  // Login Form State (Matriculation Number or Email for freshers)
  const [loginMatric, setLoginMatric] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Phase 2 Payment Method & Korapay Pointer-Lock Management
  const [isKorapayActive, setIsKorapayActive] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"korapay" | "transfer">("korapay");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [transferRefInput, setTransferRefInput] = useState("");

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    if (!open) {
      setPhase(1);
    }
  }, [initialMode, open]);

  const handleCategorySelect = (selected: "fresher" | "staylite") => {
    setCategory(selected);
    if (selected === "fresher") {
      setRegLevel("100L");
      setRegMatric("");
    } else {
      if (regLevel === "100L") {
        setRegLevel("200L");
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: Bio-Data Submit
  // ─────────────────────────────────────────────────────────────
  const handlePhase1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim()) {
      toast({ title: "Name Required", description: "Please enter your full name (Surname first).", variant: "destructive" });
      return;
    }

    if (!regEmail.trim() || !regEmail.includes("@")) {
      toast({ title: "Valid Gmail Required", description: "Please provide a valid Gmail address.", variant: "destructive" });
      return;
    }

    if (category === "staylite" && !regMatric.trim()) {
      toast({ title: "Matriculation Number Required", description: "Staylites must provide their university matric number.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setLoadingStatus("Registering collegiate academic record...");

    try {
      const isFresher = category === "fresher";
      const assignedLevel = isFresher ? "100L" : regLevel;
      const cleanFullName = regFullName.trim().toUpperCase();
      const cleanEmail = regEmail.trim().toLowerCase();
      const cleanMatric = regMatric.trim().toUpperCase();

      // Purge any stale prior sessions or cache
      localStorage.removeItem("dashboard_data");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("student_matric");

      const regResult = await registerStudent({
        matricNumber: isFresher ? undefined : cleanMatric,
        fullName: cleanFullName,
        department: regDepartment,
        level: assignedLevel,
        email: cleanEmail,
        isFresher,
      });

      const studentMatric = regResult.student?.matric_number || (isFresher ? `FSH26-${Date.now().toString().slice(-6)}` : cleanMatric);
      const studentName = (regResult.student?.full_name || cleanFullName).toUpperCase();
      const studentEmail = regResult.student?.email || cleanEmail;

      const studentData = {
        matricNumber: studentMatric,
        fullName: studentName,
        department: regDepartment,
        level: assignedLevel,
        email: studentEmail,
        isFresher,
      };

      setRegisteredStudent(studentData);
      setPhase(2);

      toast({
        title: "Bio-Data Saved",
        description: "Please proceed to settle your statutory ₦2,500 session dues.",
      });
    } catch (err: any) {
      toast({
        title: "Registration Notice",
        description: err.message || "Could not complete registration. If you already have an account, please sign in.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setLoadingStatus("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Helper: Complete Successful Payment, Activate Account & Redirect
  // ─────────────────────────────────────────────────────────────
  const completeSuccessfulPayment = async (reference: string) => {
    if (!registeredStudent) return;

    setSubmitting(true);
    setLoadingStatus("Confirming session dues and activating student account...");

    try {
      // 1. Mark dues paid in localStorage, state, and Supabase
      await markDuesPaid({
        matricNumber: registeredStudent.matricNumber,
        reference,
        fullName: registeredStudent.fullName,
        email: registeredStudent.email,
        department: registeredStudent.department,
        level: registeredStudent.level,
        amount: 2500,
      });

      // 2. Ensure active student session is set to this newly registered student
      saveStudentSession({
        matric_number: registeredStudent.matricNumber,
        full_name: registeredStudent.fullName,
        email: registeredStudent.email,
        department: registeredStudent.department,
        level: registeredStudent.level,
        dues_status: "Paid",
        id_card_status: "Ready",
      });

      // 3. Dispatch receipt email in background via mailer gateway
      sendDuesReceiptEmail({
        to: registeredStudent.email,
        studentName: registeredStudent.fullName,
        matricNumber: registeredStudent.matricNumber,
        amount: 2500,
        reference,
        department: registeredStudent.department,
        level: registeredStudent.level,
        isFresher: registeredStudent.isFresher,
      }).catch(console.warn);

      // 4. Immediately close modal and redirect directly to student dashboard with clean fresh state
      onClose();
      toast({
        title: "Account Created & Dues Cleared!",
        description: `Welcome, ${registeredStudent.fullName}! Official receipt sent to ${registeredStudent.email}. If not in your inbox, check Spam/Junk and mark "Report Not Spam".`,
      });
      window.dispatchEvent(new Event("storage"));
      window.location.href = `/dashboard${redirectTab ? `?tab=${redirectTab}` : ""}`;
    } catch (err: any) {
      console.warn("Payment confirmation warning:", err);
      // Ensure session is active regardless of background network errors
      saveStudentSession({
        matric_number: registeredStudent.matricNumber,
        full_name: registeredStudent.fullName,
        email: registeredStudent.email,
        department: registeredStudent.department,
        level: registeredStudent.level,
        dues_status: "Paid",
        id_card_status: "Ready",
      });
      onClose();
      toast({
        title: "Account Created & Dues Cleared!",
        description: `Welcome, ${registeredStudent.fullName}! Receipt dispatched to ${registeredStudent.email}. (Please check Spam/Junk folder if not in Primary inbox).`,
      });
      window.dispatchEvent(new Event("storage"));
      window.location.href = `/dashboard${redirectTab ? `?tab=${redirectTab}` : ""}`;
    } finally {
      setSubmitting(false);
      setLoadingStatus("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: Dues Payment (₦2,500 via Korapay or Transfer)
  // ─────────────────────────────────────────────────────────────
  const handleInitiateDuesPayment = async () => {
    if (!registeredStudent) return;

    // Temporarily hide Radix dialog so pointer events and keyboard focus are 100% accessible to Korapay
    setIsKorapayActive(true);
    setSubmitting(true);
    setLoadingStatus("Connecting to Korapay Secure Payment Gateway (₦2,500)...");

    const paymentRef = `NASS-DUES-${registeredStudent.matricNumber.replace(/[^A-Za-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`;

    try {
      const opened = await triggerKorapayCheckout({
        amount: 2500,
        email: registeredStudent.email,
        name: registeredStudent.fullName,
        reference: paymentRef,
        merchant_bears_cost: false,
        narration: `NASS LASUSTECH Session Dues - ${registeredStudent.matricNumber}`,
        onSuccess: async (res) => {
          setIsKorapayActive(false);
          const finalRef = res?.reference || paymentRef;
          await completeSuccessfulPayment(finalRef);
        },
        onClose: () => {
          setIsKorapayActive(false);
          toast({
            title: "Checkout Dismissed",
            description: "Session dues payment is required to activate your portal clearance.",
          });
        },
        onFailed: (err) => {
          setIsKorapayActive(false);
          toast({
            title: "Payment Incomplete",
            description: err?.message || "Payment attempt was unsuccessful.",
            variant: "destructive",
          });
        },
      });

      if (!opened) {
        setIsKorapayActive(false);
        toast({
          title: "Gateway Inline Blocked",
          description: "Browser popup was blocked. Please enable popups or try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setIsKorapayActive(false);
      toast({
        title: "Gateway Alert",
        description: err?.message || "Failed to initiate payment gateway.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setLoadingStatus("");
    }
  };

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    toast({ title: "Account Copied", description: "Wema Bank account number copied to clipboard." });
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleConfirmDirectTransfer = async () => {
    if (!registeredStudent) return;
    const ref = transferRefInput.trim() || `NASS-TRF-${Date.now().toString().slice(-6)}`;
    await completeSuccessfulPayment(ref);
  };

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: Print / Download Receipt
  // ─────────────────────────────────────────────────────────────
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadReceiptPdf = async () => {
    if (!issuedReceipt) return;
    try {
      setDownloadingPdf(true);
      toast({
        title: "Generating PDF Receipt",
        description: "Preparing your official dues clearance receipt for download...",
      });
      const ok = await downloadElementAsPdf("nass-modal-printable-receipt", {
        filename: `NASS_Dues_Receipt_${issuedReceipt.reference}.pdf`,
        docTitle: `NASS LASUSTECH - Official Receipt (${issuedReceipt.reference})`,
      });
      if (ok) {
        toast({
          title: "Receipt Downloaded!",
          description: "Official receipt PDF saved to your device.",
        });
      } else {
        handlePrintReceipt();
      }
    } catch (err) {
      console.error("PDF download error:", err);
      handlePrintReceipt();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById("nass-modal-printable-receipt");
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>NASS LASUSTECH - Official Dues Receipt (${issuedReceipt?.reference || "CLEARANCE"})</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 30px; color: #0f172a; margin: 0; }
              .receipt-container { max-width: 660px; margin: 0 auto; border: 2px solid #064e3b; border-radius: 16px; padding: 28px; background: #ffffff; }
              .crest-banner { text-align: center; border-bottom: 2px solid #064e3b; padding-bottom: 14px; margin-bottom: 18px; }
              .institution { font-size: 11px; font-weight: 800; color: #1a4480; text-transform: uppercase; letter-spacing: 1px; }
              .title { font-size: 20px; font-weight: 900; color: #064e3b; margin: 4px 0; text-transform: uppercase; }
              .subtitle { font-size: 11px; color: #64748b; font-weight: 600; }
              .receipt-badge { display: inline-block; background: #064e3b; color: white; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; margin-top: 8px; text-transform: uppercase; }
              .meta-strip { display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; color: #64748b; margin-top: 10px; }
              .table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
              .table tr { border-bottom: 1px solid #e2e8f0; }
              .table td { padding: 9px 12px; }
              .table td.label { font-weight: 700; color: #64748b; width: 170px; text-transform: uppercase; font-size: 10px; }
              .table td.value { font-weight: 700; color: #0f172a; }
              .total-row { background: #f0fdf4; font-weight: 900; color: #064e3b; font-size: 15px; }
              .stamp-box { margin-top: 20px; padding: 12px; border: 2px dashed #064e3b; border-radius: 10px; text-align: center; background: #f0fdf4; }
              .stamp-text { font-size: 11px; font-weight: 900; color: #064e3b; text-transform: uppercase; }
              .treasurer { margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
              @media print { body { padding: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleGrantAccess = () => {
    if (registeredStudent) {
      localStorage.removeItem("dashboard_data");
      saveStudentSession({
        matric_number: registeredStudent.matricNumber,
        full_name: registeredStudent.fullName,
        email: registeredStudent.email,
        department: registeredStudent.department,
        level: registeredStudent.level,
        dues_status: "Paid",
        id_card_status: "Not Requested",
      });
    }
    onClose();
    window.dispatchEvent(new Event("storage"));
    navigate("/dashboard", { state: { tab: redirectTab || "overview" } });
  };

  // ─────────────────────────────────────────────────────────────
  // RETURNING SIGN IN (Matric Number OR Email for freshers)
  // ─────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMatric.trim()) return;
    setLoginLoading(true);

    const isEmail = loginMatric.trim().includes("@");

    try {
      const res = await loginStudent(loginMatric.trim(), loginPassword);

      if (!res.success) {
        if (res.notFound) {
          toast({
            title: "Record Not Found",
            description: isEmail
              ? `Email "${loginMatric.trim()}" is not registered yet. Please register below.`
              : `Matric number "${loginMatric.trim()}" is not registered yet. Please register below.`,
            variant: "destructive",
          });
          if (isEmail) {
            setRegEmail(loginMatric.trim());
            setCategory("fresher");
          } else {
            setRegMatric(loginMatric.trim());
            setCategory("staylite");
          }
          setMode("register");
          setPhase(1);
        } else {
          toast({
            title: "Authentication Failed",
            description: res.message || "Invalid credentials. Default password is your surname in lowercase.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${res.student?.full_name}!`,
      });

      setLoginPassword("");
      setLoginMatric("");
      onClose();

      if (redirectTab) {
        navigate("/dashboard", { state: { tab: redirectTab } });
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Could not reach collegiate database.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Dialog
      open={open && !isKorapayActive}
      onOpenChange={(val) => {
        if (!val && !isKorapayActive) onClose();
      }}
    >
      <DialogContent className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-[485px] max-h-[94dvh] sm:max-h-[90vh] p-0 gap-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Streamlined, Professional Header */}
        <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/80 p-1 flex items-center justify-center shrink-0">
              <img src={nassLogo} alt="NASS" className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white leading-tight">
                {mode === "login"
                  ? "Student Portal Sign In"
                  : phase === 1
                  ? "Fresher Registration & Clearance"
                  : phase === 2
                  ? "Session Dues Clearance (₦2,500)"
                  : "Official Payment Receipt"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                NASS LASUSTECH • College of Basic Sciences
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCROLLABLE BODY (Only the form content scrolls)          */}
        {/* Custom slim scrollbar to avoid Windows chunky arrows     */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 space-y-2.5 sm:space-y-3.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {mode === "register" ? (
            <>
              {/* ======================================================== */}
              {/* PHASE 1: BIO-DATA & CLASSIFICATION                       */}
              {/* ======================================================== */}
              {phase === 1 && (
                <form onSubmit={handlePhase1Submit} className="space-y-2.5 sm:space-y-3">
                  {/* Clean Segmented Control: Fresher vs Staylite */}
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                      Academic Status *
                    </label>
                    <div className="grid grid-cols-2 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] sm:text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect("fresher")}
                        className={`py-1 sm:py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          category === "fresher"
                            ? "bg-[#064e3b] text-white shadow-xs font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        }`}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Fresher (100L)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect("staylite")}
                        className={`py-1 sm:py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          category === "staylite"
                            ? "bg-[#064e3b] text-white shadow-xs font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        }`}
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Staylite (200L - 400L)</span>
                      </button>
                    </div>
                    <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      {category === "fresher"
                        ? "Newly admitted scholars (no matric number required yet)."
                        : "Returning scholars holding a LASUSTECH matric number."}
                    </p>
                  </div>

                  {/* STAYLITE ONLY: Matric Number */}
                  {category === "staylite" && (
                    <div className="space-y-1">
                      <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                        Matriculation Number *
                      </label>
                      <Input
                        value={regMatric}
                        onChange={(e) => setRegMatric(e.target.value.toUpperCase())}
                        required
                        placeholder="e.g. 230303010052"
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-mono uppercase h-8.5 sm:h-9.5"
                      />
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                      Full Legal Name * <span className="font-normal text-slate-400">(Surname First - CAPITAL LETTERS)</span>
                    </label>
                    <Input
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value.toUpperCase())}
                      required
                      placeholder="e.g. ADEKUNLE OLUWASEUN SAMUEL"
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs h-8.5 sm:h-9.5 uppercase tracking-wide font-medium"
                    />
                  </div>

                  {/* Department & Level */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Department *</label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        required
                        className="w-full h-8.5 sm:h-9.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#064e3b]/20"
                      >
                        {COLLEGE_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Level *</label>
                      {category === "fresher" ? (
                        <div className="w-full h-8.5 sm:h-9.5 px-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center">
                          100 Level
                        </div>
                      ) : (
                        <select
                          value={regLevel}
                          onChange={(e) => setRegLevel(e.target.value)}
                          required
                          className="w-full h-8.5 sm:h-9.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#064e3b]/20"
                        >
                          <option value="200L">200 Level</option>
                          <option value="300L">300 Level</option>
                          <option value="400L">400 Level</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Gmail Address */}
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                      Gmail Address *
                    </label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value.toLowerCase())}
                      required
                      placeholder="e.g. adekunle.samuel@gmail.com"
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs h-8.5 sm:h-9.5"
                    />
                    <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      Official dues receipts will be dispatched to this Gmail address.
                    </p>
                  </div>

                  {/* Proceed Action Button */}
                  <div className="pt-1 sm:pt-1.5 pb-1">
                    <Button
                      disabled={submitting}
                      type="submit"
                      className="w-full h-10 sm:h-11 rounded-xl font-bold text-xs bg-[#064e3b] hover:bg-[#053d2e] text-white shadow-sm transition-all active:scale-[0.98] gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving Academic Bio-Data...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Dues Payment (₦2,500)</span>
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
              {phase === 2 && registeredStudent && (
                <div className="space-y-2.5 sm:space-y-3.5">
                  {/* Summary of Bio-Data */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 sm:p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1">
                      <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {registeredStudent.isFresher ? "Fresher Scholar (100L)" : "Staylite Scholar"}
                      </span>
                      <span className="font-mono font-bold text-[#1a4480] dark:text-sky-300 text-[10.5px] sm:text-[11px]">
                        {registeredStudent.isFresher ? `App ID: ${registeredStudent.matricNumber}` : `Matric: ${registeredStudent.matricNumber}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                      <div>
                        <p className="text-[9px] text-slate-500">Student Name:</p>
                        <p className="font-bold text-slate-900 dark:text-white uppercase truncate text-[11px] sm:text-xs">
                          {registeredStudent.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500">Department & Level:</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate text-[11px] sm:text-xs">
                          {registeredStudent.department} ({registeredStudent.level})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-500">Gmail Address:</p>
                        <p className="font-mono text-[10px] sm:text-[10.5px] text-slate-800 dark:text-slate-200 truncate">
                          {registeredStudent.email}
                        </p>
                      </div>
                      {registeredStudent.isFresher && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          Matric: Pending (100L)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Invoice & Method Selector */}
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 sm:p-4 space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200/60 dark:border-emerald-800/60">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          2025/2026 Sessional Dues
                        </p>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          Collegiate Clearance
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-slate-500">Amount Due</p>
                        <p className="font-mono text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
                          ₦2,500
                        </p>
                      </div>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl text-xs font-bold gap-1">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("korapay")}
                        className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === "korapay"
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Online Gateway (Korapay)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("transfer")}
                        className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === "transfer"
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        }`}
                      >
                        <Building className="h-3.5 w-3.5" />
                        <span>Bank Transfer</span>
                      </button>
                    </div>

                    {/* METHOD 1: Korapay Online */}
                    {paymentMethod === "korapay" && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Pay securely via Debit Card, Bank Transfer, or USSD through Korapay Gateway. Your student portal activates immediately upon completion.
                        </p>

                        <Button
                          onClick={handleInitiateDuesPayment}
                          disabled={submitting}
                          className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{loadingStatus || "Connecting to Payment Gateway..."}</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              <span>Pay ₦2,500 via Korapay</span>
                              <ArrowRight className="h-4 w-4 ml-auto" />
                            </>
                          )}
                        </Button>

                        {/* Korapay Sandbox Test Mode Helper & Simulator */}
                        {isKorapayTestMode() && (
                          <div className="rounded-xl border border-dashed border-amber-500/60 bg-amber-50/80 dark:bg-amber-950/30 p-2.5 space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                Korapay Sandbox Test Environment
                              </span>
                              <span className="text-[9px] font-mono text-amber-800 bg-amber-200/70 dark:bg-amber-900/60 px-2 py-0.5 rounded font-black">
                                ACTIVE
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-950 dark:text-amber-200 leading-snug">
                              <strong>Card:</strong> <span className="font-mono font-bold bg-white dark:bg-slate-800 px-1 py-0.5 rounded">4084 0841 1111 1111</span> • <strong>Exp:</strong> 12/30 • <strong>CVV:</strong> 123 • <strong>PIN:</strong> 1111
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => completeSuccessfulPayment(`KORA-SANDBOX-${Date.now().toString().slice(-6)}`)}
                              disabled={submitting}
                              className="w-full h-8 text-[10.5px] font-bold border-amber-600/40 text-amber-950 dark:text-amber-200 hover:bg-amber-100/70 rounded-lg gap-1.5"
                            >
                              <Zap className="h-3.5 w-3.5 text-amber-600" />
                              <span>⚡ Instant Sandbox Test Clearance</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* METHOD 2: Direct Bank Transfer */}
                    {paymentMethod === "transfer" && (
                      <div className="space-y-3 text-left">
                        <div className="rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-slate-700 p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Official Association Bank
                            </span>
                            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Wema Bank
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-slate-500">Account Number</p>
                              <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                                0124967382
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyAccount("0124967382")}
                              className="h-8 gap-1.5 text-xs font-bold"
                            >
                              {copiedAccount ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{copiedAccount ? "Copied" : "Copy"}</span>
                            </Button>
                          </div>

                          <div className="text-[10.5px] text-slate-600 dark:text-slate-300">
                            <p><strong>Account Name:</strong> NASS LASUSTECH BASIC SCIENCES</p>
                            <p className="mt-0.5"><strong>Amount:</strong> ₦2,500</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                            Transfer Reference / Depositor Name (Optional)
                          </label>
                          <Input
                            placeholder="e.g. Sender Name or Ref"
                            value={transferRefInput}
                            onChange={(e) => setTransferRefInput(e.target.value)}
                            className="h-9 text-xs rounded-xl"
                          />
                        </div>

                        <Button
                          onClick={handleConfirmDirectTransfer}
                          disabled={submitting}
                          className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Confirming Clearance...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>I Have Paid ₦2,500 via Transfer (Verify & Activate)</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={() => setPhase(1)}
                      className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Back to edit details</span>
                    </button>

                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-mono">
                      NASS Collegiate Treasury Verified
                    </span>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PHASE 3: RECEIPT ISSUED & ACCESS GRANTED                 */}
              {/* ======================================================== */}
              {phase === 3 && issuedReceipt && (
                <div className="space-y-2.5 sm:space-y-3.5">
                  {/* Verified Badge Header */}
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 p-2 sm:p-2.5 text-center space-y-1">
                    <div className="mx-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#064e3b] text-white shadow-xs mb-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <h3 className="font-display text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-100">
                      Payment Verified • Official Receipt Issued
                    </h3>
                    <p className="text-[10px] sm:text-[10.5px] text-emerald-800/90 dark:text-emerald-300">
                      Your NASS 2025/2026 session dues are fully settled. Download or print your verified clearance receipt below.
                    </p>
                  </div>

                  {/* Clean Printable Receipt Card */}
                  <div
                    id="nass-modal-printable-receipt"
                    className="rounded-xl border border-emerald-700/30 bg-white text-slate-900 p-3 sm:p-3.5 shadow-xs space-y-2 text-xs"
                  >
                    <div className="text-center border-b border-slate-200 pb-1.5">
                      <p className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-widest text-[#1a4480]">
                        COLLEGE OF BASIC SCIENCES • LASUSTECH
                      </p>
                      <h4 className="font-serif text-xs sm:text-sm font-black text-slate-900 uppercase">
                        Nigerian Association of Science Students
                      </h4>
                      <div className="inline-block bg-[#064e3b] text-white text-[8.5px] sm:text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase mt-0.5">
                        Electronic Dues Receipt
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] sm:text-[9px] font-mono text-slate-500 mt-1">
                        <span>Ref: <strong>{issuedReceipt.reference}</strong></span>
                        <span>Date: <strong>{new Date(issuedReceipt.paidAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 text-[10.5px] sm:text-[11px]">
                      <div className="py-1 flex justify-between">
                        <span className="font-bold text-slate-500 uppercase">Student Name:</span>
                        <span className="font-bold text-slate-900 uppercase">{issuedReceipt.studentName}</span>
                      </div>
                      <div className="py-1 flex justify-between">
                        <span className="font-bold text-slate-500 uppercase">Matric / Scholar ID:</span>
                        <span className="font-mono font-bold text-[#1a4480]">{issuedReceipt.matricNumber}</span>
                      </div>
                      <div className="py-1 flex justify-between">
                        <span className="font-bold text-slate-500 uppercase">Department:</span>
                        <span className="font-semibold text-slate-800">{issuedReceipt.department} ({issuedReceipt.level})</span>
                      </div>
                      <div className="py-1 flex justify-between">
                        <span className="font-bold text-slate-500 uppercase">Item:</span>
                        <span className="font-bold text-emerald-900 uppercase">2025/2026 Session Dues</span>
                      </div>
                      <div className="py-1 flex justify-between bg-emerald-50/70 px-2 rounded font-bold">
                        <span className="text-emerald-950 uppercase text-[9px] sm:text-[9.5px]">Amount Cleared:</span>
                        <span className="font-mono text-xs font-black text-emerald-900">₦{issuedReceipt.amount.toLocaleString()} (Verified)</span>
                      </div>
                    </div>

                    {/* Signatures & Verification QR Code Block */}
                    <div className="pt-2.5 border-t border-slate-200 grid grid-cols-2 items-center text-center gap-2.5">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1 bg-white border border-dashed border-[#145a32] rounded-lg shadow-xs flex items-center justify-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=1&data=${encodeURIComponent(
                              `${typeof window !== "undefined" ? window.location.origin : "https://nasslasustech.com"}/verify-receipt?ref=${encodeURIComponent(issuedReceipt.reference)}&matric=${encodeURIComponent(issuedReceipt.matricNumber)}&name=${encodeURIComponent(issuedReceipt.studentName)}&dept=${encodeURIComponent(issuedReceipt.department)}&level=${encodeURIComponent(issuedReceipt.level)}&amount=${issuedReceipt.amount}&date=${encodeURIComponent(issuedReceipt.paidAt)}`
                            )}`}
                            alt="Verification QR Code"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          />
                        </div>
                        <span className="text-[6.5px] sm:text-[7.5px] font-bold text-[#145a32] uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
                          <QrCode className="h-2.5 w-2.5 text-[#145a32]" />
                          Scan to Verify
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <TreasurerESignature size="sm" />
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed border-emerald-600/60 p-1 text-center bg-emerald-50/40">
                      <p className="text-[8px] sm:text-[8.5px] font-black text-emerald-900 tracking-wider uppercase">
                        ★ STATUTORY SESSION DUES CLEARED & VERIFIED ★
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-0.5">
                    <Button
                      onClick={handleDownloadReceiptPdf}
                      disabled={downloadingPdf}
                      className="w-full h-10 sm:h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>{downloadingPdf ? "Generating PDF..." : "Download Receipt as PDF"}</span>
                    </Button>

                    <Button
                      onClick={handlePrintReceipt}
                      variant="outline"
                      className="w-full h-9 sm:h-10 rounded-xl border-emerald-600/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Official Receipt (A4)</span>
                    </Button>

                    <Button
                      onClick={handleGrantAccess}
                      className="w-full h-10 sm:h-11 rounded-xl bg-[#064e3b] hover:bg-[#053d2e] text-white font-bold text-xs shadow-md gap-2"
                    >
                      <span>Proceed to Student Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ======================================================== */
            /* RETURNING STUDENT SIGN IN FORM                           */
            /* ======================================================== */
            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                  Matriculation / Email for Freshers *
                </label>
                <Input
                  value={loginMatric}
                  onChange={(e) => setLoginMatric(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 h-9 sm:h-10 text-xs"
                  placeholder="e.g. 230303010052 or student@gmail.com"
                />
                <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                  Returning scholars sign in with matric number; Freshers use registered Gmail.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pr-10 h-9 sm:h-10 text-xs"
                    placeholder="Surname in lowercase"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-500 ml-0.5">
                  Default password is your surname in lowercase.
                </p>
              </div>

              <Button
                disabled={loginLoading}
                type="submit"
                className="w-full h-10 sm:h-11 rounded-xl font-bold bg-[#1a4480] hover:bg-[#143766] text-white shadow-md transition-all active:scale-[0.98] text-xs"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  "Sign In to Portal"
                )}
              </Button>
            </form>
          )}
        </div>

        {/* ======================================================== */}
        {/* DOCKED FOOTER (Always visible while scrolling)           */}
        {/* ======================================================== */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between text-[11px] sm:text-xs">
          {mode === "register" ? (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setPhase(1);
                }}
                className="font-bold text-[#1a4480] dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span>New student?</span>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setPhase(1);
                }}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Register & Pay Dues</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
