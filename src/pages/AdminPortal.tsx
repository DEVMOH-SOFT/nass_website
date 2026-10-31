import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminFetch, clearAdminSession, loginToAdminSystems, votingAdminFetch } from "@/lib/admin-api";
import { BarChart3, Calendar, FileText, Flag, Image, LogOut, Settings, ShieldCheck, Trophy, Users, Search, ChevronDown, ChevronUp, Plus, Trash2, Edit2, ImagePlus, Award, Check, X, SlidersHorizontal, ArrowUpDown, Clock, CreditCard, Receipt, Menu, BookOpen, Download, Printer, UploadCloud, CheckCircle2, FileSpreadsheet, FolderUp, Mail, Send, Sparkles, Key, Lock, AlertCircle, RefreshCw, ShoppingBag, Tag, Package, ExternalLink, Paperclip, Eye, EyeOff, User, ArrowRight, ArrowLeft, Building, Database, MailCheck, KeyRound } from "lucide-react";
import { sendCollegiateEmail, getDispatchedEmails, DispatchedMailLog, getMailerConfigApi, saveMailerConfigApi, sendTestEmailApi, MailerConfigStatus, EmailAttachment } from "@/lib/mailer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getStoreProducts, addStoreProduct, updateStoreProduct, deleteStoreProduct, resetStoreProducts, StoreProduct } from "@/lib/store-service";
import { resolveStudentDuesPaidAmount, parseStudentStoreOrders } from "@/lib/student-auth";

type TabKey = "overview" | "students" | "payments" | "store" | "pastQuestions" | "mailer" | "academics" | "executives" | "events" | "voting";

const emptyQuestion = {
  id: "",
  code: "",
  title: "",
  level: "100L",
  category: "Past Questions",
  department: "Computer Science",
  semester: "First Semester",
  fileSize: "2.4 MB",
  downloads: 0,
  description: "",
  fileUrl: "",
  fileName: "",
};

const emptyExecutive = { id: "", name: "", post: "", level: "", description: "", image_url: "", sort_order: 0, is_active: true };
const emptyEvent = { id: "", slug: "", title: "", event_status: "upcoming", start_date: "", end_date: "", location: "", description: "", cover_image_url: "", registration_url: "", flyer_folder: "", sort_order: 0, is_active: true };
const emptyBlog = { id: "", slug: "", title: "", excerpt: "", content: "", author: "", category: "", image_url: "", published_at: "", is_published: true };
const emptySection = { id: "", section_key: "", section_name: "", description: "", flyer_image_url: "", folder_name: "", sort_order: 0, is_active: true };
const emptyCategory = { id: "", slug: "", name: "", description: "", group_key: "", group_name: "", group_sort: 0, accent_color: "#0f9d58", hero_image: "", vote_price: 100, sort_order: 0, is_active: true };
const emptyNominee = { id: "", category_id: "", category_ids: [] as string[], slug: "", full_name: "", department: "Computer Science", level_label: "", bio: "", photo_url: "", is_active: true };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatCurrency = (amount: number) => `₦${Number(amount || 0).toLocaleString()}`;

