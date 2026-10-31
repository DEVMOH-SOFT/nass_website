import { supabase, isSupabaseConfigured } from "./supabase";

export interface StudentRecord {
  id?: string;
  matric_number: string;
  full_name: string;
  department: string;
  level: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
  gender?: string | null;
  birthday?: string | null;
  dues_status: string; // 'Paid' | 'Unpaid'
  dues_paid_at?: string | null;
  dues_amount?: number | null;
  amount?: number | null;
  id_card_status: string; // 'Not Requested' | 'Pending' | 'Issued'
  id_card_issued_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const COLLEGE_DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Cyber Security",
  "Industrial Mathematics",
  "Statistics",
  "Mathematical Sciences",
  "Physics with Electronics",
  "Chemistry",
  "Biochemistry",
  "Microbiology",
  "Botany",
  "Zoology",
  "Chemical Sciences",
  "Biological Sciences",
] as const;

export const ACADEMIC_LEVELS = ["100L", "200L", "300L", "400L"] as const;

/**
 * Normalizes matric numbers (e.g. removes irregular spaces, cleans up uppercase)
 */
export const normalizeMatric = (matric: string): string => {
  return matric.trim().toUpperCase();
};

/**
 * Validates surname against student's full name (default collegiate password rule)
 */
const checkSurnamePassword = (fullName: string, password: string): boolean => {
  if (!password) return false;
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  const cleanPass = password.trim().toLowerCase();
  // Accepts if password matches any part of their name or is collegiate default
  return parts.some(part => part === cleanPass) || cleanPass === "lasustech" || cleanPass === "nass2026";
};

/**
 * Authenticates a student against Supabase
 * Accepts either Matriculation Number (for Staylites) OR Email address (for Freshers)
 */
export const loginStudent = async (identifier: string, password?: string) => {
  const cleanId = (identifier || "").trim();
  if (!cleanId) {
    throw new Error("Matriculation number or email is required.");
  }

  const isEmail = cleanId.includes("@");
  const cleanEmail = cleanId.toLowerCase();
  const cleanMatric = normalizeMatric(cleanId);

  // If Supabase is configured, check live database
  if (isSupabaseConfigured) {
    let student: StudentRecord | null = null;

    if (isEmail) {
      // Lookup by email (Primary for Freshers who don't have matric numbers yet)
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (!error && data) {
        student = data as StudentRecord;
      }
    } else {
      // Lookup by matric number
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .ilike("matric_number", cleanMatric)
        .maybeSingle();

      if (!error && data) {
        student = data as StudentRecord;
      } else {
        // Fallback: check if identifier matches email
        const { data: byEmail } = await supabase
          .from("students")
          .select("*")
          .ilike("email", cleanId)
          .maybeSingle();
        if (byEmail) student = byEmail as StudentRecord;
      }
    }

    // Secondary fallback: check local storage verified payments / local student registry
    if (!student) {
      try {
        const verifiedList = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
        const found = verifiedList.find((p: any) => 
          (p.email && p.email.toLowerCase() === cleanEmail) ||
          (p.matric_number && normalizeMatric(p.matric_number) === cleanMatric)
        );
        if (found) {
          const resolvedAmt = (found.amount === 2000 || found.amount === 2500) ? found.amount : (found.dues_amount || 2500);
          student = {
            matric_number: found.matric_number || cleanMatric,
            full_name: (found.student_name || "Science Scholar").trim().toUpperCase(),
            department: found.department || "Basic Sciences",
            level: found.level || (isEmail ? "100L" : "200L"),
            email: found.email || cleanEmail,
            dues_status: "Paid",
            dues_amount: resolvedAmt,
            amount: resolvedAmt,
            id_card_status: "Issued",
          };
        }
      } catch (e) {}
    }

    if (!student) {
      return {
        success: false,
        notFound: true,
        message: isEmail
          ? `Email address "${cleanEmail}" was not found in collegiate records. Please complete registration first.`
          : `Matriculation number "${cleanMatric}" was not found in collegiate records. Please register.`,
      };
    }

    if (student.full_name) {
      student.full_name = student.full_name.trim().toUpperCase();
    }

    // Optional password verification: matches surname or default
    if (password && !checkSurnamePassword(student.full_name, password)) {
      return {
        success: false,
        invalidPassword: true,
        message: "Incorrect password. Default password is your surname in lowercase.",
      };
    }

    // Store user session
    saveStudentSession(student);
    return { success: true, student };
  }

  // Local fallback (when offline or developing without database)
  const mockStudent: StudentRecord = {
    matric_number: isEmail ? `FSH26-${Date.now().toString().slice(-6)}` : cleanMatric,
    full_name: "SCIENCE SCHOLAR",
    department: "Computer Science",
    level: isEmail ? "100L" : "300L",
    email: isEmail ? cleanEmail : "student@science.lasustech.edu.ng",
    phone: "08000000000",
    dues_status: "Paid",
    id_card_status: "Issued",
  };
  saveStudentSession(mockStudent);
  return { success: true, student: mockStudent };
};