const AdminPortal = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [votingDashboard, setVotingDashboard] = useState<any>(null);
  const [nominees, setNominees] = useState<any[]>([]);
  const [flagForm, setFlagForm] = useState({ matric_number: "", student_name: "", reason: "", message: "" });
  const [academicForm, setAcademicForm] = useState({ session: "", semester: "First Semester" });
  const [executiveForm, setExecutiveForm] = useState<any>(emptyExecutive);
  const [eventForm, setEventForm] = useState<any>(emptyEvent);
  const [galleryForm, setGalleryForm] = useState({ eventId: "", image_url: "", caption: "" });
  const [blogForm, setBlogForm] = useState<any>(emptyBlog);
  const [votingSettingsForm, setVotingSettingsForm] = useState<any>({});
  const [sectionForm, setSectionForm] = useState<any>(emptySection);
  const [categoryForm, setCategoryForm] = useState<any>(emptyCategory);
  const [nomineeForm, setNomineeForm] = useState<any>(emptyNominee);
  const [mainOnline, setMainOnline] = useState(false);
  const [votingOnline, setVotingOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [votingSearchQuery, setVotingSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [votingTransactions, setVotingTransactions] = useState<any[]>([]);
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [txStatusFilter, setTxStatusFilter] = useState("all");
  const [txExpanded, setTxExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Communications & Laravel Mailer State
  const [mailAudience, setMailAudience] = useState<"all" | "freshers" | "staylites" | "department">("all");
  const [mailSelectedDept, setMailSelectedDept] = useState("Computer Science");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [mailLogs, setMailLogs] = useState<DispatchedMailLog[]>(() => getDispatchedEmails());
  const [mailerConfig, setMailerConfig] = useState<MailerConfigStatus>({
    configured: false,
    host: "smtp.gmail.com",
    port: 587,
    user: "",
    rawUser: "",
    fromName: "Nigerian Association of Science Students (NASS LASUSTECH)",
    fromEmail: "",
  });
  const [smtpFormOpen, setSmtpFormOpen] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    user: "",
    pass: "",
    host: "smtp.gmail.com",
    port: 465,
    fromName: "Nigerian Association of Science Students (NASS LASUSTECH)",
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [mailAttachments, setMailAttachments] = useState<EmailAttachment[]>([]);

  // Store & Inventory Management State
  const [adminStoreProducts, setAdminStoreProducts] = useState<StoreProduct[]>(() => getStoreProducts());
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    category: "general" as "labcoat" | "manual" | "jersey" | "gear" | "general",
    price: 5000,
    priceConfirmed: true,
    badge: "Official CBS Merchandise",
    image: "",
    description: "",
    features: "Official CBS Approved\nHigh Quality Material\nAvailable for Instant Collection",
    inStock: true,
  });
  const [quickPriceItem, setQuickPriceItem] = useState<{ id: string; title: string; price: number } | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [storeCategoryFilter, setStoreCategoryFilter] = useState("all");

  const refreshStoreProducts = () => {
    setAdminStoreProducts(getStoreProducts());
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: "",
      category: "general",
      price: 5000,
      priceConfirmed: true,
      badge: "Official CBS Merchandise",
      image: "",
      description: "",
      features: "Official CBS Approved\nHigh Quality Material\nAvailable for Instant Collection",
      inStock: true,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: StoreProduct) => {
    setEditingProductId(prod.id);
    setProductForm({
      title: prod.title,
      category: prod.category,
      price: prod.price,
      priceConfirmed: prod.priceConfirmed,
      badge: prod.badge || "",
      image: prod.image || "",
      description: prod.description || "",
      features: (prod.features || []).join("\n"),
      inStock: prod.inStock !== false,
    });
    setProductModalOpen(true);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProductForm(prev => ({ ...prev, image: reader.result as string }));
        toast({ title: "Image Loaded", description: "Image preview attached to product." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      toast({ title: "Title Required", description: "Please enter product title.", variant: "destructive" });
      return;
    }

    const featureList = productForm.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingProductId) {
      updateStoreProduct(editingProductId, {
        title: productForm.title.trim(),
        category: productForm.category,
        price: Number(productForm.price) || 0,
        priceConfirmed: productForm.priceConfirmed,
        badge: productForm.badge.trim(),
        image: productForm.image.trim(),
        description: productForm.description.trim(),
        features: featureList,
        inStock: productForm.inStock,
      });
      toast({ title: "Product Updated", description: `"${productForm.title}" has been updated in the store.` });
    } else {
      addStoreProduct({
        title: productForm.title.trim(),
        category: productForm.category,
        price: Number(productForm.price) || 0,
        priceConfirmed: productForm.priceConfirmed,
        badge: productForm.badge.trim(),
        image: productForm.image.trim(),
        description: productForm.description.trim(),
        features: featureList,
        inStock: productForm.inStock,
      });
      toast({ title: "Product Added", description: `"${productForm.title}" has been added to the store.` });
    }

    refreshStoreProducts();
    setProductModalOpen(false);
  };

  const handleTogglePriceConfirmed = (prod: StoreProduct) => {
    const nextState = !prod.priceConfirmed;
    updateStoreProduct(prod.id, { priceConfirmed: nextState });
    refreshStoreProducts();
    toast({
      title: nextState ? "Price Enacted & Checkout Enabled" : "Price Marked as Pending",
      description: `"${prod.title}" is now ${nextState ? "available for student checkout" : "marked as Check Back Later"}.`,
    });
  };

  const handleQuickPriceSave = () => {
    if (!quickPriceItem) return;
    const newPrice = Number(quickPriceVal);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({ title: "Invalid Price", description: "Please enter a valid price in Naira.", variant: "destructive" });
      return;
    }
    updateStoreProduct(quickPriceItem.id, { price: newPrice, priceConfirmed: newPrice > 0 });
    refreshStoreProducts();
    toast({ title: "Price Updated", description: `Price for "${quickPriceItem.title}" updated to ₦${newPrice.toLocaleString()}` });
    setQuickPriceItem(null);
  };

  const handleDeleteProduct = (prod: StoreProduct) => {
    if (window.confirm(`Are you sure you want to remove "${prod.title}" from the store?`)) {
      deleteStoreProduct(prod.id);
      refreshStoreProducts();
      toast({ title: "Product Removed", description: `"${prod.title}" was deleted from inventory.` });
    }
  };

  const handleResetStoreDefaults = () => {
    if (window.confirm("Reset store inventory to default Lab Coat, Jersey, and Manuals?")) {
      resetStoreProducts();
      refreshStoreProducts();
      toast({ title: "Inventory Reset", description: "Default products restored." });
    }
  };

  const getFilteredRecipients = () => {
    const allEmails = new Set<string>();
    const recipientList: { email: string; name: string; matric: string; level: string; department: string }[] = [];

    // 1. From database students list
    (students || []).forEach((s: any) => {
      const email = s.email?.trim();
      if (email && email.includes("@")) {
        const isFresher = s.level === "100L" || s.matric_number?.startsWith("FSH");
        if (mailAudience === "freshers" && !isFresher) return;
        if (mailAudience === "staylites" && isFresher) return;
        if (mailAudience === "department" && s.department !== mailSelectedDept) return;

        if (!allEmails.has(email.toLowerCase())) {
          allEmails.add(email.toLowerCase());
          recipientList.push({
            email,
            name: s.full_name || s.name || "Student Scholar",
            matric: s.matric_number || "",
            level: s.level || "",
            department: s.department || "",
          });
        }
      }
    });

    // 2. From verified payments ledger
    try {
      const verified = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      verified.forEach((p: any) => {
        const email = p.email || (p.matric_number && !p.matric_number.startsWith("FSH") ? `${p.matric_number}@lasustech.edu.ng` : null);
        if (email && email.includes("@") && !allEmails.has(email.toLowerCase())) {
          const isFresher = p.level === "100L" || p.matric_number?.startsWith("FSH");
          if (mailAudience === "freshers" && !isFresher) return;
          if (mailAudience === "staylites" && isFresher) return;
          if (mailAudience === "department" && p.department !== mailSelectedDept) return;

          allEmails.add(email.toLowerCase());
          recipientList.push({
            email,
            name: p.student_name || "Student Scholar",
            matric: p.matric_number || "",
            level: p.level || "",
            department: p.department || "",
          });
        }
      });
    } catch (e) {}

    return recipientList;
  };

  const handleApplyMailTemplate = (type: "freshers_matric" | "dues_clearance" | "congress") => {
    if (type === "freshers_matric") {
      setMailAudience("freshers");
      setMailSubject("Action Required: Update Your Official LASUSTECH Matriculation Number");
      setMailBody(`Dear Science Fresher,

The Academic Affairs Division is finalizing permanent matriculation number assignments for 100-Level undergraduates in the College of Basic Sciences.

If you have received your official LASUSTECH matriculation number:
1. Log into your NASS Science Portal (https://nass-lasustech.edu.ng)
2. In your Dashboard Overview, find the "Freshers Matriculation Number Update Desk"
3. Enter and save your official 12-digit matriculation number

This will permanently upgrade your record, dues receipt, and ID card clearance.

Best regards,
Secretariat, NASS LASUSTECH
DEVMOH Led Administration`);
    } else if (type === "dues_clearance") {
      setMailSubject("Notice: 2025/2026 Statutory Session Dues Clearance & Verified Receipts");
      setMailBody(`Dear Science Scholar,

This is an administrative notification from the College Secretariat regarding statutory session dues for the 2025/2026 academic session.

Please ensure your ₦2,500 session dues are paid and your official electronic receipt is downloaded. Cleared dues are required for laboratory practical manual issuance, customized lab coats, and collegiate clearances.

Office of the Executive Treasurer,
DEVMOH Led Administration, NASS LASUSTECH`);
    } else if (type === "congress") {
      setMailSubject("Notice of College of Basic Sciences Congress & Science Week");
      setMailBody(`Dear Science Scholars,

The Executive Council hereby invites all members of the College of Basic Sciences to the forthcoming Collegiate Congress and Science Week.

Highlights include paper presentations, inter-departmental innovation competitions, and Deanery leadership sessions.

Secretariat, NASS LASUSTECH`);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxPerFile = 15 * 1024 * 1024; // 15MB max individual file
    const maxTotal = 22 * 1024 * 1024; // 22MB total

    let currentTotal = mailAttachments.reduce((sum, a) => sum + (a.size || 0), 0);

    Array.from(files).forEach((file) => {
      if (file.size > maxPerFile) {
        toast({
          title: "File Exceeds Limit",
          description: `"${file.name}" is too large (max 15MB per file).`,
          variant: "destructive",
        });
        return;
      }

      if (currentTotal + file.size > maxTotal) {
        toast({
          title: "Attachment Limit Reached",
          description: "Total attachments cannot exceed 22MB for email reliability.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Content = event.target?.result as string;
        if (base64Content) {
          setMailAttachments((prev) => [
            ...prev,
            {
              filename: file.name,
              content: base64Content,
              contentType: file.type || "application/octet-stream",
              size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
      currentTotal += file.size;
    });

    e.target.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setMailAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendBroadcastMail = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = getFilteredRecipients();
    const emails = recipients.map(r => r.email);

    if (emails.length === 0) {
      toast({
        title: "No Recipients Found",
        description: "No registered student emails match your current audience filter.",
        variant: "destructive",
      });
      return;
    }

    if (!mailSubject.trim() || !mailBody.trim()) {
      toast({
        title: "Subject & Body Required",
        description: "Please enter both an email subject and message body.",
        variant: "destructive",
      });
      return;
    }

    setSendingMail(true);
    try {
      await sendCollegiateEmail({
        to: emails,
        subject: mailSubject.trim(),
        body: mailBody.trim(),
        attachments: mailAttachments.length > 0 ? mailAttachments : undefined,
        meta: {
          targetGroup: mailAudience === "freshers" ? "Freshers Only (100L)" : mailAudience === "staylites" ? "Staylites (200L-400L)" : mailAudience === "department" ? `Dept: ${mailSelectedDept}` : "All Registered Students",
          hasAttachments: mailAttachments.length > 0,
          attachmentCount: mailAttachments.length,
        },
      });

      setMailLogs(getDispatchedEmails());
      toast({
        title: "Broadcast Dispatched!",
        description: `Successfully dispatched to ${emails.length} recipient(s)${
          mailAttachments.length > 0 ? ` with ${mailAttachments.length} attachment(s)` : ""
        } via Collegiate Mailer.`,
      });

      setMailSubject("");
      setMailBody("");
      setMailAttachments([]);
    } catch (err: any) {
      toast({
        title: "Dispatch Notice",
        description: err?.message || "Failed to dispatch email broadcast. Please verify your SMTP settings.",
        variant: "destructive",
      });
    } finally {
      setSendingMail(false);
    }
  };

  const handleSaveSmtpSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpForm.user || !smtpForm.user.includes("@")) {
      toast({ title: "Valid Sender Email Required", description: "Please enter your official sender Gmail address.", variant: "destructive" });
      return;
    }
    setSavingSmtp(true);
    try {
      const res = await saveMailerConfigApi(smtpForm);
      if (res.success) {
        toast({ title: "SMTP Settings Updated", description: "Gmail credentials persisted successfully for real inbox delivery." });
        const refreshed = await getMailerConfigApi();
        setMailerConfig(refreshed);
        setSmtpFormOpen(false);
      } else {
        toast({ title: "Save Failed", description: res.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Failed to Save", description: err.message, variant: "destructive" });
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      toast({ title: "Valid Test Email Required", description: "Please enter the test recipient Gmail address.", variant: "destructive" });
      return;
    }
    setTestingEmail(true);
    try {
      const res = await sendTestEmailApi(testEmailAddress.trim());
      toast({
        title: "🎉 Test Email Delivered!",
        description: res.message || `Dispatched to ${testEmailAddress}. Please check your inbox or spam folder.`,
      });
    } catch (err: any) {
      toast({
        title: "Test Delivery Error",
        description: err.message || "Failed to deliver test email. Check your Gmail App Password.",
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  // Past Questions State
  const [pastQuestions, setPastQuestions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("nass_academic_resources");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: "mth101",
        code: "MTH 101",
        title: "Elementary Mathematics I (Algebra & Trigonometry)",
        level: "100L",
        category: "Past Questions",
        department: "Mathematical Sciences",
        semester: "First Semester",
        fileSize: "2.8 MB",
        downloads: 1420,
        description: "Official 5-year past examination questions with step-by-step verified solutions and formula summary.",
      },
      {
        id: "phy101",
        code: "PHY 101",
        title: "General Physics I (Mechanics, Thermal & Waves)",
        level: "100L",
        category: "Past Questions",
        department: "Physics with Electronics",
        semester: "First Semester",
        fileSize: "3.4 MB",
        downloads: 1285,
        description: "Compiled departmental exam questions, derivation summaries, and worked numerical problems.",
      },
      {
        id: "chm101",
        code: "CHM 101",
        title: "General Chemistry I (Physical & Inorganic)",
        level: "100L",
        category: "Past Questions",
        department: "Chemical Sciences",
        semester: "First Semester",
        fileSize: "2.2 MB",
        downloads: 1190,
        description: "Comprehensive exam past questions covering atomic structure, bonding, chemical equilibrium, and thermodynamics.",
      },
      {
        id: "csc101",
        code: "CSC 101",
        title: "Introduction to Computer Science & Problem Solving",
        level: "100L",
        category: "Past Questions",
        department: "Computer Science",
        semester: "First Semester",
        fileSize: "1.9 MB",
        downloads: 1650,
        description: "Past questions, flowchart and algorithm exercises, and computer architecture fundamentals.",
      },
      {
        id: "bio101",
        code: "BIO 101",
        title: "General Biology I (Cell Biology & Genetics)",
        level: "100L",
        category: "Past Questions",
        department: "Biological Sciences",
        semester: "First Semester",
        fileSize: "3.1 MB",
        downloads: 980,
        description: "Past questions, labeled biological diagrams, and genetics problem sets for Basic Science scholars.",
      },
      {
        id: "csc201",
        code: "CSC 201",
        title: "Computer Programming I (Structured & OOP Foundations)",
        level: "200L",
        category: "Past Questions",
        department: "Computer Science",
        semester: "First Semester",
        fileSize: "2.6 MB",
        downloads: 870,
        description: "200-level exam past papers, code walkthroughs, and OOP concept worksheets in Python/C++.",
      },
    ];
  });
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState("all");
  const [questionLevelFilter, setQuestionLevelFilter] = useState("all");

  // Payment History State
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentDeptFilter, setPaymentDeptFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");

  const handleUploadPastQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.code || !questionForm.title || !questionForm.department) {
      toast({ title: "Missing Fields", description: "Course code, title, and department are required.", variant: "destructive" });
      return;
    }

    const newQuestion = {
      id: questionForm.code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now(),
      code: questionForm.code.trim().toUpperCase(),
      title: questionForm.title.trim(),
      level: questionForm.level,
      category: questionForm.category,
      department: questionForm.department,
      semester: questionForm.semester,
      fileSize: questionForm.fileSize || "2.4 MB",
      downloads: 0,
      description: questionForm.description.trim() || `Official past examination questions and solutions for ${questionForm.code.trim().toUpperCase()}.`,
      fileUrl: questionForm.fileUrl || "",
      fileName: questionForm.fileName || `${questionForm.code.trim().toUpperCase()}_Past_Questions.pdf`,
      uploadedAt: new Date().toISOString(),
    };

    const updated = [newQuestion, ...pastQuestions];
    setPastQuestions(updated);
    try {
      localStorage.setItem("nass_academic_resources", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Storage error", err);
    }

    setQuestionForm(emptyQuestion);
    toast({
      title: "Past Question Uploaded",
      description: `${newQuestion.code} - ${newQuestion.title} has been published to student resources!`,
    });
  };

  const handleDeletePastQuestion = (id: string) => {
    const updated = pastQuestions.filter(q => q.id !== id);
    setPastQuestions(updated);
    try {
      localStorage.setItem("nass_academic_resources", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {}
    toast({ title: "Material Removed", description: "Past question has been deleted from repository." });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const reader = new FileReader();
      reader.onload = (event) => {
        setQuestionForm(prev => ({
          ...prev,
          fileName: file.name,
          fileSize: sizeMB,
          fileUrl: event.target?.result as string || "",
        }));
      };
      reader.readAsDataURL(file);
      toast({ title: "Document Attached", description: `${file.name} (${sizeMB}) ready for upload.` });
    }
  };

  const getAllStudentPayments = () => {
    const list: any[] = [];

    // 1. Live verified payments from actual transactions in localStorage (only confirmed Paid records; purge abandoned Initiated junk)
    try {
      const verified = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      if (Array.isArray(verified)) {
        const onlyPaid = verified.filter((p) => String(p?.status || "").toLowerCase() === "paid");
        if (onlyPaid.length !== verified.length) {
          localStorage.setItem("nass_verified_payments", JSON.stringify(onlyPaid));
        }
        list.push(...onlyPaid);
      }
    } catch (e) {}

    // 2. Real student roster dues status AND confirmed CBS Lab Coat / Store orders from Supabase
    (students || []).forEach((st, idx) => {
      const isPaid = String(st.dues_status || st.status || "").toLowerCase() === "paid";
      const matric = st.matric_number || st.matric_no || st.matric;
      if (!matric) return;

      // 2a. Include any confirmed CBS Lab Coat / Store orders stored on the student's Supabase record
      const storeOrders = parseStudentStoreOrders(st);
      for (const order of storeOrders) {
        if (!list.some((p) => p.reference === order.reference)) {
          list.push(order);
        }
      }
      
      // 2b. Avoid duplicating sessional dues if already present in verified payments
      const alreadyListed = list.some(
        (p) => p.matric_number === matric && String(p.payment_type || "").toLowerCase().includes("due")
      );
      if (alreadyListed) return;

      const name = st.full_name || st.name || "Student";
      const dept = st.department || "Basic Sciences";
      const lvl = st.level || "100L";
      const date = st.dues_paid_at || st.created_at || new Date().toISOString();
      const actualDuesAmount = resolveStudentDuesPaidAmount(matric, st.email, st);

      list.push({
        id: `pay-dues-${matric}`,
        reference: `NASS-DUES-${matric.slice(-4)}-2026`,
        student_name: name,
        matric_number: matric,
        department: dept,
        level: lvl,
        payment_type: "2025/2026 Sessional Dues",
        amount: isPaid ? actualDuesAmount : 2500,
        channel: "Korapay Online",
        status: isPaid ? "Paid" : "Pending",
        created_at: date,
      });
    });

    // 3. Real voting transactions from voting backend
    (votingTransactions || []).forEach((vt, i) => {
      list.push({
        id: `pay-vote-${vt.id || i}`,
        reference: vt.reference || `NASS-VOTE-${i}`,
        student_name: vt.voter_name || "Science Scholar",
        matric_number: vt.voter_email ? vt.voter_email.split('@')[0].toUpperCase() : "VOTER-SEC",
        department: vt.category_name || "Awards Voting",
        level: "N/A",
        payment_type: `Awards Vote: ${vt.nominee_name || 'Nominee'}`,
        amount: Number(vt.amount || 100),
        channel: "Korapay Webhook",
        status: String(vt.status || "").toLowerCase() === "success" ? "Paid" : (vt.status || "Paid"),
        created_at: vt.created_at || new Date().toISOString(),
      });
    });

    return list;
  };

  const filteredStudentPayments = getAllStudentPayments().filter((pay) => {
    if (paymentStatusFilter !== "all" && pay.status.toLowerCase() !== paymentStatusFilter.toLowerCase()) {
      return false;
    }
    if (paymentDeptFilter !== "all" && pay.department !== paymentDeptFilter) {
      return false;
    }
    if (paymentTypeFilter !== "all") {
      const type = (pay.payment_type || "").toLowerCase();
      if (paymentTypeFilter === "dues" && !type.includes("due")) return false;
      if (paymentTypeFilter === "labcoat" && !type.includes("lab coat") && !type.includes("labcoat")) return false;
      if (paymentTypeFilter === "books" && !type.includes("manual") && !type.includes("book")) return false;
      if (paymentTypeFilter === "award" && !type.includes("vote") && !type.includes("award")) return false;
    }
    if (paymentSearch.trim()) {
      const q = paymentSearch.toLowerCase();
      return (
        pay.student_name.toLowerCase().includes(q) ||
        pay.matric_number.toLowerCase().includes(q) ||
        pay.reference.toLowerCase().includes(q) ||
        pay.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadPaymentsCSV = () => {
    const records = filteredStudentPayments;
    if (records.length === 0) {
      toast({ title: "No records to export", description: "No payment records match your current filter.", variant: "destructive" });
      return;
    }

    const headers = [
      "Transaction Reference",
      "Date",
      "Student Name",
      "Matriculation Number",
      "Department",
      "Academic Level",
      "Payment Category",
      "Amount (NGN)",
      "Payment Channel",
      "Payment Status"
    ];

    const rows = records.map(r => [
      `"${String(r.reference).replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleDateString()} ${new Date(r.created_at).toLocaleTimeString()}"`,
      `"${String(r.student_name).replace(/"/g, '""')}"`,
      `"${String(r.matric_number).replace(/"/g, '""')}"`,
      `"${String(r.department).replace(/"/g, '""')}"`,
      `"${String(r.level).replace(/"/g, '""')}"`,
      `"${String(r.payment_type).replace(/"/g, '""')}"`,
      r.amount,
      `"${String(r.channel).replace(/"/g, '""')}"`,
      `"${String(r.status).replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `NASS_LASUSTECH_Student_Payments_${timestamp}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Delay revoke so Chrome has ample time to stream the file with its designated filename
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 45000);

    toast({
      title: "Export Successful",
      description: `Downloaded ${records.length} student payment records as ${filename}.`,
    });
  };


  const filteredTransactions = (votingTransactions || []).filter((tx) => {
    if (txStatusFilter !== "all" && String(tx.status).toLowerCase() !== txStatusFilter) {
      return false;
    }
    if (txSearchQuery.trim()) {
      const q = txSearchQuery.toLowerCase();
      const ref = String(tx.reference || "").toLowerCase();
      const voterName = String(tx.voter_name || "").toLowerCase();
      const voterEmail = String(tx.voter_email || "").toLowerCase();
      const nominee = String(tx.nominee_name || "").toLowerCase();
      const category = String(tx.category_name || "").toLowerCase();
      const providerRef = String(tx.provider_reference || "").toLowerCase();
      return (
        ref.includes(q) ||
        voterName.includes(q) ||
        voterEmail.includes(q) ||
        nominee.includes(q) ||
        category.includes(q) ||
        providerRef.includes(q)
      );
    }
    return true;
  });



  const getStructuredVotingMap = () => {
    const sectionsMap = new Map<string, any>();

    // 1. Pre-populate sections from the backend
    (votingDashboard?.sections || []).forEach((sec: any) => {
      sectionsMap.set(String(sec.section_key).toLowerCase(), {
        id: sec.id,
        section_key: sec.section_key,
        section_name: sec.section_name,
        description: sec.description,
        flyer_image_url: sec.flyer_image_url,
        folder_name: sec.folder_name,
        sort_order: sec.sort_order || 0,
        is_active: sec.is_active,
        categories: []
      });
    });

    // 2. Map categories into sections
    (votingDashboard?.categories || []).forEach((cat: any) => {
      const secKey = String(cat.group_key || cat.groupKey || "unassigned").toLowerCase();
      const secName = cat.group_name || cat.groupName || cat.group_key || cat.groupKey || "Other Awards";
      
      if (!sectionsMap.has(secKey)) {
        sectionsMap.set(secKey, {
          id: `dynamic-${secKey}`,
          section_key: secKey,
          section_name: secName,
          description: "Automatically grouped",
          sort_order: cat.group_sort || 100,
          is_active: 1,
          categories: []
        });
      }

      sectionsMap.get(secKey).categories.push(cat);
    });

    // 3. Convert to array and filter sections / categories / nominees by search query if any
    let result = Array.from(sectionsMap.values()).sort((a, b) => a.sort_order - b.sort_order);

    if (votingSearchQuery.trim()) {
      const q = votingSearchQuery.toLowerCase();
      result = result.map(sec => {
        // Filter categories inside this section
        const filteredCats = sec.categories.map((cat: any) => {
          const catNominees = (nominees || []).filter(
            (nom: any) => String(nom.category_id || nom.categoryId) === String(cat.id)
          );
          
          // Filter nominees that match query
          const filteredNoms = catNominees.filter((nom: any) => 
            String(nom.full_name).toLowerCase().includes(q) ||
            String(nom.department).toLowerCase().includes(q) ||
            String(nom.level_label).toLowerCase().includes(q)
          );

          const matchesCat = String(cat.name).toLowerCase().includes(q) ||
                             String(cat.description).toLowerCase().includes(q);

          // If nominee matches, or category matches, we return the category with filtered nominees
          if (matchesCat || filteredNoms.length > 0) {
            return {
              ...cat,
              _filteredNominees: matchesCat ? catNominees : filteredNoms,
              _highlight: matchesCat
            };
          }
          return null;
        }).filter(Boolean);

        const matchesSec = String(sec.section_name).toLowerCase().includes(q) ||
                           String(sec.section_key).toLowerCase().includes(q);

        if (matchesSec || filteredCats.length > 0) {
          return {
            ...sec,
            categories: matchesSec ? sec.categories.map((c: any) => ({
              ...c,
              _filteredNominees: (nominees || []).filter((n: any) => String(n.category_id || n.categoryId) === String(c.id))
            })) : filteredCats,
            _highlight: matchesSec
          };
        }
        return null;
      }).filter(Boolean);
    } else {
      // If no search, attach standard nominees list to each category
      result = result.map(sec => ({
        ...sec,
        categories: sec.categories.map((cat: any) => ({
          ...cat,
          _filteredNominees: (nominees || []).filter(
            (nom: any) => String(nom.category_id || nom.categoryId) === String(cat.id)
          )
        }))
      }));
    }

    return result;
  };

  const getCategoryLeader = (catNominees: any[]) => {
    if (!catNominees || catNominees.length === 0) return null;
    let leader = catNominees[0];
    catNominees.forEach((nom) => {
      if ((nom.votes || 0) > (leader.votes || 0)) {
        leader = nom;
      }
    });
    return (leader.votes || 0) > 0 ? leader : null;
  };


  const handleImageUpload = async (file: File, onUploadSuccess: (url: string) => void) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const uploadUrl = import.meta.env.DEV 
        ? ((import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "") + "/admin/upload")
        : (window.location.origin + "/upload.php");

      const token = localStorage.getItem("adminToken");
      const headers: Record<string, string> = {};
      if (import.meta.env.DEV && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers,
        body: formData
      });
      
      if (!res.ok) throw new Error("Upload failed.");
      
      const data = await res.json();
      if (data.status === "success" && data.path) {
        onUploadSuccess(data.path);
        toast({ title: "Image uploaded", description: "Successfully uploaded to server." });
      } else {
        throw new Error(data.message || "Failed to upload image.");
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const loadAll = async () => {
    let mainConnected = false;
    let votingConnected = false;

    // ── 1. Load live registered students from Supabase (Collegiate Source of Truth)
    let supaStudents: any[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          supaStudents = data;
        }
      } catch (e) {
        console.warn("Supabase students load notice:", e);
      }
    }

    // ── 2. Load from local Node.js backend (proxies to nacosid internally)
    let mainDashboard: any = null;
    try {
      mainDashboard = await adminFetch("/admin/dashboard");
      setAcademicForm(mainDashboard?.academicSettings || { session: "2025/2026", semester: "First Semester" });
      mainConnected = true;
      setMainOnline(true);
    } catch (err: any) {
      console.warn("Main backend offline:", err.message);
      setMainOnline(false);
    }

    // ── 3. Merge database students, backend students, and verified payments ledger
    const studentMap = new Map<string, any>();

    // First: Live Supabase students
    supaStudents.forEach((s) => {
      const key = (s.email || s.matric_number || "").toLowerCase().trim();
      if (key) studentMap.set(key, s);
    });

    // Only legitimate NASS LASUSTECH students are loaded (from Supabase & NASS Dues Ledger)
    // Legacy NACOS student lists are explicitly excluded.

    // Third: Local verified payments ledger
    try {
      const rawVerifiedList = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
      if (Array.isArray(rawVerifiedList)) {
        const verifiedList = rawVerifiedList.filter((p: any) => String(p?.status || "").toLowerCase() === "paid");
        if (verifiedList.length !== rawVerifiedList.length) {
          localStorage.setItem("nass_verified_payments", JSON.stringify(verifiedList));
        }
        verifiedList.forEach((p: any) => {
          const key = (p.email || p.matric_number || "").toLowerCase().trim();
          const pAmount = typeof p.amount === "number" ? (p.amount > 10000 ? p.amount / 100 : p.amount) : 2500;
          if (key && !studentMap.has(key)) {
            studentMap.set(key, {
              matric_number: p.matric_number,
              full_name: p.student_name,
              department: p.department,
              level: p.level,
              email: p.email,
              dues_status: p.status === "Paid" ? "Paid" : "Unpaid",
              dues_amount: pAmount,
              amount: pAmount,
              created_at: p.created_at,
            });
          } else if (key && studentMap.has(key)) {
            const existing = studentMap.get(key);
            if (!existing.dues_amount && p.amount) {
              existing.dues_amount = pAmount;
              existing.amount = pAmount;
            }
          }
        });
      }
    } catch (e) {}

    const mergedStudents = Array.from(studentMap.values());
    setStudents(mergedStudents);

    setDashboard((prev: any) => ({
      ...(mainDashboard || prev || {}),
      students: mergedStudents,
      stats: {
        ...(mainDashboard?.stats || prev?.stats || {}),
        totalStudents: mergedStudents.length,
      },
    }));

    // ── 4. Load voting backend dashboard
    try {
      const votingDash = await votingAdminFetch("/admin/dashboard");
      const nomineeRows = await votingAdminFetch("/admin/nominees").catch(() => []);
      const transactionRows = await votingAdminFetch("/admin/transactions").catch(() => []);
      setVotingDashboard(votingDash);
      setVotingSettingsForm(votingDash.settings || {});
      setNominees(nomineeRows || []);
      setVotingTransactions(transactionRows || []);
      votingConnected = true;
      setVotingOnline(true);
    } catch (err: any) {
      console.warn("Voting backend offline:", err.message);
      setVotingOnline(false);
    }

    if (!mainConnected && !votingConnected) {
      console.warn("Operating in Supabase collegiate repository & ledger mode.");
    }
  };

  useEffect(() => {
    // Load Mailer configuration status
    getMailerConfigApi()
      .then((cfg) => {
        setMailerConfig(cfg);
        if (cfg.rawUser) {
          setSmtpForm((prev) => ({
            ...prev,
            user: cfg.rawUser || "",
            fromName: cfg.fromName || prev.fromName,
          }));
        }
      })
      .catch(() => {});

    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser));
        loadAll()
          .catch((error) => {
            console.warn("Backend sync notice:", error.message);
          })
          .finally(() => setLoading(false));
        return;
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const refreshVoting = async () => {
    try {
      const [votingDash, nomineeRows, transactionRows] = await Promise.all([
        votingAdminFetch("/admin/dashboard"),
        votingAdminFetch("/admin/nominees"),
        votingAdminFetch("/admin/transactions").catch(() => []),
      ]);
      setVotingDashboard(votingDash);
      setVotingSettingsForm(votingDash.settings || {});
      setNominees(nomineeRows || []);
      setVotingTransactions(transactionRows || []);
      setVotingOnline(true);
    } catch (err: any) {
      toast({ title: "Voting server offline", description: err.message, variant: "destructive" });
      setVotingOnline(false);
    }
  };


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await loginToAdminSystems(credentials.username, credentials.password);
      setAdminUser(response.main?.user || response.voting?.user);
      
      await loadAll();

      if (response.mainError && response.votingError) {
        toast({ title: "Login failed", description: "Both backend systems are unreachable.", variant: "destructive" });
      } else if (response.mainError) {
        toast({ title: "Connected to Voting System", description: `Voting portal is online, but the Main Website backend is offline.`, variant: "default" });
      } else if (response.votingError) {
        toast({ title: "Connected to Main Website", description: `Main website is online, but the Voting backend is offline.`, variant: "default" });
      } else {
        toast({ title: "Admin access granted", description: "Both admin systems connected successfully." });
      }
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminUser(null);
    setDashboard(null);
    setVotingDashboard(null);
    setMainOnline(false);
    setVotingOnline(false);
    toast({ title: "Signed out", description: "Admin session cleared." });
  };

  const withSubmit = async (task: () => Promise<void>, successMessage: string) => {
    setSubmitting(true);
    try {
      await task();
      toast({ title: "Saved", description: successMessage });
    } catch (error: any) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#062018] flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Loading DEVMOH-Led Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#03130c] text-white flex flex-col justify-between relative overflow-hidden select-none">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Microdot Matrix Overlay */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        {/* Top Executive Header */}
        <header className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/40 p-2 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-emerald-400">
                  NASS LASUSTECH
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-300/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  SEC-HQ
                </span>
              </div>
              <p className="text-xs font-semibold text-white/90 tracking-tight">
                College of Basic Sciences Secretariat
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="group flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform text-emerald-400" />
            <span>Back to Public Website</span>
          </Link>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex items-center">
          <div className="grid gap-10 lg:grid-cols-12 items-center w-full">
            {/* Left Column (7 cols): Institutional Authority & Trust */}
            <div className="lg:col-span-7 space-y-6 lg:pr-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="tracking-wide uppercase">DEVMOH-Led Executive Administration</span>
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                  Secretariat Command &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                    Control Centre
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-emerald-100/75 leading-relaxed max-w-xl font-normal">
                  Authorized administrative gateway for the College of Basic Sciences, LASUSTECH. Real-time governance of scholar registrations, statutory dues clearance verification, collegiate communications, and store logistics.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
                    <Database className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-white tracking-tight">Collegiate Ledger</p>
                  <p className="text-[11px] text-emerald-200/60 mt-1 leading-snug">Instant dues verification & receipt clearance</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
                    <MailCheck className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-white tracking-tight">Direct Dispatch</p>
                  <p className="text-[11px] text-emerald-200/60 mt-1 leading-snug">Direct-to-inbox student broadcast & attachments</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
                    <Building className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-white tracking-tight">5 Departments</p>
                  <p className="text-[11px] text-emerald-200/60 mt-1 leading-snug">Unified Basic Science collegiate jurisdiction</p>
                </div>
              </div>

              {/* Constituent Departments Pills */}
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-emerald-400/80 mb-2">Constituent Science Departments:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Computer Science", "Mathematical Sciences", "Chemical Sciences", "Biological Sciences", "Physics"].map((dept) => (
                    <span key={dept} className="text-[10.5px] px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/20 text-emerald-200/80 font-medium">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): The Glassmorphic Executive Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-emerald-500/30 backdrop-blur-2xl">
                {/* Card Interior */}
                <div className="rounded-[2.4rem] bg-[#061e13]/90 p-7 sm:p-9 space-y-6">
                  {/* Header inside Card */}
                  <div className="flex items-start justify-between pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
                        Security Level 4
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Executive Sign-In
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        Authenticate to unlock the collegiate terminal
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <Lock className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Username Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90 block">
                        Administrator Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                          <User className="h-4 w-4" />
                        </div>
                        <Input
                          type="text"
                          value={credentials.username}
                          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                          placeholder="Enter admin username"
                          required
                          className="h-12 pl-10 pr-4 rounded-xl bg-black/40 border-white/15 text-white placeholder:text-white/30 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90 block">
                        Security Passphrase
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={credentials.password}
                          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                          placeholder="Enter security passphrase"
                          required
                          className="h-12 pl-10 pr-11 rounded-xl bg-black/40 border-white/15 text-white placeholder:text-white/30 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-emerald-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>


                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-emerald-400/30"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Control Centre</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Security Notice */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-white/50 leading-relaxed text-center">
                    Restricted to authorized Secretariat Executives and ICT Directorate officers. All access sessions are cryptographically signed and logged.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Executive Footer */}
        <footer className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 border-t border-white/10 text-center text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} NASS LASUSTECH Chapter • College of Basic Sciences</span>
          <span className="text-emerald-400/80 font-medium">DEVMOH-Led Administration • Official Secretariat Terminal</span>
        </footer>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "students", label: "Students", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "store", label: "Store & Inventory", icon: ShoppingBag },
    { id: "pastQuestions", label: "Past Questions", icon: BookOpen },
    { id: "mailer", label: "Communications & Mailer", icon: Mail },
    { id: "academics", label: "Academic", icon: Settings },
    { id: "executives", label: "Executives", icon: ShieldCheck },
    { id: "events", label: "Events", icon: Calendar },
    { id: "voting", label: "Voting", icon: Trophy },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f5f7f2] flex flex-col">
      {/* Top Header Bar for Desktop */}
      <header className="hidden lg:flex items-center justify-between bg-[#062018] px-6 py-3.5 text-white border-b border-emerald-950/80 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span className="font-display font-bold text-sm tracking-wide uppercase">DEVMOH-Led Administration • NASS Secretariat</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="text-emerald-300 hover:text-white transition-colors font-medium">
            ← Open Public Website
          </Link>
          <span className="text-white/30">•</span>
          <span className="text-white/70">{adminUser.name}</span>
          <Button size="sm" variant="outline" onClick={handleLogout} className="h-7 text-xs border-white/20 bg-transparent text-white hover:bg-white hover:text-[#062018]">
            <LogOut className="h-3 w-3 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </header>
        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-[#062018] px-5 py-4 text-white lg:hidden shadow-md">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.35em] text-primary/80 font-bold">NASS Admin</span>
            <span className="font-display text-sm font-bold">Control Centre</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Sidebar/Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-80 max-w-[85vw] bg-[#062018] p-6 text-white flex flex-col h-full shadow-2xl">
              {/* Close Button */}
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="text-xs uppercase tracking-[0.35em] text-primary/80 font-bold">NASS Admin</p>
              <h1 className="mt-4 font-display text-2xl font-bold">Control Centre</h1>
              <p className="mt-2 text-xs text-white/65">{adminUser.name}</p>

              <div className="mt-8 space-y-2 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }} 
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${activeTab === item.id ? "bg-white text-[#062018]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }} 
                className="mt-auto w-full justify-start rounded-2xl border-white/20 bg-transparent text-white hover:bg-white hover:text-[#062018] h-11"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
          <aside className="hidden w-72 shrink-0 rounded-[2rem] bg-[#062018] p-6 text-white lg:block sticky top-6 h-fit">
            <p className="text-xs uppercase tracking-[0.35em] text-primary/80">NASS Admin</p>
            <h1 className="mt-4 font-display text-2xl font-bold">Control Centre</h1>
            <p className="mt-2 text-sm text-white/65">{adminUser.name}</p>
            <div className="mt-8 space-y-2">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${activeTab === item.id ? "bg-white text-[#062018]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={handleLogout} className="mt-8 w-full justify-start rounded-2xl border-white/20 bg-transparent text-white hover:bg-white hover:text-[#062018]">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/80">Website + Voting Admin</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Everything in one dashboard.</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Main backend and Korapay voting backend are both connected here.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f7fbf6] p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Students</p>
                    <p className="mt-2 text-2xl font-bold">{dashboard?.stats?.totalStudents || students.length || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7fbf6] p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Flagged</p>
                    <p className="mt-2 text-2xl font-bold">{dashboard?.stats?.flaggedStudents || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7fbf6] p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Dues Collected</p>
                    <p className="mt-2 text-2xl font-bold">
                      {formatCurrency(
                        votingDashboard?.totals?.totalAmount ||
                        filteredStudentPayments
                          .filter(p => p.status.toLowerCase() === "paid")
                          .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold">Site Snapshot</h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Session</p><p className="mt-2 font-semibold">{dashboard?.stats?.currentSession || "Not set"}</p></div>
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Semester</p><p className="mt-2 font-semibold">{dashboard?.stats?.currentSemester || "Not set"}</p></div>
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Executives</p><p className="mt-2 font-semibold">{dashboard?.stats?.executives || 0}</p></div>
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold">Voting Snapshot</h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Total Votes</p><p className="mt-2 font-semibold">{votingDashboard?.totals?.totalVotes || 0}</p></div>
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Transactions</p><p className="mt-2 font-semibold">{votingDashboard?.totals?.confirmedTransactions || 0}</p></div>
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Voting Status</p><p className="mt-2 font-semibold">{String(votingSettingsForm.votingOpen) === "0" ? "Closed" : "Open"}</p></div>
                    <div className="rounded-2xl bg-[#f7fbf6] p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Deadline</p><p className="mt-2 font-semibold">{votingSettingsForm.votingClosesAt || "Not set"}</p></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2rem] bg-white p-6 shadow-sm h-fit">
                  <div className="flex items-center gap-3"><Flag className="h-5 w-5 text-primary" /><h3 className="font-display text-xl font-bold">Flag Student Account</h3></div>
                  <div className="mt-6 space-y-4">
                    <Input placeholder="Matric number" value={flagForm.matric_number} onChange={(e) => setFlagForm({ ...flagForm, matric_number: e.target.value })} />
                    <Input placeholder="Student name" value={flagForm.student_name} onChange={(e) => setFlagForm({ ...flagForm, student_name: e.target.value })} />
                    <Input placeholder="Reason" value={flagForm.reason} onChange={(e) => setFlagForm({ ...flagForm, reason: e.target.value })} />
                    <Textarea placeholder="Message that should show on the student dashboard" value={flagForm.message} onChange={(e) => setFlagForm({ ...flagForm, message: e.target.value })} />
                    <Button disabled={submitting} onClick={() => withSubmit(async () => {
                      await adminFetch("/admin/students/flags", { method: "POST", body: JSON.stringify(flagForm) });
                      setFlagForm({ matric_number: "", student_name: "", reason: "", message: "" });
                      await loadAll();
                    }, "Student flag saved and will show on the dashboard.")}>Save Flag</Button>
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold">Student Directory</h3>
                  <div className="mt-4">
                    <Input
                      type="text"
                      placeholder="Search student by name or matric number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl border-border bg-muted/20"
                    />
                  </div>
                  <div className="mt-6 max-h-[640px] space-y-3 overflow-y-auto">
                    {(students || [])
                      .filter((student) => {
                        const name = (student.full_name || student.name || "").toLowerCase();
                        const matric = (student.matric_number || student.matric_no || student.matric || "").toLowerCase();
                        const email = (student.email || "").toLowerCase();
                        const dept = (student.department || "").toLowerCase();
                        const query = searchQuery.toLowerCase().trim();
                        return name.includes(query) || matric.includes(query) || email.includes(query) || dept.includes(query);
                      })
                      .map((student, index) => {
                      const matric = student.matric_number || student.matric_no || student.matric || `student-${index}`;
                      const isFresher = student.level === "100L" || matric.startsWith("FSH");
                      const isPaid = student.dues_status?.toLowerCase() === "paid" || localStorage.getItem(`nass_dues_${matric}`) === "Paid";
                      const paidDuesAmount = resolveStudentDuesPaidAmount(matric, student.email, student);

                      return (
                        <div key={matric} className="rounded-2xl border border-border p-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-slate-900 text-sm uppercase">{student.full_name || student.name || "Student Scholar"}</p>
                                {isFresher ? (
                                  <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                                    100L Fresher (Matric Pending)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full">
                                    Staylite ({student.level || "200L-400L"})
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                                <span className="font-mono font-bold text-[#1a4480]">
                                  {isFresher ? `App ID: ${matric}` : `Matric: ${matric}`}
                                </span>
                                <span>•</span>
                                <span>{student.department || "Basic Sciences"}</span>
                                {student.email && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-slate-600">{student.email}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${isPaid ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
                                {isPaid ? `✓ Dues Cleared (₦${paidDuesAmount.toLocaleString()})` : "⏳ Dues Unpaid (₦2,500)"}
                              </span>

                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${student.activeFlag ? "bg-red-100 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                                {student.activeFlag ? "Flagged" : "Active"}
                              </span>

                              {student.activeFlag && (
                                <Button variant="outline" className="h-7 rounded-full px-2.5 text-xs" onClick={() => withSubmit(async () => {
                                  await adminFetch(`/admin/students/flags/${student.activeFlag.id}`, { method: "DELETE" });
                                  await loadAll();
                                }, "Student flag resolved.")}>Resolve</Button>
                              )}
                            </div>
                          </div>
                          {student.activeFlag && (
                            <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-800">
                              <p className="font-semibold">{student.activeFlag.reason}</p>
                              <p className="mt-0.5 text-slate-600">{student.activeFlag.message}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6">
                {/* Header Strip with Metrics */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 mb-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        Financial Audit & Collections
                      </div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                        Student Payment History
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Comprehensive ledger of sessional dues, departmental fees, and awards voting transactions.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="rounded-xl border-border hover:bg-muted/40 font-semibold gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Print Summary
                      </Button>
                      <Button
                        onClick={handleDownloadPaymentsCSV}
                        className="rounded-xl bg-[#062018] text-white hover:bg-[#062018]/90 font-semibold gap-2 shadow-sm"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Download CSV / Excel
                      </Button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Dues Collected</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-950">
                        {formatCurrency(
                          filteredStudentPayments
                            .filter(p => p.status.toLowerCase() === "paid")
                            .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                        )}
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-700/80 font-medium">From verified student receipts</p>
                    </div>

                    <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Cleared Students</p>
                      <p className="mt-2 text-2xl font-bold text-blue-950">
                        {filteredStudentPayments.filter(p => p.status.toLowerCase() === "paid" && p.payment_type.includes("Dues")).length}
                      </p>
                      <p className="mt-1 text-[11px] text-blue-700/80 font-medium">Session dues validated</p>
                    </div>

                    <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Dues</p>
                      <p className="mt-2 text-2xl font-bold text-amber-950">
                        {filteredStudentPayments.filter(p => p.status.toLowerCase() !== "paid" && p.payment_type.includes("Dues")).length}
                      </p>
                      <p className="mt-1 text-[11px] text-amber-700/80 font-medium">Awaiting collegiate confirmation</p>
                    </div>

                    <div className="rounded-2xl bg-purple-50/70 p-4 border border-purple-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-800">Total Records</p>
                      <p className="mt-2 text-2xl font-bold text-purple-950">
                        {filteredStudentPayments.length}
                      </p>
                      <p className="mt-1 text-[11px] text-purple-700/80 font-medium">Showing matched records</p>
                    </div>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Search Records</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search name, matric, ref..."
                          value={paymentSearch}
                          onChange={(e) => setPaymentSearch(e.target.value)}
                          className="rounded-xl pl-9 bg-muted/20 border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Payment Status</label>
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid / Confirmed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Department</label>
                      <select
                        value={paymentDeptFilter}
                        onChange={(e) => setPaymentDeptFilter(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="Industrial Mathematics">Industrial Mathematics</option>
                        <option value="Statistics">Statistics</option>
                        <option value="Mathematical Sciences">Mathematical Sciences</option>
                        <option value="Biological Sciences">Biological Sciences</option>
                        <option value="Chemical Sciences">Chemical Sciences</option>
                        <option value="Physics with Electronics">Physics with Electronics</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Payment Type</label>
                      <select
                        value={paymentTypeFilter}
                        onChange={(e) => setPaymentTypeFilter(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">All Payment Types</option>
                        <option value="dues">Collegiate Session Dues</option>
                        <option value="labcoat">Official Lab Coats</option>
                        <option value="books">Practical Manuals & Hardcover Books</option>
                        <option value="award">Awards & Voting Payments</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Records Table */}
                  <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#f8faf7] text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-border">
                        <tr>
                          <th className="py-3 px-4">Student & Matric</th>
                          <th className="py-3 px-4">Category & Ref</th>
                          <th className="py-3 px-4">Department / Level</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Channel / Date</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredStudentPayments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              <Receipt className="mx-auto h-8 w-8 opacity-40 mb-2" />
                              <p className="font-medium">No payment records found matching your filters.</p>
                              <p className="text-xs mt-1">Try resetting the search filters above.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredStudentPayments.map((record, i) => (
                            <tr key={record.id || i} className="hover:bg-muted/10 transition">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">{record.student_name}</div>
                                <div className="text-xs font-mono text-muted-foreground">{record.matric_number}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800">{record.payment_type}</div>
                                <div className="text-xs font-mono text-muted-foreground">{record.reference}</div>
                                {(record.labcoat_name || record.jersey_name || record.size || record.whatsapp_number) && (
                                  <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                                    {record.labcoat_name && (
                                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                                        Labcoat: {record.labcoat_name}
                                      </span>
                                    )}
                                    {record.jersey_name && (
                                      <span className="bg-blue-100 text-[#1a4480] px-1.5 py-0.5 rounded font-mono font-bold">
                                        Jersey: {record.jersey_name} #{record.jersey_number || '10'}
                                      </span>
                                    )}
                                    {record.size && (
                                      <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                                        Size: {record.size}
                                      </span>
                                    )}
                                    {record.whatsapp_number && (
                                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                        WA: {record.whatsapp_number}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-slate-800">{record.department}</div>
                                <div className="text-xs text-muted-foreground">{record.level}</div>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                {formatCurrency(record.amount)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-xs font-medium text-slate-700">{record.channel}</div>
                                <div className="text-[11px] text-muted-foreground">
                                  {new Date(record.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      record.status.toLowerCase() === "paid"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {record.status.toLowerCase() === "paid" ? (
                                      <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                    {record.status}
                                  </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Showing <strong className="text-slate-800">{filteredStudentPayments.length}</strong> record{filteredStudentPayments.length === 1 ? "" : "s"}
                    </span>
                    <button
                      onClick={handleDownloadPaymentsCSV}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export filtered records as CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "store" && (
              <div className="space-y-6">
                {/* Header Strip with Metrics */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 mb-2">
                        <ShoppingBag className="h-3.5 w-3.5 text-emerald-700" />
                        Merchandise & Inventory Command
                      </div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                        Store Inventory & Order Management
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add collegiate items, edit pricing in real-time, toggle price enactments, and oversee student kit orders.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={handleResetStoreDefaults}
                        variant="outline"
                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset Defaults
                      </Button>
                      <Button
                        onClick={handleOpenAddProduct}
                        className="rounded-xl bg-[#062018] text-white hover:bg-[#062018]/90 font-semibold gap-2 shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add New Product
                      </Button>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Products</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-950">
                        {adminStoreProducts.length}
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-700/80 font-medium">In catalog repository</p>
                    </div>

                    <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Live Checkout</p>
                      <p className="mt-2 text-2xl font-bold text-blue-950">
                        {adminStoreProducts.filter(p => p.priceConfirmed && p.price > 0).length}
                      </p>
                      <p className="mt-1 text-[11px] text-blue-700/80 font-medium">Students can pay now</p>
                    </div>

                    <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Enactment</p>
                      <p className="mt-2 text-2xl font-bold text-amber-950">
                        {adminStoreProducts.filter(p => !p.priceConfirmed || p.price <= 0).length}
                      </p>
                      <p className="mt-1 text-[11px] text-amber-700/80 font-medium">Set to Check Back Later</p>
                    </div>

                    <div className="rounded-2xl bg-purple-50/70 p-4 border border-purple-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-800">Store Orders</p>
                      <p className="mt-2 text-2xl font-bold text-purple-950">
                        {getAllStudentPayments().filter(p => !String(p.payment_type || '').toLowerCase().includes("due") && !String(p.payment_type || '').toLowerCase().includes("vote")).length}
                      </p>
                      <p className="mt-1 text-[11px] text-purple-700/80 font-medium">
                        Total {formatCurrency(
                          getAllStudentPayments()
                            .filter(p => !String(p.payment_type || '').toLowerCase().includes("due") && !String(p.payment_type || '').toLowerCase().includes("vote") && p.status?.toLowerCase() === "paid")
                            .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products Filter & Catalog Grid */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Catalog Inventory ({adminStoreProducts.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Click "Quick Price" or "Toggle Enactment" to modify items without entering code.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search product..."
                          value={storeSearchQuery}
                          onChange={(e) => setStoreSearchQuery(e.target.value)}
                          className="h-9 pl-9 rounded-xl border-border text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {["all", "labcoat", "jersey", "manual", "gear", "general"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setStoreCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                              storeCategoryFilter === cat
                                ? "bg-[#062018] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {adminStoreProducts
                      .filter((prod) => {
                        const matchesCat = storeCategoryFilter === "all" || prod.category === storeCategoryFilter;
                        const q = storeSearchQuery.toLowerCase();
                        const matchesSearch = !q || prod.title.toLowerCase().includes(q) || prod.description.toLowerCase().includes(q) || (prod.badge || "").toLowerCase().includes(q);
                        return matchesCat && matchesSearch;
                      })
                      .map((prod) => {
                        return (
                          <div
                            key={prod.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-600/40 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              {/* Header info */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {prod.category}
                                </span>
                                {prod.priceConfirmed && prod.price > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    <span>Active Checkout</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <Clock className="h-3 w-3 text-amber-700" />
                                    <span>Check Back Later</span>
                                  </span>
                                )}
                              </div>

                              {/* Thumbnail */}
                              {prod.image ? (
                                <div className="h-36 w-full rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-3 overflow-hidden">
                                  <img
                                    src={prod.image}
                                    alt={prod.title}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="h-28 w-full rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-center mb-3 text-emerald-700">
                                  <Package className="h-8 w-8" />
                                </div>
                              )}

                              <h4 className="font-display text-base font-bold text-slate-900 leading-snug">
                                {prod.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {prod.description}
                              </p>

                              {/* Badge */}
                              {prod.badge && (
                                <div className="mt-2.5">
                                  <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {prod.badge}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Price and Actions footer */}
                            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Price:</span>
                                <span className="font-mono text-xl font-black text-[#145a32]">
                                  {prod.price > 0 ? formatCurrency(prod.price) : "Pending Enactment"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setQuickPriceItem({ id: prod.id, title: prod.title, price: prod.price });
                                    setQuickPriceVal(prod.price);
                                  }}
                                  className="h-8 text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1 rounded-lg"
                                >
                                  <Tag className="h-3 w-3 text-slate-500" />
                                  <span>Edit Price</span>
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTogglePriceConfirmed(prod)}
                                  className={`h-8 text-xs font-semibold gap-1 rounded-lg ${
                                    prod.priceConfirmed
                                      ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  }`}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  <span>{prod.priceConfirmed ? "Make Pending" : "Enact Price"}</span>
                                </Button>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="h-7 text-xs font-semibold text-slate-600 hover:bg-slate-100 gap-1 px-2.5"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>Edit Details</span>
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteProduct(prod)}
                                  className="h-7 text-xs font-semibold text-red-600 hover:bg-red-50 gap-1 px-2.5"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Student Store Orders Ledger */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Student Store Orders & Dispatch Ledger
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Recent kit, apparel, and manual orders cleared via Korapay. Direct WhatsApp links provided for collection alerts.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Item & Customization</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Date & Ref</th>
                          <th className="py-3 px-4">WhatsApp Contact</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {getAllStudentPayments()
                          .filter((p) => !String(p.payment_type || '').toLowerCase().includes("due") && !String(p.payment_type || '').toLowerCase().includes("vote"))
                          .map((order, idx) => {
                            const waNumber = order.whatsapp_number || order.phone || "";
                            const cleanWa = waNumber.replace(/[^0-9]/g, "");
                            const studentName = order.student_name || "Science Scholar";
                            const itemTitle = order.payment_type || "Collegiate Order";
                            const waLink = cleanWa ? `https://wa.me/${cleanWa.startsWith("0") ? `234${cleanWa.slice(1)}` : cleanWa}?text=${encodeURIComponent(`Hello ${studentName}, this is the NASS LASUSTECH Secretariat. Your order for ${itemTitle} is ready for collection at College of Basic Science Ground Floor!`)}` : null;

                            return (
                              <tr key={order.reference || idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-900">{studentName}</p>
                                  <p className="font-mono text-[11px] text-slate-500">{order.matric_number || "MATRIC-N/A"}</p>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  {itemTitle}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                                  {formatCurrency(order.amount)}
                                </td>
                                <td className="py-3.5 px-4">
                                  <p className="text-slate-600">{new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
                                  <p className="font-mono text-[10px] text-slate-400">Ref: {order.reference || "N/A"}</p>
                                </td>
                                <td className="py-3.5 px-4">
                                  {waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors text-[11px]"
                                    >
                                      <span>{waNumber || "Chat Student"}</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 italic">No number recorded</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                                    <span>Verified</span>
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        {getAllStudentPayments().filter((p) => !String(p.payment_type || '').toLowerCase().includes("due") && !String(p.payment_type || '').toLowerCase().includes("vote")).length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No store merchandise orders recorded yet. As students checkout lab coats, jerseys, and manuals, their orders will appear here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add / Edit Product Modal Dialog */}
                {productModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-5 w-5 text-emerald-700" />
                          <h3 className="font-display text-lg font-bold text-slate-900">
                            {editingProductId ? "Edit Store Product" : "Add New Store Product"}
                          </h3>
                        </div>
                        <button
                          onClick={() => setProductModalOpen(false)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Product Title *</label>
                          <Input
                            placeholder="e.g. CBS Embroidered Science Hoodie"
                            value={productForm.title}
                            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                            className="mt-1 rounded-xl"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                            >
                              <option value="labcoat">Lab Coat (Custom Embroidery)</option>
                              <option value="jersey">Sport Jersey</option>
                              <option value="manual">Practical Manual</option>
                              <option value="gear">Collegiate Gear</option>
                              <option value="general">General Merchandise</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase">Price (₦) *</label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g. 5500"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                              className="mt-1 rounded-xl font-mono font-bold"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <input
                            type="checkbox"
                            id="priceConfirmedCheck"
                            checked={productForm.priceConfirmed}
                            onChange={(e) => setProductForm({ ...productForm, priceConfirmed: e.target.checked })}
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor="priceConfirmedCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                            Enact Price for Instant Checkout (Unchecked will show "Check Back Later")
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Badge / Tagline</label>
                          <Input
                            placeholder="e.g. 2025/2026 Edition or Official CBS Merchandise"
                            value={productForm.badge}
                            onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                            className="mt-1 rounded-xl"
                          />
                        </div>

                        {/* Image URL & File Upload */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase">Product Image</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Image URL (or upload local file below)"
                              value={productForm.image}
                              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                              className="rounded-xl text-xs"
                            />
                            <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300">
                              <UploadCloud className="h-4 w-4" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProductImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {productForm.image && (
                            <div className="mt-2 h-24 w-24 rounded-xl border border-slate-200 p-1 bg-slate-50 overflow-hidden">
                              <img src={productForm.image} alt="Preview" className="h-full w-full object-contain" />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                          <Textarea
                            placeholder="Detailed product description, materials, sizing guidelines..."
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            className="mt-1 rounded-xl text-xs"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Key Features (One per line)</label>
                          <Textarea
                            placeholder="Bespoke student chest embroidery&#10;100% heavy cotton drill&#10;Collection at CBS Ground Floor"
                            value={productForm.features}
                            onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                            className="mt-1 rounded-xl text-xs font-mono"
                            rows={3}
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setProductModalOpen(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-xl bg-[#062018] text-white hover:bg-[#062018]/90 font-bold"
                          >
                            {editingProductId ? "Save Changes" : "Create Product"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Quick Price Modal Dialog */}
                {quickPriceItem && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-emerald-700" />
                          <h4 className="font-display text-base font-bold text-slate-900">Quick Price Update</h4>
                        </div>
                        <button onClick={() => setQuickPriceItem(null)} className="text-slate-400 hover:text-slate-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600">
                        Update collegiate price for <strong>{quickPriceItem.title}</strong>:
                      </p>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase">New Price (₦)</label>
                        <Input
                          type="number"
                          min="0"
                          value={quickPriceVal}
                          onChange={(e) => setQuickPriceVal(Number(e.target.value))}
                          className="mt-1 rounded-xl font-mono text-lg font-black text-[#145a32]"
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setQuickPriceItem(null)} className="rounded-xl">
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleQuickPriceSave} className="rounded-xl bg-[#062018] text-white hover:bg-[#062018]/90 font-bold">
                          Save Price
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pastQuestions" && (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
                {/* Upload Form */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 h-fit">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                    <FolderUp className="h-3.5 w-3.5" />
                    Academic Repository
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">Upload Past Question & Solutions</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload official examination papers, tutorial problem sets, and verified solutions for NASS scholars.
                  </p>

                  <form onSubmit={handleUploadPastQuestion} className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Course Code *
                        </label>
                        <Input
                          placeholder="e.g. CSC 201"
                          value={questionForm.code}
                          onChange={(e) => setQuestionForm({ ...questionForm, code: e.target.value })}
                          required
                          className="rounded-xl uppercase font-semibold"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Academic Level
                        </label>
                        <select
                          className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                          value={questionForm.level}
                          onChange={(e) => setQuestionForm({ ...questionForm, level: e.target.value })}
                        >
                          <option value="100L">100 Level</option>
                          <option value="200L">200 Level</option>
                          <option value="300L">300 Level</option>
                          <option value="400L">400 Level</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Course Title *
                      </label>
                      <Input
                        placeholder="e.g. Computer Programming I"
                        value={questionForm.title}
                        onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Department *
                        </label>
                        <select
                          className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                          value={questionForm.department}
                          onChange={(e) => setQuestionForm({ ...questionForm, department: e.target.value })}
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Industrial Mathematics">Industrial Mathematics</option>
                          <option value="Statistics">Statistics</option>
                          <option value="Mathematical Sciences">Mathematical Sciences</option>
                          <option value="Biological Sciences">Biological Sciences</option>
                          <option value="Chemical Sciences">Chemical Sciences</option>
                          <option value="Physics with Electronics">Physics with Electronics</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Semester
                        </label>
                        <select
                          className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                          value={questionForm.semester}
                          onChange={(e) => setQuestionForm({ ...questionForm, semester: e.target.value })}
                        >
                          <option value="First Semester">First Semester</option>
                          <option value="Second Semester">Second Semester</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Resource Category
                      </label>
                      <select
                        className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                        value={questionForm.category}
                        onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                      >
                        <option value="Past Questions">Exam Past Questions</option>
                        <option value="Solutions & Guide">Worked Solutions & Guide</option>
                        <option value="Lecture Compendium">Lecture Compendium</option>
                        <option value="Formula Handbook">Formula & Practical Handbook</option>
                      </select>
                    </div>

                    {/* File Attachment Upload */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Attach Document / PDF File
                      </label>
                      <div className="relative rounded-2xl border-2 border-dashed border-border/80 p-5 text-center hover:border-primary/50 transition bg-muted/10">
                        <input
                          type="file"
                          id="past-question-file"
                          accept=".pdf,.doc,.docx,.zip,.png,.jpg"
                          onChange={handleFileSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                          <UploadCloud className="h-8 w-8 text-primary" />
                          <p className="text-xs font-semibold text-slate-800">
                            {questionForm.fileName ? questionForm.fileName : "Click to select or drag PDF file here"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {questionForm.fileName
                              ? `Attached: ${questionForm.fileSize}`
                              : "PDF, DOCX or ZIP up to 25MB"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Description / Exam Scope
                      </label>
                      <Textarea
                        placeholder="e.g. 5-year past examination compilation with step-by-step verified solutions and formula sheets."
                        value={questionForm.description}
                        onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>

                    <Button type="submit" className="w-full rounded-xl bg-[#062018] text-white hover:bg-[#062018]/90 font-semibold gap-2 h-11">
                      <UploadCloud className="h-4 w-4" />
                      Publish Material to Students
                    </Button>
                  </form>
                </div>

                {/* Published Materials List */}
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900">Published Resources ({pastQuestions.length})</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Live materials accessible on the student portal</p>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={questionLevelFilter}
                        onChange={(e) => setQuestionLevelFilter(e.target.value)}
                        className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-medium"
                      >
                        <option value="all">All Levels</option>
                        <option value="100L">100L</option>
                        <option value="200L">200L</option>
                        <option value="300L">300L</option>
                        <option value="400L">400L</option>
                      </select>

                      <select
                        value={questionCategoryFilter}
                        onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                        className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-medium"
                      >
                        <option value="all">All Categories</option>
                        <option value="Past Questions">Past Questions</option>
                        <option value="Solutions & Guide">Solutions</option>
                        <option value="Lecture Compendium">Lecture Notes</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by course code, title, or department..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        className="rounded-xl pl-9 bg-muted/20 border-border"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 overflow-y-auto max-h-[640px] pr-1">
                    {pastQuestions
                      .filter((q) => {
                        if (questionLevelFilter !== "all" && q.level !== questionLevelFilter) return false;
                        if (questionCategoryFilter !== "all" && q.category !== questionCategoryFilter) return false;
                        if (questionSearch.trim()) {
                          const query = questionSearch.toLowerCase();
                          return (
                            (q.code || "").toLowerCase().includes(query) ||
                            (q.title || "").toLowerCase().includes(query) ||
                            (q.department || "").toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((q) => (
                        <div key={q.id} className="rounded-2xl border border-border/80 p-4 hover:border-primary/40 transition bg-[#fafbf9]">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-[#062018] px-2.5 py-1 text-xs font-bold text-white">
                                  {q.code}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                  {q.level} • {q.semester}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {q.fileSize || "2.5 MB"}
                                </span>
                              </div>
                              <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">{q.title}</h4>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{q.description}</p>
                              <p className="mt-2 text-[11px] font-medium text-slate-500">
                                Dept: <span className="text-slate-800 font-semibold">{q.department}</span>
                                {q.downloads !== undefined && (
                                  <span className="ml-3 text-emerald-700">
                                    ★ {q.downloads.toLocaleString()} student downloads
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                              {q.fileUrl ? (
                                <a
                                  href={q.fileUrl}
                                  download={q.fileName || `${q.code}_Past_Questions.pdf`}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition"
                                  title="Download Attached Document"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-xl text-primary"
                                  onClick={() => {
                                    const blob = new Blob([
                                      `NASS LASUSTECH OFFICIAL ACADEMIC REPOSITORY\n\nCOURSE: ${q.code} - ${q.title}\nLEVEL: ${q.level} | SEMESTER: ${q.semester}\nDEPARTMENT: ${q.department}\n\nDESCRIPTION:\n${q.description}\n\nThis material was verified by the NASS Directorate of Academics.`
                                    ], { type: "text/plain;charset=utf-8" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    const summaryName = `${q.code}_Past_Questions_Summary.txt`;
                                    a.href = url;
                                    a.download = summaryName;
                                    a.setAttribute("download", summaryName);
                                    a.style.display = "none";
                                    document.body.appendChild(a);
                                    a.click();
                                    setTimeout(() => {
                                      if (document.body.contains(a)) {
                                        document.body.removeChild(a);
                                      }
                                      URL.revokeObjectURL(url);
                                    }, 45000);
                                  }}
                                  title="Download Summary File"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200"
                                onClick={() => handleDeletePastQuestion(q.id)}
                                title="Delete from Repository"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mailer" && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="rounded-[2rem] bg-gradient-to-br from-[#062018] via-[#0d3b2a] to-[#145a32] p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-emerald-300 mb-2 border border-white/15">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Laravel Mailer & Student Communications Desk</span>
                      </div>
                      <h3 className="font-display text-2xl font-black text-white">
                        Student Broadcast & Direct Messaging Console
                      </h3>
                      <p className="mt-1 text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
                        Dispatch official notifications, statutory dues payment confirmations, and matriculation update reminders directly to verified student Gmail addresses.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center shrink-0 backdrop-blur-md">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Target Audience Count</p>
                      <p className="font-mono text-3xl font-black text-white mt-0.5">
                        {getFilteredRecipients().length}
                      </p>
                      <p className="text-[10px] text-emerald-200/80 mt-0.5">Verified Recipient(s)</p>
                    </div>
                  </div>
                </div>

                {/* SMTP / Live Delivery Gateway Configuration & Test Card */}
                <div className="rounded-[2rem] bg-gradient-to-r from-emerald-950 via-slate-900 to-[#062018] p-5 sm:p-6 text-white border border-emerald-500/20 shadow-lg space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          mailerConfig.configured
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}>
                          {mailerConfig.configured ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Inbox Delivery Gateway: Active</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                              <span>Inbox Delivery: Requires Gmail & App Password</span>
                            </>
                          )}
                        </span>
                        <span className="text-[11px] font-mono text-slate-300">
                          {mailerConfig.configured
                            ? `Sender: ${mailerConfig.rawUser || mailerConfig.user}`
                            : "Direct SMTP Not Yet Configured"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Deliver official receipts, broadcasts, and matric alerts directly into student Gmail inboxes without landing in spam.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          getMailerConfigApi().then(setMailerConfig);
                          toast({ title: "Gateway Status Refreshed" });
                        }}
                        className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs h-9 gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Refresh</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSmtpFormOpen(!smtpFormOpen)}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-9 gap-1.5 shadow-sm"
                      >
                        <Key className="h-3.5 w-3.5" />
                        <span>{smtpFormOpen ? "Close Settings" : "Configure Gmail / SMTP"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Fast Instant Inbox Test Form */}
                  <form onSubmit={handleSendTestEmail} className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                      <Input
                        type="email"
                        required
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="Enter your personal Gmail to test real inbox delivery (e.g. yourname@gmail.com)..."
                        className="pl-10 h-10 rounded-xl bg-black/40 border-white/15 text-white placeholder:text-slate-400 text-xs font-medium focus:border-emerald-400 focus:ring-emerald-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={testingEmail}
                      className="w-full sm:w-auto h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs shadow-md shrink-0 gap-2 active:scale-95 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{testingEmail ? "Delivering Test..." : "Send Test to My Inbox"}</span>
                    </Button>
                  </form>

                  {/* Collapsible SMTP Configuration Drawer */}
                  {smtpFormOpen && (
                    <form onSubmit={handleSaveSmtpSettings} className="pt-4 border-t border-white/10 space-y-4 bg-black/30 p-4 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Google Workspace / Gmail SMTP Settings</span>
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium">Stored securely on local server</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Sender Gmail Address *
                          </label>
                          <Input
                            type="email"
                            required
                            placeholder="e.g. nass.lasustech@gmail.com"
                            value={smtpForm.user}
                            onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                            className="h-9 rounded-xl bg-slate-900 border-white/15 text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Google App Password (16 Characters) *
                          </label>
                          <Input
                            type="password"
                            placeholder="e.g. abcd efgh ijkl mnop"
                            value={smtpForm.pass}
                            onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                            className="h-9 rounded-xl bg-slate-900 border-white/15 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Sender Display Name
                          </label>
                          <Input
                            type="text"
                            placeholder="Nigerian Association of Science Students (NASS LASUSTECH)"
                            value={smtpForm.fromName}
                            onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                            className="h-9 rounded-xl bg-slate-900 border-white/15 text-white text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              SMTP Host
                            </label>
                            <Input
                              type="text"
                              value={smtpForm.host}
                              onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                              className="h-9 rounded-xl bg-slate-900 border-white/15 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Port <span className="text-emerald-400 font-normal">(465 SSL Recommended)</span>
                            </label>
                            <Input
                              type="number"
                              value={smtpForm.port}
                              onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value, 10) || 465 })}
                              placeholder="465"
                              className="h-9 rounded-xl bg-slate-900 border-white/15 text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/90 leading-relaxed">
                        <strong className="text-white">How to generate a Gmail App Password:</strong><br />
                        1. Visit your Google Account: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline text-emerald-400 font-bold">myaccount.google.com/security</a>.<br />
                        2. Ensure <strong>2-Step Verification</strong> is ON.<br />
                        3. Search for <strong>App Passwords</strong> &rarr; generate a new 16-character code &rarr; paste it above.
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setSmtpFormOpen(false)}
                          className="h-9 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={savingSmtp}
                          className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
                        >
                          {savingSmtp ? "Saving..." : "Save SMTP Credentials"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  {/* Left Column: Email Composer */}
                  <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 space-y-5">
                    <div>
                      <h4 className="font-display text-lg font-bold text-slate-900">Compose Broadcast Message</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose your target group or click a preset template below to populate standard collegiate notices.
                      </p>
                    </div>

                    {/* Quick Preset Templates */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>Quick 1-Click Templates</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyMailTemplate("freshers_matric")}
                          className="p-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50/60 hover:bg-emerald-100/60 text-left transition-all text-xs text-emerald-950 font-bold"
                        >
                          <span className="block text-[10px] text-emerald-700 uppercase">100L Freshers</span>
                          Matric Update Notice
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyMailTemplate("dues_clearance")}
                          className="p-2.5 rounded-xl border border-blue-600/30 bg-blue-50/60 hover:bg-blue-100/60 text-left transition-all text-xs text-blue-950 font-bold"
                        >
                          <span className="block text-[10px] text-blue-700 uppercase">Statutory Dues</span>
                          Dues Clearance Notice
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyMailTemplate("congress")}
                          className="p-2.5 rounded-xl border border-purple-600/30 bg-purple-50/60 hover:bg-purple-100/60 text-left transition-all text-xs text-purple-950 font-bold"
                        >
                          <span className="block text-[10px] text-purple-700 uppercase">College Event</span>
                          Congress & Science Week
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSendBroadcastMail} className="space-y-4 pt-1">
                      {/* Target Audience Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Target Audience *
                          </label>
                          <select
                            value={mailAudience}
                            onChange={(e) => setMailAudience(e.target.value as any)}
                            className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                          >
                            <option value="all">All Registered Students</option>
                            <option value="freshers">Freshers Only (100L Scholars)</option>
                            <option value="staylites">Staylites Only (200L - 400L)</option>
                            <option value="department">By Specific Department</option>
                          </select>
                        </div>

                        {mailAudience === "department" && (
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Select Department
                            </label>
                            <select
                              value={mailSelectedDept}
                              onChange={(e) => setMailSelectedDept(e.target.value)}
                              className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                            >
                              <option value="Computer Science">Computer Science</option>
                              <option value="Software Engineering">Software Engineering</option>
                              <option value="Cyber Security">Cyber Security</option>
                              <option value="Industrial Mathematics">Industrial Mathematics</option>
                              <option value="Statistics">Statistics</option>
                              <option value="Biochemistry">Biochemistry</option>
                              <option value="Microbiology">Microbiology</option>
                              <option value="Chemical Sciences">Chemical Sciences</option>
                              <option value="Mathematical Sciences">Mathematical Sciences</option>
                              <option value="Biological Sciences">Biological Sciences</option>
                              <option value="Physics with Electronics">Physics with Electronics</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Email Subject Header *
                        </label>
                        <Input
                          value={mailSubject}
                          onChange={(e) => setMailSubject(e.target.value)}
                          placeholder="e.g. Action Required: Update Your Official LASUSTECH Matriculation Number"
                          required
                          className="rounded-xl font-medium text-xs h-10"
                        />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Message Body (Markdown / Plain Text) *
                        </label>
                        <Textarea
                          value={mailBody}
                          onChange={(e) => setMailBody(e.target.value)}
                          placeholder="Compose your collegiate announcement or official notice here..."
                          required
                          rows={8}
                          className="rounded-xl text-xs font-mono leading-relaxed"
                        />
                      </div>

                      {/* Attachments Section (Images, PDFs, Documents) */}
                      <div className="space-y-2 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-50/40 p-3.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Broadcast Attachments (Images, PDFs, Docs)</span>
                          </label>
                          <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                            {mailAttachments.length} file(s) attached
                          </span>
                        </div>

                        {/* Attached Files Preview Grid */}
                        {mailAttachments.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {mailAttachments.map((att, index) => {
                              const isImage = att.contentType?.startsWith("image/") || att.filename.match(/\.(png|jpe?g|gif|webp|svg)$/i);
                              const sizeFormatted = att.size
                                ? att.size > 1024 * 1024
                                  ? `${(att.size / (1024 * 1024)).toFixed(1)} MB`
                                  : `${(att.size / 1024).toFixed(0)} KB`
                                : "";

                              return (
                                <div
                                  key={`${att.filename}-${index}`}
                                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-xs hover:border-emerald-300 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    {isImage && att.content ? (
                                      <img
                                        src={att.content}
                                        alt={att.filename}
                                        className="h-8 w-8 rounded object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-extrabold text-[10px]">
                                        {att.filename.split(".").pop()?.toUpperCase() || "FILE"}
                                      </div>
                                    )}
                                    <div className="overflow-hidden">
                                      <p className="font-semibold text-slate-900 truncate text-xs" title={att.filename}>
                                        {att.filename}
                                      </p>
                                      {sizeFormatted && (
                                        <p className="text-[10px] text-muted-foreground">{sizeFormatted}</p>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveAttachment(index)}
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md shrink-0"
                                    title="Remove attachment"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* File Input */}
                        <div>
                          <input
                            type="file"
                            id="mail-attachment-input"
                            multiple
                            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                            onChange={handleAttachmentUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="mail-attachment-input"
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg border border-emerald-600/30 bg-white hover:bg-emerald-50/70 text-emerald-950 font-bold text-xs cursor-pointer transition-all shadow-xs active:scale-[0.99]"
                          >
                            <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Click to Attach Image, Flyer, or PDF Document</span>
                            <span className="text-[10px] font-normal text-muted-foreground">(Max 15MB each)</span>
                          </label>
                        </div>
                      </div>

                      {/* Anti-Spam Deliverability Info */}
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/60 p-3 text-xs text-emerald-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Anti-Spam & Deliverability Protocols Active</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Dispatches include RFC 5322 compliance, institutional postal footer, and matching plain-text alternative. Every outgoing email automatically includes a student notice advising recipients to check Spam/Promotions and mark <strong>"Report Not Spam"</strong> to train Gmail algorithms.
                        </p>
                      </div>

                      {/* Dispatch Action */}
                      <Button
                        type="submit"
                        disabled={sendingMail}
                        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md gap-2 transition-all active:scale-[0.98]"
                      >
                        <Send className="h-4 w-4" />
                        <span>
                          {sendingMail
                            ? "Dispatching Broadcast via Gateway..."
                            : `Dispatch Broadcast to ${getFilteredRecipients().length} Student(s)${
                                mailAttachments.length > 0 ? ` (${mailAttachments.length} Attachment${mailAttachments.length > 1 ? 's' : ''})` : ''
                              }`}
                        </span>
                      </Button>
                    </form>
                  </div>

                  {/* Right Column: Matched Recipient List & Past Dispatches */}
                  <div className="space-y-6">
                    {/* Active Recipients Preview */}
                    <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-bold text-slate-900">
                          Active Recipient Preview ({getFilteredRecipients().length})
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Live Match
                        </span>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {getFilteredRecipients().length === 0 ? (
                          <p className="text-muted-foreground text-center py-6 text-xs">
                            No students match this audience filter.
                          </p>
                        ) : (
                          getFilteredRecipients().slice(0, 15).map((r, i) => (
                            <div key={i} className="py-2 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate uppercase">{r.name}</p>
                                <p className="text-[10.5px] font-mono text-muted-foreground truncate">{r.email}</p>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#1a4480] shrink-0 bg-blue-50 px-1.5 py-0.5 rounded">
                                {r.matric || r.level}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Past Dispatch History */}
                    <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-border/40 space-y-3">
                      <h4 className="font-display text-sm font-bold text-slate-900">
                        Recent Broadcast Dispatch Logs
                      </h4>

                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {mailLogs.length === 0 ? (
                          <p className="text-muted-foreground text-center py-6 text-xs">
                            No emails dispatched yet in this session.
                          </p>
                        ) : (
                          mailLogs.map((log) => (
                            <div key={log.id} className="py-2.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-[11px] truncate">{log.subject}</span>
                                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold shrink-0">
                                  {log.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Target: {log.targetGroup} ({log.recipientCount} emails)</span>
                                <span>{new Date(log.sentAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academics" && (
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h3 className="font-display text-xl font-bold">Current Academic Session</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Input placeholder="2025/2026 Session" value={academicForm.session} onChange={(e) => setAcademicForm({ ...academicForm, session: e.target.value })} />
                  <select className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" value={academicForm.semester} onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value })}>
                    <option>First Semester</option>
                    <option>Second Semester</option>
                  </select>
                </div>
                <Button className="mt-4" disabled={submitting} onClick={() => withSubmit(async () => {
                  await adminFetch("/admin/settings/academic", { method: "PUT", body: JSON.stringify(academicForm) });
                  await loadAll();
                }, "Academic session updated.")}>Update Academic Settings</Button>
              </div>
            )}

            {activeTab === "executives" && (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2rem] bg-white p-6 shadow-sm h-fit">
                  <h3 className="font-display text-xl font-bold">{executiveForm.id ? "Edit Executive" : "Add Executive"}</h3>
                  <div className="mt-6 space-y-4">
                    <Input placeholder="Full name" value={executiveForm.name} onChange={(e) => setExecutiveForm({ ...executiveForm, name: e.target.value })} />
                    <Input placeholder="Post" value={executiveForm.post} onChange={(e) => setExecutiveForm({ ...executiveForm, post: e.target.value })} />
                    <Input placeholder="Level" value={executiveForm.level} onChange={(e) => setExecutiveForm({ ...executiveForm, level: e.target.value })} />
                    <div className="flex gap-2 items-center">
                      <Input className="flex-1" placeholder="Image URL" value={executiveForm.image_url} onChange={(e) => setExecutiveForm({ ...executiveForm, image_url: e.target.value })} />
                      <div className="relative">
                        <Button variant="outline" type="button" className="h-10 rounded-xl px-4 cursor-pointer" disabled={uploading}>
                          {uploading ? "..." : "Upload"}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, (url) => setExecutiveForm({ ...executiveForm, image_url: url }));
                          }}
                        />
                      </div>
                    </div>
                    <Input type="number" placeholder="Sort order" value={executiveForm.sort_order} onChange={(e) => setExecutiveForm({ ...executiveForm, sort_order: Number(e.target.value) })} />
                    <Textarea placeholder="Executive details" value={executiveForm.description} onChange={(e) => setExecutiveForm({ ...executiveForm, description: e.target.value })} />
                    <div className="flex gap-3">
                      <Button disabled={submitting} onClick={() => withSubmit(async () => {
                        const method = executiveForm.id ? "PUT" : "POST";
                        const endpoint = executiveForm.id ? `/admin/executives/${executiveForm.id}` : "/admin/executives";
                        await adminFetch(endpoint, { method, body: JSON.stringify(executiveForm) });
                        setExecutiveForm(emptyExecutive);
                        await loadAll();
                      }, "Executive record updated.")}>{executiveForm.id ? "Update Executive" : "Add Executive"}</Button>
                      <Button variant="outline" onClick={() => setExecutiveForm(emptyExecutive)}>Clear</Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold">Executive List</h3>
                  <div className="mt-6 space-y-3">
                    {(dashboard?.executives || []).map((item: any) => (
                      <div key={item.id} className="rounded-2xl border border-border p-4">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.post} | {item.level}</p>
                        <div className="mt-3 flex gap-3">
                          <Button variant="outline" className="h-8 rounded-full px-3 text-xs" onClick={() => setExecutiveForm(item)}>Edit</Button>
                          <Button variant="outline" className="h-8 rounded-full px-3 text-xs text-red-600" onClick={() => withSubmit(async () => {
                            await adminFetch(`/admin/executives/${item.id}`, { method: "DELETE" });
                            await loadAll();
                          }, "Executive removed.")}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[2rem] bg-white p-6 shadow-sm h-fit">
                    <h3 className="font-display text-xl font-bold">{eventForm.id ? "Edit Event" : "Add Event"}</h3>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <Input placeholder="Slug" value={eventForm.slug} onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })} />
                      <Input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value, slug: eventForm.slug || slugify(e.target.value) })} />
                      <select className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" value={eventForm.event_status} onChange={(e) => setEventForm({ ...eventForm, event_status: e.target.value })}>
                        <option value="upcoming">Upcoming</option>
                        <option value="current">Current</option>
                        <option value="past">Past</option>
                      </select>
                      <Input type="datetime-local" value={eventForm.start_date} onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })} />
                      <Input type="datetime-local" value={eventForm.end_date} onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })} />
                      <Input placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
                      <div className="flex gap-2 items-center">
                        <Input className="flex-1" placeholder="Cover image URL" value={eventForm.cover_image_url} onChange={(e) => setEventForm({ ...eventForm, cover_image_url: e.target.value })} />
                        <div className="relative">
                          <Button variant="outline" type="button" className="h-10 rounded-xl px-4 cursor-pointer" disabled={uploading}>
                            {uploading ? "..." : "Upload"}
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, (url) => setEventForm({ ...eventForm, cover_image_url: url }));
                            }}
                          />
                        </div>
                      </div>
                      <Input placeholder="Registration URL" value={eventForm.registration_url} onChange={(e) => setEventForm({ ...eventForm, registration_url: e.target.value })} />
                      <Input placeholder="Flyer folder name" value={eventForm.flyer_folder} onChange={(e) => setEventForm({ ...eventForm, flyer_folder: e.target.value })} />
                      <Input type="number" placeholder="Sort order" value={eventForm.sort_order} onChange={(e) => setEventForm({ ...eventForm, sort_order: Number(e.target.value) })} />
                    </div>
                    <Textarea className="mt-4" placeholder="Event description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                    <div className="mt-4 flex gap-3">
                      <Button disabled={submitting} onClick={() => withSubmit(async () => {
                        const method = eventForm.id ? "PUT" : "POST";
                        const endpoint = eventForm.id ? `/admin/events/${eventForm.id}` : "/admin/events";
                        await adminFetch(endpoint, { method, body: JSON.stringify(eventForm) });
                        setEventForm(emptyEvent);
                        await loadAll();
                      }, "Event saved.")}>{eventForm.id ? "Update Event" : "Add Event"}</Button>
                      <Button variant="outline" onClick={() => setEventForm(emptyEvent)}>Clear</Button>
                    </div>
                  </div>
                  <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3"><Image className="h-5 w-5 text-primary" /><h3 className="font-display text-xl font-bold">Event Gallery Image</h3></div>
                    <div className="mt-6 space-y-4">
                      <select className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" value={galleryForm.eventId} onChange={(e) => setGalleryForm({ ...galleryForm, eventId: e.target.value })}>
                        <option value="">Select event</option>
                        {(dashboard?.events || []).map((event: any) => <option key={event.id} value={event.id}>{event.title}</option>)}
                      </select>
                      <div className="flex gap-2 items-center">
                        <Input className="flex-1" placeholder="Gallery image URL" value={galleryForm.image_url} onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })} />
                        <div className="relative">
                          <Button variant="outline" type="button" className="h-10 rounded-xl px-4 cursor-pointer" disabled={uploading}>
                            {uploading ? "..." : "Upload"}
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, (url) => setGalleryForm({ ...galleryForm, image_url: url }));
                            }}
                          />
                        </div>
                      </div>
                      <Input placeholder="Caption" value={galleryForm.caption} onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
                      <Button disabled={submitting} onClick={() => withSubmit(async () => {
                        await adminFetch(`/admin/events/${galleryForm.eventId}/gallery`, { method: "POST", body: JSON.stringify(galleryForm) });
                        setGalleryForm({ eventId: "", image_url: "", caption: "" });
                        await loadAll();
                      }, "Gallery image added.")}>Add Gallery Image</Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold">Events</h3>
                  <div className="mt-6 space-y-4">
                    {(dashboard?.events || []).map((item: any) => (
                      <div key={item.id} className="rounded-2xl border border-border p-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.event_status} | {item.location || "No location"} | {item.start_date || "No date"}</p>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" className="h-8 rounded-full px-3 text-xs" onClick={() => setEventForm({ ...item, start_date: item.start_date ? String(item.start_date).slice(0, 16) : "", end_date: item.end_date ? String(item.end_date).slice(0, 16) : "" })}>Edit</Button>
                            <Button variant="outline" className="h-8 rounded-full px-3 text-xs text-red-600" onClick={() => withSubmit(async () => {
                              await adminFetch(`/admin/events/${item.id}`, { method: "DELETE" });
                              await loadAll();
                            }, "Event deleted.")}>Delete</Button>
                          </div>
                        </div>
                        {item.gallery?.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{item.gallery.length} gallery image(s)</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}



            {activeTab === "voting" && (
              <div className="space-y-6 animate-fadeIn">
                {/* ── Voting Structure Map ── */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Database Standing</span>
                      <h3 className="mt-1 font-display text-xl font-bold text-[#062018]">Voting Structure Map</h3>
                      <p className="text-xs text-slate-500">Fully nested view of Sections, Categories, and Nominees with current live vote standings.</p>
                    </div>
                    
                    {/* Controls Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 rounded-lg text-[10px] uppercase tracking-wider font-semibold border-slate-200 text-slate-600 px-3 flex items-center gap-1.5"
                        onClick={() => {
                          const allSecs = getStructuredVotingMap();
                          const next: Record<string, boolean> = {};
                          allSecs.forEach(sec => {
                            next[sec.section_key] = true;
                          });
                          setExpandedSections(next);
                        }}
                      >
                        Expand All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 rounded-lg text-[10px] uppercase tracking-wider font-semibold border-slate-200 text-slate-600 px-3 flex items-center gap-1.5"
                        onClick={() => setExpandedSections({})}
                      >
                        Collapse All
                      </Button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search nominee, category or section..."
                      value={votingSearchQuery}
                      onChange={(e) => setVotingSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl border border-slate-200 focus:border-[#062018] bg-slate-50/50"
                    />
                    {votingSearchQuery && (
                      <button 
                        onClick={() => setVotingSearchQuery("")} 
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {getStructuredVotingMap().length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                        No matches found.
                      </div>
                    ) : (
                      getStructuredVotingMap().map((section: any) => {
                        const isExpanded = votingSearchQuery.trim() !== "" || !!expandedSections[section.section_key];
                        const sectionVotes = section.categories.reduce((acc: number, cat: any) => acc + (cat.totalVotes || 0), 0);
                        const sectionNomineesCount = section.categories.reduce((acc: number, cat: any) => {
                          const catNominees = (nominees || []).filter(
                            (nom: any) => String(nom.category_id || nom.categoryId) === String(cat.id)
                          );
                          return acc + catNominees.length;
                        }, 0);

                        return (
                          <div key={section.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-200">
                            {/* Section Header */}
                            <div 
                              onClick={() => {
                                if (votingSearchQuery.trim() === "") {
                                  setExpandedSections(prev => ({
                                    ...prev,
                                    [section.section_key]: !prev[section.section_key]
                                  }));
                                }
                              }}
                              className={`flex items-center justify-between p-4 cursor-pointer transition ${isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-750 border border-emerald-100/50">
                                  <Award className="h-4 w-4 text-emerald-700" />
                                </div>
                                <div>
                                  <h4 className="font-display text-sm font-bold text-[#062018] flex items-center gap-2">
                                    {section.section_name}
                                    <span className="text-[9px] font-mono font-normal bg-slate-200/60 text-slate-650 px-2 py-0.5 rounded-full select-all uppercase">
                                      {section.section_key}
                                    </span>
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {section.categories.length} categories • {sectionNomineesCount} nominees
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-bold text-emerald-800">{sectionVotes} votes</p>
                                  <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Total Standing</p>
                                </div>
                                <div className="text-slate-400 hover:text-slate-600">
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Section Content */}
                            {isExpanded && (
                              <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                                {section.categories.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic py-2">No categories grouped inside this section.</p>
                                ) : (
                                  <div className="grid gap-4 md:grid-cols-2">
                                    {section.categories.map((category: any) => {
                                      const catNominees = category._filteredNominees || [];
                                      const topNominee = getCategoryLeader((nominees || []).filter(
                                        (nom: any) => String(nom.category_id || nom.categoryId) === String(category.id)
                                      ));
                                      const categoryTotalVotes = (nominees || [])
                                        .filter((nom: any) => String(nom.category_id || nom.categoryId) === String(category.id))
                                        .reduce((sum: number, n: any) => sum + (n.votes || 0), 0);

                                      return (
                                        <div key={category.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 hover:border-slate-350 transition duration-200 relative">
                                          <div className="flex items-start justify-between border-b border-slate-200/50 pb-2.5">
                                            <div>
                                              <h5 className="font-semibold text-slate-800 text-xs">{category.name}</h5>
                                              <p className="text-[9px] text-slate-500 mt-0.5">
                                                {categoryTotalVotes} total votes cast • ₦{category.vote_price || category.votePrice || 100}/vote
                                              </p>
                                            </div>
                                            <div className="flex gap-1.5">
                                              <button 
                                                onClick={() => {
                                                  setCategoryForm(category);
                                                  document.getElementById("category-form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                                }}
                                                className="text-[9px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100"
                                              >
                                                Edit
                                              </button>
                                              <button 
                                                onClick={() => withSubmit(async () => {
                                                  await votingAdminFetch(`/admin/categories/${category.id}`, { method: "DELETE" });
                                                  await refreshVoting();
                                                }, "Category deleted.")}
                                                className="text-[9px] font-bold text-red-700 hover:text-red-900 bg-red-50/80 px-2 py-0.5 rounded border border-red-100"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </div>

                                          <div className="space-y-2 pt-1 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-250 [&::-webkit-scrollbar-thumb]:rounded-full">
                                            {catNominees.length === 0 ? (
                                              <p className="text-[10px] text-slate-400 italic py-1">No nominees added to this category yet.</p>
                                            ) : (
                                              catNominees.map((nom: any) => {
                                                const isLeader = topNominee && String(topNominee.id) === String(nom.id);
                                                const voteShare = categoryTotalVotes > 0 ? Math.round(((nom.votes || 0) / categoryTotalVotes) * 100) : 0;

                                                return (
                                                  <div key={nom.id} className="flex flex-col rounded-xl bg-white border border-slate-150 p-2.5 text-xs shadow-sm hover:shadow transition">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2.5">
                                                        {nom.photo_url ? (
                                                          <img
                                                            src={nom.photo_url.startsWith('uploads/') ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + '/' + nom.photo_url : nom.photo_url}
                                                            alt={nom.full_name}
                                                            className="h-8 w-8 rounded-full object-cover border border-slate-200"
                                                          />
                                                        ) : (
                                                          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                                                            {String(nom.full_name).slice(0,2).toUpperCase()}
                                                          </div>
                                                        )}
                                                        <div>
                                                          <p className="font-semibold text-slate-800 text-[11px]">{nom.full_name}</p>
                                                          <p className="text-[9px] text-slate-400">{nom.department} | {nom.level_label || 'N/A'}</p>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center gap-2.5">
                                                        <div className="text-right">
                                                          <p className="text-[10px] font-bold text-slate-700">{nom.votes || 0} votes</p>
                                                          {isLeader && (
                                                            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-[#1a4480] border border-blue-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                                                              Leading Candidate
                                                            </span>
                                                          )}
                                                        </div>
                                                        <div className="flex gap-1.5 border-l border-slate-100 pl-2">
                                                          <button 
                                                            onClick={() => {
                                                              setNomineeForm(nom);
                                                              document.getElementById("nominee-form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                                            }}
                                                            className="text-slate-450 hover:text-slate-650"
                                                          >
                                                            <Edit2 className="h-3 w-3 text-slate-500 hover:text-[#062018]" />
                                                          </button>
                                                          <button 
                                                            onClick={() => withSubmit(async () => {
                                                              await votingAdminFetch(`/admin/nominees/${nom.id}`, { method: "DELETE" });
                                                              await refreshVoting();
                                                            }, "Nominee deleted.")}
                                                            className="text-slate-450 hover:text-red-650"
                                                          >
                                                            <Trash2 className="h-3 w-3 text-slate-550 hover:text-red-650" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Vote Share Progress Bar */}
                                                    <div className="mt-2 pt-1.5 border-t border-slate-100/50">
                                                      <div className="flex justify-between text-[8px] text-slate-400 font-semibold">
                                                        <span>Vote Share</span>
                                                        <span>{voteShare}%</span>
                                                      </div>
                                                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-0.5">
                                                        <div 
                                                          className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                                                          style={{ width: `${voteShare}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">

                  {/* Settings Card */}
                  <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
                    <h3 className="font-display text-lg font-bold text-[#062018]">Voting Settings</h3>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Event Name</label>
                        <Input placeholder="Awards event name" value={votingSettingsForm.eventName || ""} onChange={(e) => setVotingSettingsForm({ ...votingSettingsForm, eventName: e.target.value })} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Edition</label>
                          <Input placeholder="Edition" value={votingSettingsForm.eventEdition || ""} onChange={(e) => setVotingSettingsForm({ ...votingSettingsForm, eventEdition: e.target.value })} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Vote Price (₦)</label>
                          <Input type="number" placeholder="Vote price" value={votingSettingsForm.votePrice || 100} onChange={(e) => setVotingSettingsForm({ ...votingSettingsForm, votePrice: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Voting Deadline</label>
                        <Input type="datetime-local" value={String(votingSettingsForm.votingClosesAt || "").slice(0, 16)} onChange={(e) => setVotingSettingsForm({ ...votingSettingsForm, votingClosesAt: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Voting Status</label>
                        <select className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" value={String(votingSettingsForm.votingOpen ?? "1")} onChange={(e) => setVotingSettingsForm({ ...votingSettingsForm, votingOpen: e.target.value })}>
                          <option value="1">Voting Open</option>
                          <option value="0">Voting Closed</option>
                        </select>
                      </div>
                      <Button disabled={submitting} className="h-9 px-4 rounded-xl text-xs w-full" onClick={() => withSubmit(async () => {
                        await votingAdminFetch("/admin/settings", { method: "PUT", body: JSON.stringify(votingSettingsForm) });
                        await refreshVoting();
                      }, "Voting settings updated.")}>Save Settings</Button>
                    </div>
                  </div>

                  {/* Sections Card */}
                  <div id="section-form-card" className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-display text-lg font-bold text-[#062018]">Voting Sections</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Section Key</label>
                        <Input placeholder="Section key" value={sectionForm.section_key} onChange={(e) => setSectionForm({ ...sectionForm, section_key: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Section Name</label>
                        <Input placeholder="Section name" value={sectionForm.section_name} onChange={(e) => setSectionForm({ ...sectionForm, section_name: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Flyer Image URL</label>
                        <Input placeholder="Flyer image URL" value={sectionForm.flyer_image_url} onChange={(e) => setSectionForm({ ...sectionForm, flyer_image_url: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Folder Name</label>
                        <Input placeholder="Folder name" value={sectionForm.folder_name} onChange={(e) => setSectionForm({ ...sectionForm, folder_name: e.target.value })} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</label>
                      <Textarea placeholder="Section description" value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button disabled={submitting} className="h-9 px-4 rounded-xl text-xs" onClick={() => withSubmit(async () => {
                        const method = sectionForm.id ? "PUT" : "POST";
                        const endpoint = sectionForm.id ? `/admin/sections/${sectionForm.id}` : "/admin/sections";
                        await votingAdminFetch(endpoint, { method, body: JSON.stringify(sectionForm) });
                        setSectionForm(emptySection);
                        await refreshVoting();
                      }, "Voting section saved.")}>{sectionForm.id ? "Update Section" : "Add Section"}</Button>
                      <Button variant="outline" className="h-9 px-4 rounded-xl text-xs" onClick={() => setSectionForm(emptySection)}>Clear</Button>
                    </div>
                    <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {(votingDashboard?.sections || []).map((item: any) => (
                        <div key={item.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between bg-slate-50/50">
                          <div>
                            <p className="font-semibold text-xs text-slate-800">{item.section_name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.section_key} | {item.folder_name || "No folder"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="h-7 rounded-lg px-2.5 text-[10px] font-semibold border-slate-200 text-slate-650" onClick={() => {
                              setSectionForm(item);
                              document.getElementById("section-form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}>Edit</Button>
                            <Button variant="outline" className="h-7 rounded-lg px-2.5 text-[10px] font-semibold text-red-650 hover:text-red-750 border-slate-200" onClick={() => withSubmit(async () => {
                              await votingAdminFetch(`/admin/sections/${item.id}`, { method: "DELETE" });
                              await refreshVoting();
                            }, "Voting section removed.")}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  {/* Category Add/Edit Card */}
                  <div id="category-form-card" className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
                    <h3 className="font-display text-lg font-bold text-[#062018]">{categoryForm.id ? "Edit Category" : "Add Category"}</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category Name</label>
                        <Input placeholder="e.g. Best Programmer" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: categoryForm.slug || slugify(e.target.value) })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Slug</label>
                        <Input placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Group Key (Section Identifier)</label>
                        <Input placeholder="e.g. tech-digital" value={categoryForm.group_key} onChange={(e) => setCategoryForm({ ...categoryForm, group_key: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Group Display Name</label>
                        <Input placeholder="e.g. Tech & Digital" value={categoryForm.group_name} onChange={(e) => setCategoryForm({ ...categoryForm, group_name: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Hero Image</label>
                        <div className="flex gap-2">
                          <Input placeholder="Hero image URL" className="flex-1" value={categoryForm.hero_image} onChange={(e) => setCategoryForm({ ...categoryForm, hero_image: e.target.value })} />
                          <label className="flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted transition duration-200">
                            {uploading ? "..." : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, (url) => setCategoryForm({ ...categoryForm, hero_image: url }));
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Accent Color</label>
                        <div className="flex gap-3 items-center">
                          <Input type="color" className="w-12 h-10 p-1 rounded-xl" value={categoryForm.accent_color || "#0f9d58"} onChange={(e) => setCategoryForm({ ...categoryForm, accent_color: e.target.value })} />
                          <span className="text-xs font-mono text-slate-500">{categoryForm.accent_color || "#0f9d58"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category Description</label>
                      <Textarea placeholder="Explain award criteria..." value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button disabled={submitting} className="h-9 px-4 rounded-xl text-xs" onClick={() => withSubmit(async () => {
                        const method = categoryForm.id ? "PUT" : "POST";
                        const endpoint = categoryForm.id ? `/admin/categories/${categoryForm.id}` : "/admin/categories";
                        await votingAdminFetch(endpoint, { method, body: JSON.stringify(categoryForm) });
                        setCategoryForm(emptyCategory);
                        await refreshVoting();
                      }, "Voting category saved.")}>{categoryForm.id ? "Update Category" : "Add Category"}</Button>
                      <Button variant="outline" className="h-9 px-4 rounded-xl text-xs" onClick={() => setCategoryForm(emptyCategory)}>Clear</Button>
                    </div>
                    <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {(votingDashboard?.categories || []).map((item: any) => (
                        <div key={item.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between bg-slate-50/50">
                          <div>
                            <p className="font-semibold text-xs text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.group_name || item.groupKey} | {item.totalVotes} votes</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="h-7 rounded-lg px-2.5 text-[10px] font-semibold border-slate-200 text-slate-650" onClick={() => {
                              setCategoryForm(item);
                              document.getElementById("category-form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}>Edit</Button>
                            <Button variant="outline" className="h-7 rounded-lg px-2.5 text-[10px] font-semibold text-red-650 hover:text-red-750 border-slate-200" onClick={() => withSubmit(async () => {
                              await votingAdminFetch(`/admin/categories/${item.id}`, { method: "DELETE" });
                              await refreshVoting();
                            }, "Voting category deleted.")}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nominee Add/Edit Card */}
                  <div id="nominee-form-card" className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
                    <h3 className="font-display text-lg font-bold text-[#062018]">{nomineeForm.id ? "Edit Nominee" : "Add Nominee"}</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category Selection</label>
                        {nomineeForm.id ? (
                          <select className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" value={nomineeForm.category_id} onChange={(e) => setNomineeForm({ ...nomineeForm, category_id: e.target.value, category_ids: [e.target.value] })}>
                            <option value="">Select category</option>
                            {(votingDashboard?.categories || []).map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}
                          </select>
                        ) : (
                          <div className="space-y-2 rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                            <Input 
                              type="text" 
                              placeholder="Search categories..." 
                              value={categorySearchQuery} 
                              onChange={(e) => setCategorySearchQuery(e.target.value)}
                              className="h-8 text-xs rounded-lg"
                            />
                            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                              {(votingDashboard?.categories || [])
                                .filter((cat: any) => String(cat.name).toLowerCase().includes(categorySearchQuery.toLowerCase()))
                                .map((cat: any) => {
                                  const isChecked = (nomineeForm.category_ids || []).includes(cat.id);
                                  return (
                                    <label key={cat.id} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-100/80 cursor-pointer transition text-xs text-slate-700">
                                      <input 
                                        type="checkbox" 
                                        checked={isChecked}
                                        className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                                        onChange={() => {
                                          const currentIds = nomineeForm.category_ids || [];
                                          const nextIds = isChecked 
                                            ? currentIds.filter((id: string) => id !== cat.id)
                                            : [...currentIds, cat.id];
                                          setNomineeForm({ 
                                            ...nomineeForm, 
                                            category_ids: nextIds,
                                            category_id: nextIds[0] || "" 
                                          });
                                        }}
                                      />
                                      <span>{cat.name}</span>
                                    </label>
                                  );
                                })}
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-semibold">
                              <span>{(nomineeForm.category_ids || []).length} categories selected</span>
                              {(nomineeForm.category_ids || []).length > 0 && (
                                <button type="button" className="text-red-500 hover:text-red-705" onClick={() => setNomineeForm({ ...nomineeForm, category_ids: [], category_id: "" })}>Clear all</button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                          <Input placeholder="Full name" value={nomineeForm.full_name} onChange={(e) => setNomineeForm({ ...nomineeForm, full_name: e.target.value, slug: nomineeForm.slug || slugify(e.target.value) })} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Slug</label>
                          <Input placeholder="Slug" value={nomineeForm.slug} onChange={(e) => setNomineeForm({ ...nomineeForm, slug: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</label>
                          <Input placeholder="Department" value={nomineeForm.department} onChange={(e) => setNomineeForm({ ...nomineeForm, department: e.target.value })} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Level</label>
                          <Input placeholder="Level" value={nomineeForm.level_label} onChange={(e) => setNomineeForm({ ...nomineeForm, level_label: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Photo URL / File Upload</label>
                        <div className="flex gap-2">
                          <Input placeholder="Photo URL" className="flex-1" value={nomineeForm.photo_url} onChange={(e) => setNomineeForm({ ...nomineeForm, photo_url: e.target.value })} />
                          <label className="flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted transition duration-200">
                            {uploading ? "..." : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, (url) => setNomineeForm({ ...nomineeForm, photo_url: url }));
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nominee Bio</label>
                        <Textarea placeholder="Nominee details..." value={nomineeForm.bio} onChange={(e) => setNomineeForm({ ...nomineeForm, bio: e.target.value })} />
                      </div>
                      <div className="flex gap-3">
                        <Button disabled={submitting} className="h-9 px-4 rounded-xl text-xs" onClick={() => withSubmit(async () => {
                          if (nomineeForm.id) {
                            await votingAdminFetch(`/admin/nominees/${nomineeForm.id}`, { method: "PUT", body: JSON.stringify(nomineeForm) });
                          } else {
                            const selectedCategories = nomineeForm.category_ids || [];
                            if (selectedCategories.length === 0 && nomineeForm.category_id) {
                              selectedCategories.push(nomineeForm.category_id);
                            }
                            if (selectedCategories.length === 0) {
                              throw new Error("Please select at least one category.");
                            }
                            for (let i = 0; i < selectedCategories.length; i++) {
                              const catId = selectedCategories[i];
                              const baseSlug = nomineeForm.slug || slugify(nomineeForm.full_name);
                              const categorySlug = i === 0 ? baseSlug : `${baseSlug}-${i}`;
                              const payload = {
                                ...nomineeForm,
                                category_id: catId,
                                slug: categorySlug
                              };
                              await votingAdminFetch("/admin/nominees", { method: "POST", body: JSON.stringify(payload) });
                            }
                          }
                          setNomineeForm(emptyNominee);
                          setCategorySearchQuery("");
                          await refreshVoting();
                        }, "Nominee saved.")}>{nomineeForm.id ? "Update Nominee" : "Add Nominee"}</Button>
                        <Button variant="outline" className="h-9 px-4 rounded-xl text-xs" onClick={() => { setNomineeForm(emptyNominee); setCategorySearchQuery(""); }}>Clear</Button>
                      </div>
                    </div>
                    <div className="mt-6 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full space-y-3">
                      {nominees.map((item: any) => (
                        <div key={item.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between bg-slate-50/50">
                          <div>
                            <p className="font-semibold text-xs text-slate-800">{item.full_name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.category_name} | {item.level_label}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="h-7 rounded-lg px-2.5 text-[10px] font-semibold border-slate-200 text-slate-650" onClick={() => {
                              setNomineeForm(item);
                              document.getElementById("nominee-form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}>Edit</Button>
                            <Button variant="outline" className="h-7 rounded-lg px-2.5 text-[10px] font-semibold text-red-650 hover:text-red-750 border-slate-200" onClick={() => withSubmit(async () => {
                              await votingAdminFetch(`/admin/nominees/${item.id}`, { method: "DELETE" });
                              await refreshVoting();
                            }, "Nominee deleted.")}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Voting Transactions Payment Logs ── */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => setTxExpanded(!txExpanded)}
                    className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5 cursor-pointer select-none hover:opacity-90 transition duration-150"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Payment Audit Logs</span>
                      <h3 className="mt-1 font-display text-xl font-bold text-[#062018] flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-emerald-600" />
                        Voting Payment Transactions
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${txExpanded ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                          {txExpanded ? "Open" : "Collapsed"}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">Live feed and log of all payments for votes handled through Korapay.</p>
                    </div>

                    {/* Quick Analytics Summary & Expand/Collapse Toggle */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-50 border border-slate-150 px-3.5 py-1.5 text-right">
                          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Total Confirmed Amount</p>
                          <p className="text-sm font-bold text-emerald-800">
                            {formatCurrency(filteredTransactions.filter(t => t.status === 'confirmed').reduce((acc, t) => acc + Number(t.amount || 0), 0))}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-150 px-3.5 py-1.5 text-right">
                          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Total Votes Cast</p>
                          <p className="text-sm font-bold text-slate-700">
                            {filteredTransactions.filter(t => t.status === 'confirmed').reduce((acc, t) => acc + Number(t.votes || 0), 0)} votes
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition">
                        {txExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {txExpanded && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Filter & Search Controls */}
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Search by reference, voter name, email, nominee..."
                            value={txSearchQuery}
                            onChange={(e) => setTxSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-xl border border-slate-200 focus:border-[#062018] bg-slate-50/50"
                          />
                          {txSearchQuery && (
                            <button 
                              onClick={() => setTxSearchQuery("")} 
                              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Status Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200 w-fit">
                          {["all", "confirmed", "pending", "failed"].map((status) => (
                            <button
                              key={status}
                              onClick={() => setTxStatusFilter(status)}
                              className={`h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                                txStatusFilter === status
                                  ? "bg-white text-emerald-800 shadow-sm border border-slate-150/50"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scrollable Table */}
                      <div className="rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <div className="max-h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 border-b border-slate-150 text-[10px] uppercase tracking-wider text-slate-500 font-bold z-10">
                                <tr>
                                  <th className="p-4">Voter Profile</th>
                                  <th className="p-4">Nominee Details</th>
                                  <th className="p-4 text-center">Votes</th>
                                  <th className="p-4">Amount Paid</th>
                                  <th className="p-4">Reference Keys</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Date & Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 text-xs bg-white">
                                {filteredTransactions.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-400 italic bg-slate-50/20">
                                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                                        <CreditCard className="h-8 w-8 text-slate-300" />
                                        <span>No transaction logs match the selected search or filters.</span>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  filteredTransactions.map((tx: any) => {
                                    const createdDate = new Date(tx.created_at || tx.paid_at);
                                    const formattedDate = createdDate.toLocaleDateString("en-NG", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    });
                                    const formattedTime = createdDate.toLocaleTimeString("en-NG", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });

                                    return (
                                      <tr key={tx.id} className="hover:bg-slate-50/50 transition duration-150">
                                        {/* Voter Column */}
                                        <td className="p-4">
                                          <p className="font-bold text-[#062018]">{tx.voter_name || "Anonymous Voter"}</p>
                                          <p className="text-[10px] text-slate-400 select-all">{tx.voter_email || "no-email@nasslasustech.org.ng"}</p>
                                        </td>
                                        
                                        {/* Target Nominee Column */}
                                        <td className="p-4">
                                          {tx.nominee_name ? (
                                            <>
                                              <p className="font-semibold text-slate-800">{tx.nominee_name}</p>
                                              <p className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-0.5 font-medium">{tx.category_name || "Category"}</p>
                                            </>
                                          ) : (
                                            <p className="text-slate-400 italic">Unknown Nominee (ID: {tx.nominee_id})</p>
                                          )}
                                        </td>

                                        {/* Votes Column */}
                                        <td className="p-4 text-center">
                                          <span className="inline-flex h-6 w-8 items-center justify-center rounded-lg bg-slate-100 font-mono font-bold text-slate-800 border border-slate-200">
                                            {tx.votes || 0}
                                          </span>
                                        </td>

                                        {/* Amount Column */}
                                        <td className="p-4">
                                          <span className="font-mono font-bold text-emerald-800">
                                            {formatCurrency(Number(tx.amount || 0))}
                                          </span>
                                        </td>

                                        {/* Reference Keys Column */}
                                        <td className="p-4">
                                          <p className="font-mono text-[9px] text-slate-500 font-medium select-all">Ref: {tx.reference || "N/A"}</p>
                                          {tx.provider_reference && (
                                            <p className="font-mono text-[8px] text-slate-400 mt-0.5 select-all">Prov: {tx.provider_reference}</p>
                                          )}
                                        </td>

                                        {/* Status Column */}
                                        <td className="p-4">
                                          {tx.status === "confirmed" && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-250 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                              <Check className="h-3 w-3" />
                                              Confirmed
                                            </span>
                                          )}
                                          {tx.status === "pending" && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-[#1a4480] border border-blue-200 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                              <Clock className="h-3 w-3" />
                                              Pending
                                            </span>
                                          )}
                                          {tx.status === "failed" && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-755 border border-red-250 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                              <X className="h-3 w-3" />
                                              Failed
                                            </span>
                                          )}
                                        </td>

                                        {/* Date Column */}
                                        <td className="p-4 text-right">
                                          <p className="font-medium text-slate-700">{formattedDate}</p>
                                          <p className="text-[10px] text-slate-400 mt-0.5">{formattedTime}</p>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}


            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold">Operational Feed</h3>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Messages</p>
                  <div className="space-y-3">
                    {messages.slice(0, 4).map((msg: any) => (
                      <div key={msg.id} className="rounded-2xl bg-[#f7fbf6] p-4">
                        <p className="font-semibold">{msg.full_name || "Message"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{msg.email}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Payments</p>
                  <div className="space-y-3">
                    {payments.slice(0, 4).map((pay: any, index: number) => (
                      <div key={index} className="rounded-2xl bg-[#f7fbf6] p-4">
                        <p className="font-semibold">{pay.full_name || pay.name || pay.matric_number || "Payment"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{pay.payment_type || "General payment"}</p>
                        <p className="mt-2 text-sm text-primary">{formatCurrency(Number(pay.amount || 0) / (Number(pay.amount || 0) > 10000 ? 100 : 1))}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default AdminPortal;