/**
 * Registers a new science student into the Supabase NASS register
 */
export const registerStudent = async (params: {
  matricNumber?: string;
  fullName: string;
  department: string;
  level: string;
  email?: string;
  phone?: string;
  isFresher?: boolean;
}) => {
  let cleanMatric = params.matricNumber ? normalizeMatric(params.matricNumber) : "";
  const cleanName = params.fullName.trim().toUpperCase(); // Capital letter requirement
  const cleanEmail = params.email?.trim().toLowerCase() || null;

  // If Fresher (no matric yet), generate provisional fresher ID
  if (params.isFresher && !cleanMatric) {
    cleanMatric = `FSH26-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
  }

  if (!cleanMatric) {
    throw new Error("Matriculation number is required for Staylites (returning students).");
  }

  if (!cleanName || !params.department || !params.level) {
    throw new Error("Full name, department, and level are required.");
  }

  // 1. Strict Duplicate Check in Local Storage
  try {
    const verifiedList = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
    if (Array.isArray(verifiedList)) {
      if (!params.isFresher && cleanMatric) {
        const matchMatric = verifiedList.find((p: any) => p.matric_number && normalizeMatric(p.matric_number) === cleanMatric);
        if (matchMatric) {
          throw new Error(`The Matriculation Number "${cleanMatric}" is already registered in collegiate records. You cannot reuse an existing matric number. Please log in instead.`);
        }
      }
      if (cleanEmail) {
        const matchEmail = verifiedList.find((p: any) => p.email && p.email.toLowerCase() === cleanEmail);
        if (matchEmail) {
          throw new Error(`The Gmail address "${cleanEmail}" is already linked to an existing collegiate record. You cannot reuse an existing Gmail address. Please log in instead.`);
        }
      }
    }
  } catch (e: any) {
    if (e.message?.includes("already registered") || e.message?.includes("already linked")) {
      throw e;
    }
  }

  const newRecord: Partial<StudentRecord> = {
    matric_number: cleanMatric,
    full_name: cleanName,
    department: params.department,
    level: params.level,
    email: cleanEmail,
    phone: params.phone?.trim() || null,
    dues_status: "Unpaid",
    id_card_status: "Not Requested",
  };

  if (isSupabaseConfigured) {
    // 2. Strict Duplicate Check in Supabase - Cannot reuse existing Matric
    if (!params.isFresher && cleanMatric) {
      const { data: existingMatric } = await supabase
        .from("students")
        .select("matric_number, full_name")
        .ilike("matric_number", cleanMatric)
        .maybeSingle();

      if (existingMatric) {
        throw new Error(
          `The Matriculation Number "${cleanMatric}" is already registered in collegiate records (${existingMatric.full_name}). You cannot reuse an existing matriculation number. Please log in instead.`
        );
      }
    }

    // 3. Strict Duplicate Check in Supabase - Cannot reuse existing Gmail / Email
    if (cleanEmail) {
      const { data: existingEmail } = await supabase
        .from("students")
        .select("matric_number, full_name, email")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        throw new Error(
          `The Gmail address "${cleanEmail}" is already registered to an existing student account (${existingEmail.full_name} - ${existingEmail.matric_number}). You cannot reuse an existing Gmail address. Please log in instead.`
        );
      }
    }

    // 4. Insert into Supabase
    const { data: inserted, error } = await supabase
      .from("students")
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error("Student registration insert error:", error);
      // Check for uniqueness constraint error from database
      if (error.code === "23505" || error.message?.toLowerCase().includes("unique")) {
        throw new Error("This matriculation number or email is already registered in collegiate records. Please log in instead.");
      }
      saveStudentSession(newRecord as StudentRecord);
      return { success: true, student: newRecord as StudentRecord };
    }

    saveStudentSession(inserted);
    return { success: true, student: inserted };
  }

  // Fallback
  saveStudentSession(newRecord as StudentRecord);
  return { success: true, student: newRecord as StudentRecord };
};

/**
 * Fetches the live student profile from Supabase
 */
export const fetchStudentProfile = async (
  matricNumber: string,
  email?: string | null
): Promise<StudentRecord | null> => {
  const cleanMatric = normalizeMatric(matricNumber || "");
  const cleanEmail = (email || "").trim().toLowerCase();
  if ((!cleanMatric && !cleanEmail) || !isSupabaseConfigured) return null;

  if (cleanMatric) {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("matric_number", cleanMatric)
      .maybeSingle();

    if (!error && data) {
      const student = data as StudentRecord;
      if (student.full_name) student.full_name = student.full_name.trim().toUpperCase();
      return student;
    }
  }

  if (cleanEmail) {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (!error && data) {
      const student = data as StudentRecord;
      if (student.full_name) student.full_name = student.full_name.trim().toUpperCase();
      return student;
    }
  }

  return null;
};

/**
 * Updates editable fields on a student profile in Supabase
 */
export const updateStudentProfile = async (
  matricNumber: string,
  updates: Partial<StudentRecord>
): Promise<StudentRecord | null> => {
  const cleanMatric = normalizeMatric(matricNumber);
  if (!cleanMatric || !isSupabaseConfigured) return null;

  const payload: Partial<StudentRecord> = { ...updates };

  // Always ensure name is in CAPITAL LETTERS
  if (payload.full_name) {
    payload.full_name = payload.full_name.trim().toUpperCase();
  }

  // Prevent reusing already existing email when updating
  if (payload.email) {
    const cleanEmail = payload.email.trim().toLowerCase();
    const { data: existingEmail } = await supabase
      .from("students")
      .select("matric_number, full_name")
      .ilike("email", cleanEmail)
      .neq("matric_number", cleanMatric)
      .maybeSingle();

    if (existingEmail) {
      throw new Error(`The Gmail address "${cleanEmail}" is already in use by another student (${existingEmail.full_name}).`);
    }
    payload.email = cleanEmail;
  }

  // Prevent reusing already existing matric number when updating
  if (payload.matric_number) {
    const cleanNewMatric = normalizeMatric(payload.matric_number);
    const { data: existingMatric } = await supabase
      .from("students")
      .select("matric_number, full_name")
      .ilike("matric_number", cleanNewMatric)
      .neq("matric_number", cleanMatric)
      .maybeSingle();

    if (existingMatric) {
      throw new Error(`The Matriculation Number "${cleanNewMatric}" is already assigned to another student in collegiate records.`);
    }
    payload.matric_number = cleanNewMatric;
  }

  const { data, error } = await supabase
    .from("students")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .ilike("matric_number", cleanMatric)
    .select()
    .single();

  if (error) {
    console.error("Student profile update error:", error);
    throw new Error(error.message || "Failed to update profile.");
  }

  if (data) {
    const student = data as StudentRecord;
    if (student.full_name) student.full_name = student.full_name.trim().toUpperCase();
    saveStudentSession(student);
  }
  return data as StudentRecord;
};

/**
 * Timestamp when collegiate dues was updated from 2000 to 2500:
 * Mon Oct 26 21:49:17 2026 +01:00 (1793047757000 ms)
 */
export const DUES_PRICE_UPDATE_TIMESTAMP = new Date("2026-10-26T20:49:17.000Z").getTime();

/**
 * Resolves whether a student paid 2000 or 2500 for collegiate dues.
 * For students who already paid 2000, it reflects 2000.
 * For students who paid 2500, it reflects 2500.
 * For unpaid students or new sessions, the current dues rate is 2500.
 */
export const resolveStudentDuesPaidAmount = (
  matric?: string | null,
  email?: string | null,
  fallbackRecord?: any
): number => {
  const cleanMatric = matric ? normalizeMatric(matric) : "";
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  // 1. Direct explicit amount or dues_amount on fallback record
  if (fallbackRecord) {
    if (typeof fallbackRecord.dues_amount === "number" && (fallbackRecord.dues_amount === 2000 || fallbackRecord.dues_amount === 2500)) {
      return fallbackRecord.dues_amount;
    }
    if (typeof fallbackRecord.amount === "number") {
      const amt = fallbackRecord.amount > 10000 ? fallbackRecord.amount / 100 : fallbackRecord.amount;
      if (amt === 2000 || amt === 2500) {
        return amt;
      }
    }
  }

  // 2. Specific dues amount saved in localStorage
  if (cleanMatric) {
    try {
      const storedAmt = localStorage.getItem(`nass_dues_amount_${cleanMatric}`);
      if (storedAmt) {
        const parsed = Number(storedAmt);
        if (parsed === 2000 || parsed === 2500) return parsed;
      }
    } catch {}
  }

  // 3. Search verified payments ledger in localStorage
  try {
    const listStr = localStorage.getItem("nass_verified_payments");
    if (listStr) {
      const list = JSON.parse(listStr);
      if (Array.isArray(list)) {
        const found = list.find((p: any) => {
          const isDues = String(p.payment_type || "").toLowerCase().includes("due");
          const isPaid = String(p.status || "").toLowerCase() === "paid" || String(p.status || "").toLowerCase() === "success";
          const matchMatric = cleanMatric && (normalizeMatric(p.matric_number || "") === cleanMatric || String(p.reference || "").includes(cleanMatric));
          const matchEmail = cleanEmail && p.email && p.email.toLowerCase() === cleanEmail;
          return isDues && isPaid && (matchMatric || matchEmail);
        });
        if (found && typeof found.amount === "number") {
          const amt = found.amount > 10000 ? found.amount / 100 : found.amount;
          if (amt === 2000 || amt === 2500) return amt;
        }
      }
    }
  } catch {}

  // 4. Check active 'user' session in localStorage
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      const isSameUser =
        (cleanMatric && normalizeMatric(u.matric_no || u.matric_number || "") === cleanMatric) ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail);
      if (isSameUser) {
        if (u.dues_amount === 2000 || u.dues_amount === 2500) return u.dues_amount;
        if (u.amount === 2000 || u.amount === 2500) return u.amount;
      }
    }
  } catch {}

  // 5. Check payment timestamp: payments made before Oct 26, 2026 price update are 2000
  const dateStr = fallbackRecord?.dues_paid_at || fallbackRecord?.paid_at || fallbackRecord?.created_at;
  if (dateStr) {
    const t = new Date(dateStr).getTime();
    if (!isNaN(t) && t < DUES_PRICE_UPDATE_TIMESTAMP) {
      return 2000;
    }
  }

  return 2500;
};

/**
 * Helper to sync session into localStorage for Navbar & global state
 */
export const saveStudentSession = (student: StudentRecord) => {
  const cleanName = student.full_name ? student.full_name.trim().toUpperCase() : "";
  const isPaid = String(student.dues_status || "").toLowerCase() === "paid";
  const resolvedAmount = isPaid
    ? resolveStudentDuesPaidAmount(student.matric_number, student.email, student)
    : 2500;

  localStorage.removeItem("dashboard_data");
  localStorage.removeItem("token");
  try {
    sessionStorage.removeItem("nass_whatsapp_popup_dismissed");
    sessionStorage.removeItem("nass_whatsapp_banner_dismissed");
  } catch (e) {}
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("student_matric", student.matric_number);
  if (isPaid) {
    localStorage.setItem(`nass_dues_${student.matric_number}`, "Paid");
    localStorage.setItem(`nass_dues_amount_${student.matric_number}`, String(resolvedAmount));
  }
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: student.id || student.matric_number,
      full_name: cleanName,
      name: cleanName,
      matric_no: student.matric_number,
      department: student.department,
      level: student.level,
      email: student.email || "",
      phone: student.phone || "",
      dues_status: student.dues_status || "Unpaid",
      dues_amount: resolvedAmount,
      id_card_status: student.id_card_status || "Not Requested",
      role: "student",
      post: student.department ? `${student.department} Scholar` : "Science Student",
      image_url: student.avatar_url || null,
    })
  );
  window.dispatchEvent(new Event("storage"));
};

/**
 * Logs out student and cleans storage
 */
export const logoutStudent = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("student_matric");
  localStorage.removeItem("dashboard_data");
  localStorage.removeItem("dashboard_active_tab");
  try {
    sessionStorage.removeItem("nass_whatsapp_popup_dismissed");
    sessionStorage.removeItem("nass_whatsapp_banner_dismissed");
  } catch (e) {}
};

/**
 * Marks student dues as paid in localStorage and Supabase
 */
export const markDuesPaid = async (params: {
  matricNumber: string;
  reference: string;
  fullName?: string;
  email?: string;
  department?: string;
  level?: string;
  amount?: number;
}) => {
  const cleanMatric = normalizeMatric(params.matricNumber);
  const duesAmount = params.amount || 2500;
  const cleanFullName = (params.fullName || "SCIENCE SCHOLAR").trim().toUpperCase();
  const cleanEmail = params.email?.trim().toLowerCase() || "";

  // 1. Purge stale cache & set active matric
  localStorage.removeItem("dashboard_data");
  localStorage.removeItem("token");
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("student_matric", cleanMatric);
  localStorage.setItem(`nass_dues_${cleanMatric}`, "Paid");
  localStorage.setItem(`nass_dues_amount_${cleanMatric}`, String(duesAmount));

  // 2. Add confirmed payment record to verified list
  try {
    const list = JSON.parse(localStorage.getItem("nass_verified_payments") || "[]");
    const newRecord = {
      id: `pay-dues-${cleanMatric}-${Date.now()}`,
      reference: params.reference,
      student_name: cleanFullName,
      matric_number: cleanMatric,
      email: cleanEmail,
      department: params.department || "Basic Sciences",
      level: params.level || "100L",
      payment_type: "2025/2026 Session Dues",
      amount: duesAmount,
      channel: "Korapay Online",
      status: "Paid",
      created_at: new Date().toISOString(),
    };
    const updated = [newRecord, ...list.filter((p: any) => p.reference !== params.reference)];
    localStorage.setItem("nass_verified_payments", JSON.stringify(updated));
  } catch (e) {
    console.error("Storage update error:", e);
  }

  // 3. Update active user session in localStorage to this exact student
  try {
    const userStr = localStorage.getItem("user");
    let u: any = userStr ? JSON.parse(userStr) : {};
    if (!u.matric_no || u.matric_no !== cleanMatric) {
      u = {
        id: cleanMatric,
        full_name: cleanFullName,
        name: cleanFullName,
        matric_no: cleanMatric,
        department: params.department || "Basic Sciences",
        level: params.level || "100L",
        email: cleanEmail,
        phone: "",
        role: "student",
        post: params.department ? `${params.department} Scholar` : "Science Student",
      };
    } else {
      u.full_name = cleanFullName;
      u.name = cleanFullName;
      if (params.department) u.department = params.department;
      if (params.level) u.level = params.level;
      if (cleanEmail) u.email = cleanEmail;
    }
    u.dues_status = "Paid";
    u.dues_amount = duesAmount;
    u.id_card_status = "Ready";
    localStorage.setItem("user", JSON.stringify(u));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {}

  // 4. Update Supabase record (match by matric_number, fallback to email, fallback to insert).
  if (!isSupabaseConfigured || (!cleanMatric && !cleanEmail)) return false;

  const paidAt = new Date().toISOString();
  const attempts = [
    { dues_status: "Paid", dues_paid_at: paidAt, dues_amount: duesAmount, id_card_status: "Ready" },
    { dues_status: "Paid", dues_paid_at: paidAt },
  ];

  // 4a. Try updating by matric_number
  if (cleanMatric) {
    for (const changes of attempts) {
      const { data, error } = await supabase
        .from("students")
        .update(changes)
        .ilike("matric_number", cleanMatric)
        .select("matric_number");

      if (!error && data && data.length > 0) return true;
    }
  }

  // 4b. Fallback: try updating by email (critical for freshers or students whose provisional ID shifted)
  if (cleanEmail) {
    for (const changes of attempts) {
      const { data, error } = await supabase
        .from("students")
        .update(changes)
        .ilike("email", cleanEmail)
        .select("matric_number");

      if (!error && data && data.length > 0) return true;
    }
  }

  // 4c. Final fallback: if the student record wasn't in Supabase yet, insert it as Paid
  if (cleanMatric) {
    const { error: insertErr } = await supabase.from("students").insert({
      matric_number: cleanMatric,
      full_name: cleanFullName,
      department: params.department || "Basic Sciences",
      level: params.level || (cleanMatric.startsWith("FSH") ? "100L" : "200L"),
      email: cleanEmail || null,
      dues_status: "Paid",
      dues_paid_at: paidAt,
      dues_amount: duesAmount,
      id_card_status: "Ready",
    });
    if (!insertErr) return true;
    console.error("Supabase dues fallback insert failed:", insertErr.message);
  }

  return false;
};

