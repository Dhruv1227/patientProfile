const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createSupabasePortalStore } = require("./storage/supabasePortalStore");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env"));

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "carebridge-local-development-secret";
const DATA_FILE = path.resolve(process.cwd(), process.env.DATA_FILE || path.join("backend", "data", "portal-state.json"));
const STATE_VERSION = 1;
const portalStore = createSupabasePortalStore();

app.use(cors());
app.use(express.json());

const users = [
  {
    id: "u1",
    name: "Maya Patel",
    email: "maya@care.test",
    passwordHash: bcrypt.hashSync("portal123", 10),
    role: "Patient",
    dob: "May 14, 1998",
    mrn: "MRN-284193",
    plan: "Lakehead Student Health Plan",
    careTeam: "Dr. Lena Chen",
    avatar: "MP"
  },
  {
    id: "u2",
    name: "Dr. Lena Chen",
    email: "dr.chen@care.test",
    passwordHash: bcrypt.hashSync("portal123", 10),
    role: "Provider",
    dob: "Internal Medicine",
    mrn: "Provider ID: LC-042",
    plan: "Clinical workspace",
    careTeam: "42 active patients",
    avatar: "LC"
  },
  {
    id: "u3",
    name: "Care Admin",
    email: "admin@care.test",
    passwordHash: bcrypt.hashSync("portal123", 10),
    role: "Admin",
    dob: "Operations",
    mrn: "Admin ID: OPS-007",
    plan: "Compliance workspace",
    careTeam: "Access controls",
    avatar: "CA"
  }
];

let appointments = [
  { id: "a1", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", departmentName: "Primary Care", doctorId: "d1001", doctorName: "Dr. Lena Chen", assignment: "Selected by patient", title: "Video follow-up", detail: "Medication review with Dr. Lena Chen", date: "May 18, 2026, 9:30 AM", location: "Virtual visit", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a2", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-cardiology", departmentName: "Cardiology", doctorId: "d2001", doctorName: "Dr. Marcus Reed", assignment: "Referral routing", title: "Cardiology consult", detail: "Referral appointment for preventive screening", date: "Jun 4, 2026, 2:00 PM", location: "North Clinic, Suite 204", tag: "In person", status: "Approved", hidden: false },
  { id: "a3", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", departmentName: "Primary Care", doctorId: "d1001", doctorName: "Dr. Lena Chen", assignment: "Care team reminder", title: "Vaccination reminder", detail: "Flu booster eligibility opens this fall", date: "Sep 12, 2026", location: "Student health center", tag: "Reminder", status: "Scheduled", hidden: false },
  { id: "a4", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", departmentName: "Primary Care", doctorId: "d1002", doctorName: "Dr. Victor Sloan", assignment: "Auto-assigned by schedule", title: "Nutrition counselling", detail: "Review meal planning for cholesterol management.", date: "Jun 14, 2026, 11:15 AM", location: "Wellness Clinic, Room 118", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a5", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-dermatology", departmentName: "Dermatology", doctorId: "d4001", doctorName: "Dr. Naomi Brooks", assignment: "Referral routing", title: "Dermatology referral", detail: "Skin irritation follow-up after primary care visit.", date: "Jul 2, 2026, 3:45 PM", location: "Specialty Care Centre", tag: "Referral", status: "Pending", hidden: false },
  { id: "a6", patientId: "p3001", patientName: "Mia Anderson", departmentId: "dept-pediatrics", departmentName: "Pediatrics", doctorId: "d3001", doctorName: "Dr. Priya Shah", assignment: "Selected by patient", title: "Pediatric vaccination visit", detail: "Vaccination visit and growth chart review.", date: "May 21, 2026, 10:00 AM", location: "Family Wing, Floor 2", tag: "Requested", status: "Pending", hidden: false }
];

let messages = [
  { id: "m1", title: "Dr. Chen", detail: "Your lab values look stable. Keep your current plan and book a follow-up if symptoms change.", date: "2h ago", tag: "Unread", hidden: false },
  { id: "m2", title: "Billing team", detail: "Your insurance claim was processed successfully.", date: "Yesterday", tag: "Billing", hidden: false },
  { id: "m3", title: "Care coordinator", detail: "I uploaded your referral notes to the portal for the cardiology visit.", date: "May 8", tag: "Care", hidden: false },
  { id: "m4", title: "Pharmacy", detail: "Your refill request for cetirizine is ready for pickup.", date: "May 7", tag: "Pharmacy", hidden: false },
  { id: "m5", title: "Lab services", detail: "Fasting is required for your next lipid panel. Water is allowed.", date: "May 5", tag: "Lab", hidden: false }
];

let notifications = [
  { id: "n1", audience: "Patient", title: "Welcome back", detail: "Your CareBridge portal is ready.", date: "Today", tag: "Info", hidden: false },
  { id: "n2", audience: "Provider", doctorId: "d3001", title: "Pending appointment request", detail: "Mia Anderson has 1 pediatric appointment request waiting for review.", date: "Today", tag: "Request", hidden: false }
];

let patientProfile = {
  patientId: "u1",
  patientName: "Maya Patel",
  summary: "Stable health profile. Seasonal allergies active. Preventive care plan reviewed.",
  riskLevel: "Low",
  lastUpdatedBy: "Dr. Lena Chen",
  updatedAt: "Apr 18, 2026",
  hidden: false
};

let patientProfiles = {};
let patientRecords = [];
let transfers = [];
let adminApprovalRequests = [
  {
    id: "admin-request-1",
    name: "Jordan Lee",
    email: "jordan.admin@care.test",
    passwordHash: bcrypt.hashSync("portal123", 10),
    status: "Requested",
    requestedAt: "Today",
    verificationNote: "Verify school or clinic authorization before granting admin access."
  }
];

let auditLogs = [
  {
    id: "log1",
    actor: "System",
    role: "System",
    action: "Portal started",
    detail: "CareBridge portal initialized.",
    date: "Today",
    severity: "Info"
  }
];

let persistenceReady = false;
let saveTimer = null;
let passwordResetRequests = [];
const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000;

function serializableState() {
  return {
    version: STATE_VERSION,
    savedAt: new Date().toISOString(),
    users,
    appointments,
    messages,
    notifications,
    patientProfile,
    patientProfiles,
    patientRecords,
    transfers,
    adminApprovalRequests,
    auditLogs,
    departments,
    doctorSchedules
  };
}

async function saveStateNow() {
  if (!persistenceReady) return;

  try {
    if (portalStore) {
      await portalStore.save(serializableState());
      return;
    }

    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(serializableState(), null, 2));
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.warn(`Unable to persist portal state: ${error.message}`);
  }
}

function queueSave() {
  if (!persistenceReady) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveStateNow();
  }, 50);
}

function createPasswordResetCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function pruneExpiredPasswordResetRequests() {
  const now = Date.now();
  passwordResetRequests = passwordResetRequests.filter((request) => request.expiresAt > now && request.attempts < 5);
}

function addAuditLog(user, action, detail, severity = "Info") {
  const actor = user ? user.name : "System";
  const role = user ? user.role : "System";
  auditLogs = [
    {
      id: `log${Date.now()}`,
      actor,
      role,
      action,
      detail,
      date: new Date().toLocaleString(),
      severity
    },
    ...auditLogs
  ].slice(0, 100);
  queueSave();
}

const records = [
  { type: "Visit", title: "Annual physical", detail: "No new concerns. Continue exercise plan and allergy medication as needed.", date: "Apr 18, 2026", provider: "Dr. Lena Chen", tag: "Completed" },
  { type: "Lab", title: "Comprehensive metabolic panel", detail: "A1C 5.4%, LDL 92 mg/dL, vitamin D normal, kidney function normal.", date: "Mar 27, 2026", provider: "North Clinic Lab", tag: "Reviewed" },
  { type: "Medication", title: "Cetirizine 10mg", detail: "Take one tablet as needed for seasonal allergies.", date: "Active", provider: "Pharmacy", tag: "Active" },
  { type: "Allergy", title: "Penicillin allergy", detail: "Reaction documented. Alert visible to care team before prescribing.", date: "Verified", provider: "CareBridge", tag: "Alert" },
  { type: "Imaging", title: "Chest X-ray", detail: "No acute cardiopulmonary abnormality detected.", date: "Feb 12, 2026", provider: "North Imaging", tag: "Reviewed" },
  { type: "Immunization", title: "COVID-19 booster", detail: "Updated booster recorded in immunization history.", date: "Jan 24, 2026", provider: "Student Health Centre", tag: "Completed" },
  { type: "Care plan", title: "Preventive care plan", detail: "Exercise 150 minutes weekly, repeat lipid panel in 6 months, continue allergy plan.", date: "Apr 18, 2026", provider: "Dr. Lena Chen", tag: "Plan" }
];

const resources = [
  { title: "Medication safety", detail: "How to read labels and avoid interactions.", date: "Guide", tag: "Education" },
  { title: "Privacy settings", detail: "Manage who can see appointments and lab results.", date: "Security", tag: "Settings" },
  { title: "Find a provider", detail: "Search primary care, cardiology, pediatrics, and urgent care.", date: "Directory", tag: "Providers" },
  { title: "Preparing for video visits", detail: "Checklist for camera, ID, insurance card, and current medications.", date: "Guide", tag: "Education" },
  { title: "Insurance and claims", detail: "Understand deductibles, claim status, and billing contacts.", date: "Support", tag: "Billing" }
];

const adminItems = [
  { title: "Role access review", detail: "3 staff accounts need quarterly approval.", date: "Today", tag: "Admin" },
  { title: "Audit export", detail: "Security logs are ready for compliance review.", date: "Ready", tag: "Audit" },
  { title: "Consent requests", detail: "2 releases of information are pending.", date: "Pending", tag: "Consent" },
  { title: "Failed login review", detail: "5 failed attempts were blocked by account protection.", date: "Today", tag: "Security" },
  { title: "Provider onboarding", detail: "1 provider account is waiting for supervisor approval.", date: "Tomorrow", tag: "Admin" }
];

const vitals = [
  { label: "Blood pressure", value: "118/76", trend: "Normal", tone: "green" },
  { label: "Heart rate", value: "72 bpm", trend: "Stable", tone: "teal" },
  { label: "A1C", value: "5.4%", trend: "In range", tone: "blue" },
  { label: "LDL", value: "92", trend: "Improved", tone: "indigo" }
];

let departments = [
  {
    id: "dept-primary",
    name: "Primary Care",
    lead: "Dr. Lena Chen",
    location: "Main Clinic, Floor 1",
    patients: [
      { id: "p1001", name: "Maya Patel", age: 27, status: "Active", nextVisit: "May 18, 2026", concern: "Medication review" },
      { id: "p1002", name: "Noah Williams", age: 34, status: "Follow-up", nextVisit: "May 20, 2026", concern: "Blood pressure check" },
      { id: "p1003", name: "Ava Thompson", age: 22, status: "Active", nextVisit: "May 23, 2026", concern: "Annual physical" },
      { id: "p1004", name: "Liam Brown", age: 41, status: "Pending labs", nextVisit: "May 27, 2026", concern: "Fatigue assessment" },
      { id: "p1005", name: "Sophia Wilson", age: 30, status: "Active", nextVisit: "Jun 1, 2026", concern: "Allergy care plan" }
    ]
  },
  {
    id: "dept-cardiology",
    name: "Cardiology",
    lead: "Dr. Marcus Reed",
    location: "Specialty Centre, Suite 204",
    patients: [
      { id: "p2001", name: "Ethan Martin", age: 56, status: "High priority", nextVisit: "May 19, 2026", concern: "Chest pain follow-up" },
      { id: "p2002", name: "Olivia Davis", age: 48, status: "Active", nextVisit: "May 26, 2026", concern: "ECG review" },
      { id: "p2003", name: "Benjamin Lee", age: 63, status: "Medication review", nextVisit: "Jun 3, 2026", concern: "Hypertension" },
      { id: "p2004", name: "Isabella Moore", age: 52, status: "Pending imaging", nextVisit: "Jun 9, 2026", concern: "Echo results" },
      { id: "p2005", name: "Lucas Taylor", age: 45, status: "Stable", nextVisit: "Jun 13, 2026", concern: "Cholesterol plan" }
    ]
  },
  {
    id: "dept-pediatrics",
    name: "Pediatrics",
    lead: "Dr. Priya Shah",
    location: "Family Wing, Floor 2",
    patients: [
      { id: "p3001", name: "Mia Anderson", age: 8, status: "Active", nextVisit: "May 21, 2026", concern: "Vaccination visit" },
      { id: "p3002", name: "Jackson Clark", age: 12, status: "Follow-up", nextVisit: "May 29, 2026", concern: "Asthma check" },
      { id: "p3003", name: "Amelia Lewis", age: 5, status: "Active", nextVisit: "Jun 2, 2026", concern: "Well-child exam" },
      { id: "p3004", name: "Henry Walker", age: 10, status: "Pending form", nextVisit: "Jun 8, 2026", concern: "School health form" },
      { id: "p3005", name: "Charlotte Hall", age: 15, status: "Active", nextVisit: "Jun 16, 2026", concern: "Sports physical" }
    ]
  },
  {
    id: "dept-dermatology",
    name: "Dermatology",
    lead: "Dr. Naomi Brooks",
    location: "Specialty Centre, Suite 310",
    patients: [
      { id: "p4001", name: "James Young", age: 39, status: "Referral", nextVisit: "May 22, 2026", concern: "Rash assessment" },
      { id: "p4002", name: "Harper King", age: 28, status: "Active", nextVisit: "May 30, 2026", concern: "Acne treatment" },
      { id: "p4003", name: "Daniel Wright", age: 61, status: "High priority", nextVisit: "Jun 5, 2026", concern: "Mole review" },
      { id: "p4004", name: "Ella Scott", age: 33, status: "Follow-up", nextVisit: "Jun 12, 2026", concern: "Eczema plan" },
      { id: "p4005", name: "Logan Green", age: 47, status: "Active", nextVisit: "Jun 18, 2026", concern: "Psoriasis management" }
    ]
  },
  {
    id: "dept-mental-health",
    name: "Mental Health",
    lead: "Dr. Aaron White",
    location: "Wellness Clinic, Floor 3",
    patients: [
      { id: "p5001", name: "Grace Adams", age: 24, status: "Active", nextVisit: "May 24, 2026", concern: "Anxiety follow-up" },
      { id: "p5002", name: "Samuel Baker", age: 31, status: "Care plan", nextVisit: "May 31, 2026", concern: "Sleep concerns" },
      { id: "p5003", name: "Victoria Nelson", age: 44, status: "Follow-up", nextVisit: "Jun 6, 2026", concern: "Stress management" },
      { id: "p5004", name: "Owen Carter", age: 19, status: "New intake", nextVisit: "Jun 10, 2026", concern: "Counselling intake" },
      { id: "p5005", name: "Emily Mitchell", age: 36, status: "Active", nextVisit: "Jun 20, 2026", concern: "Medication check" }
    ]
  }
];

const departmentDoctorMap = {
  "dept-primary": [
    { id: "d1001", name: "Dr. Lena Chen", email: "dr.chen@care.test", specialty: "Family Medicine" },
    { id: "d1002", name: "Dr. Victor Sloan", email: "victor.sloan@care.test", specialty: "Primary Care" }
  ],
  "dept-cardiology": [
    { id: "d2001", name: "Dr. Marcus Reed", email: "marcus.reed@care.test", specialty: "Cardiology" },
    { id: "d2002", name: "Dr. Alina Foster", email: "alina.foster@care.test", specialty: "Preventive Cardiology" }
  ],
  "dept-pediatrics": [
    { id: "d3001", name: "Dr. Priya Shah", email: "priya.shah@care.test", specialty: "Pediatrics" },
    { id: "d3002", name: "Dr. Caleb Morgan", email: "caleb.morgan@care.test", specialty: "Adolescent Medicine" }
  ],
  "dept-dermatology": [
    { id: "d4001", name: "Dr. Naomi Brooks", email: "naomi.brooks@care.test", specialty: "Dermatology" },
    { id: "d4002", name: "Dr. Sofia Grant", email: "sofia.grant@care.test", specialty: "Clinical Dermatology" }
  ],
  "dept-mental-health": [
    { id: "d5001", name: "Dr. Aaron White", email: "aaron.white@care.test", specialty: "Psychiatry" },
    { id: "d5002", name: "Dr. Mira Lawson", email: "mira.lawson@care.test", specialty: "Counselling Psychology" }
  ]
};

departments = departments.map((department) => ({
  ...department,
  doctors: departmentDoctorMap[department.id] || []
}));

let doctorSchedules = Object.values(departmentDoctorMap).flat().reduce((schedule, doctor, index) => {
  schedule[doctor.id] = [
    {
      id: `slot-${doctor.id}-1`,
      doctorId: doctor.id,
      title: "Clinic block",
      date: `May ${18 + index}, 2026, 9:00 AM`,
      status: index % 2 === 0 ? "Booked" : "Open"
    },
    {
      id: `slot-${doctor.id}-2`,
      doctorId: doctor.id,
      title: "Patient follow-up",
      date: `May ${19 + index}, 2026, 1:30 PM`,
      status: "Open"
    }
  ];
  return schedule;
}, {});

const departmentDoctorUsers = departments.flatMap((department) =>
  department.doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    passwordHash: bcrypt.hashSync("portal123", 10),
    role: "Provider",
    dob: doctor.specialty,
    mrn: `Provider ID: ${doctor.id.toUpperCase()}`,
    plan: `${department.name} workspace`,
    careTeam: `${department.name} department`,
    avatar: initials(doctor.name)
  }))
);

const departmentPatientUsers = departments.flatMap((department) =>
  department.patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    email: `${patient.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "")}@patient.test`,
    passwordHash: bcrypt.hashSync("portal123", 10),
    role: "Patient",
    dob: `Age ${patient.age}`,
    mrn: `MRN-${patient.id.toUpperCase()}`,
    plan: `${department.name} care plan`,
    careTeam: department.lead,
    avatar: initials(patient.name)
  }))
);

users.push(...departmentDoctorUsers.filter((doctor) => !users.some((user) => user.email === doctor.email)), ...departmentPatientUsers);

function allPatientsWithDepartment() {
  return departments.flatMap((department) =>
    department.patients.map((patient) => ({ ...patient, departmentId: department.id, departmentName: department.name, departmentLead: department.lead }))
  );
}

function defaultProfileForPatient(patient) {
  return {
    patientId: patient.id,
    patientName: patient.name,
    summary: `${patient.concern}. Status: ${patient.status}. Next visit: ${patient.nextVisit}.`,
    riskLevel: patient.status === "High priority" ? "High" : patient.status === "Pending labs" || patient.status === "Pending imaging" ? "Medium" : "Low",
    lastUpdatedBy: patient.departmentLead || "CareBridge",
    updatedAt: patient.nextVisit || "Current",
    hidden: false
  };
}

function recordsForPatient(patient) {
  const provider = patient.departmentLead || "CareBridge";
  return [
    {
      id: `rec-${patient.id}-visit`,
      patientId: patient.id,
      patientName: patient.name,
      departmentId: patient.departmentId,
      type: "Visit",
      title: `${patient.concern} visit`,
      detail: `Clinical note for ${patient.name}: ${patient.concern}. Current status is ${patient.status}.`,
      date: patient.nextVisit || "Current",
      provider,
      tag: patient.status,
      hidden: false
    },
    {
      id: `rec-${patient.id}-care-plan`,
      patientId: patient.id,
      patientName: patient.name,
      departmentId: patient.departmentId,
      type: "Care plan",
      title: `${patient.departmentName} care plan`,
      detail: `Care team: ${provider}. Follow-up plan is aligned with ${patient.concern.toLowerCase()}.`,
      date: "Active",
      provider,
      tag: "Plan",
      hidden: false
    }
  ];
}

function initializeClinicalState() {
  const patients = allPatientsWithDepartment();
  patientProfiles = patients.reduce((profiles, patient) => {
    profiles[patient.id] = defaultProfileForPatient(patient);
    return profiles;
  }, {});
  patientProfiles.u1 = {
    ...patientProfile,
    patientId: "u1",
    patientName: "Maya Patel"
  };
  patientRecords = [
    ...records.map((record, index) => ({
      ...record,
      id: `rec-u1-${index}`,
      patientId: "u1",
      patientName: "Maya Patel",
      departmentId: "dept-primary",
      hidden: false
    })),
    ...patients.flatMap(recordsForPatient)
  ];
  messages = normalizeMessages(messages);
}

function normalizeMessages(items) {
  return items.map((message, index) => ({
    patientId: "u1",
    patientName: "Maya Patel",
    departmentId: "dept-primary",
    doctorId: "d1001",
    senderRole: index === 1 ? "Admin" : "Provider",
    receiverRole: "Patient",
    ...message
  }));
}

function ensureClinicalCoverage() {
  const existingRecordKeys = new Set(patientRecords.map((record) => `${record.patientId}:${record.type}:${record.title}`));
  for (const patient of allPatientsWithDepartment()) {
    if (!patientProfiles[patient.id]) patientProfiles[patient.id] = defaultProfileForPatient(patient);
    const missingRecords = recordsForPatient(patient).filter((record) => !existingRecordKeys.has(`${record.patientId}:${record.type}:${record.title}`));
    patientRecords = [...patientRecords, ...missingRecords];
  }
  if (!patientProfiles.u1) {
    patientProfiles.u1 = {
      ...patientProfile,
      patientId: "u1",
      patientName: "Maya Patel"
    };
  }
  appointments.filter((appointment) => appointment.status === "Approved").forEach(ensureAcceptedAppointmentPatient);
  patientRecords = patientRecords.map((record, index) => ({
    id: record.id || `rec-${record.patientId || "unknown"}-${index}`,
    hidden: false,
    ...record
  }));
  messages = normalizeMessages(messages);
}

initializeClinicalState();

function applyPersistedState(state) {
  if (!state || typeof state !== "object") return false;

  if (Array.isArray(state.users)) {
    users.splice(0, users.length, ...state.users);
  }
  if (Array.isArray(state.appointments)) appointments = state.appointments;
  if (Array.isArray(state.messages)) messages = normalizeMessages(state.messages);
  if (Array.isArray(state.notifications)) notifications = state.notifications;
  if (state.patientProfile && typeof state.patientProfile === "object") patientProfile = state.patientProfile;
  if (state.patientProfiles && typeof state.patientProfiles === "object") patientProfiles = { ...patientProfiles, ...state.patientProfiles };
  if (Array.isArray(state.patientRecords)) patientRecords = state.patientRecords;
  if (Array.isArray(state.transfers)) transfers = state.transfers;
  if (Array.isArray(state.adminApprovalRequests)) adminApprovalRequests = state.adminApprovalRequests;
  if (Array.isArray(state.auditLogs)) auditLogs = state.auditLogs;
  if (Array.isArray(state.departments)) departments = state.departments;
  if (state.doctorSchedules && typeof state.doctorSchedules === "object") doctorSchedules = state.doctorSchedules;
  return true;
}

function hydrateFromDisk() {
  if (!fs.existsSync(DATA_FILE)) return false;

  try {
    return applyPersistedState(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
  } catch (error) {
    console.warn(`Unable to load local portal state. Seed data will be used. ${error.message}`);
    return false;
  }
}

async function hydratePersistedState() {
  if (portalStore) {
    try {
      const state = await portalStore.load();
      if (applyPersistedState(state)) return { restored: true, source: `${portalStore.name} table ${portalStore.table}` };
      return { restored: false, source: `${portalStore.name} table ${portalStore.table}` };
    } catch (error) {
      console.warn(`Unable to load Supabase portal state. Falling back to local state. ${error.message}`);
    }
  }

  return {
    restored: hydrateFromDisk(),
    source: `local file ${DATA_FILE}`
  };
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function publicAdminRequest(request) {
  const { passwordHash, ...safeRequest } = request;
  return safeRequest;
}

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "2h" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((candidate) => candidate.id === payload.id);
    if (!user) return res.status(401).json({ message: "Invalid session." });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Missing or expired session." });
  }
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function findDepartment(id) {
  return departments.find((department) => department.id === id) || departments[0];
}

function doctorHasConflict(doctorId, requestedDate) {
  if (!requestedDate) return false;
  return (doctorSchedules[doctorId] || []).some(
    (slot) => slot.date === requestedDate && !["Open", "Rejected", "Cancelled"].includes(slot.status)
  );
}

function assignDoctor(departmentId, requestedDoctorId, requestedDate) {
  const department = findDepartment(departmentId);
  const requestedDoctor = department.doctors.find((doctor) => doctor.id === requestedDoctorId);
  if (requestedDoctor) {
    if (doctorHasConflict(requestedDoctor.id, requestedDate)) {
      const error = new Error(`${requestedDoctor.name} already has a scheduled item at ${requestedDate}.`);
      error.status = 409;
      throw error;
    }
    return { department, doctor: requestedDoctor, assignment: "Selected by patient" };
  }

  const doctor = [...department.doctors]
    .filter((candidate) => !doctorHasConflict(candidate.id, requestedDate))
    .sort((a, b) => (doctorSchedules[a.id] || []).length - (doctorSchedules[b.id] || []).length)[0];
  if (!doctor) {
    const error = new Error(`No doctors are available in ${department.name} at ${requestedDate}.`);
    error.status = 409;
    throw error;
  }
  return { department, doctor, assignment: "Auto-assigned by schedule" };
}

function providerDoctorIds(user) {
  if (!user || user.role !== "Provider") return [];
  return departments
    .flatMap((department) => department.doctors)
    .filter((doctor) => doctor.email === user.email || doctor.name === user.name || doctor.id === user.id)
    .map((doctor) => doctor.id);
}

function providerDepartmentIds(user) {
  const doctorIds = providerDoctorIds(user);
  return departments
    .filter((department) => department.doctors.some((doctor) => doctorIds.includes(doctor.id)))
    .map((department) => department.id);
}

function canProviderAccessPatient(user, patientId) {
  if (user.role === "Admin") return true;
  if (user.role !== "Provider") return false;
  const departmentIds = providerDepartmentIds(user);
  return departments.some((department) =>
    departmentIds.includes(department.id) &&
      department.patients.some(
        (patient) => patient.id === patientId || patient.userId === patientId || patient.linkedPatientId === patientId
      )
  );
}

function canManageAppointment(user, appointment) {
  if (!appointment) return false;
  if (user.role === "Admin") return true;
  if (user.role !== "Provider") return false;
  return providerDoctorIds(user).includes(appointment.doctorId);
}

function findPatientDepartment(patientId) {
  for (const department of departments) {
    const index = department.patients.findIndex((patient) => patient.id === patientId);
    if (index !== -1) {
      return { department, patient: department.patients[index], index };
    }
  }
  return null;
}

function findPatientForAppointment(appointment) {
  if (!appointment) return null;
  for (const department of departments) {
    const patient = department.patients.find(
      (candidate) =>
        candidate.id === appointment.patientId ||
        candidate.userId === appointment.patientId ||
        (appointment.patientName && candidate.name === appointment.patientName)
    );
    if (patient) return { department, patient };
  }
  return null;
}

function ensureAcceptedAppointmentPatient(appointment) {
  if (!appointment?.departmentId) return null;
  const targetDepartment = departments.find((department) => department.id === appointment.departmentId);
  if (!targetDepartment) return null;

  const existingTargetPatient = targetDepartment.patients.find(
    (patient) =>
      patient.id === appointment.patientId ||
      patient.userId === appointment.patientId ||
      (appointment.patientName && patient.name === appointment.patientName)
  );
  if (existingTargetPatient) return existingTargetPatient;

  const source = findPatientForAppointment(appointment);
  const sourcePatient = source?.patient || {};
  const patient = {
    id: appointment.patientId || sourcePatient.id || `p${Date.now()}`,
    ...(sourcePatient.id && sourcePatient.id !== appointment.patientId ? { linkedPatientId: sourcePatient.id } : {}),
    ...(appointment.patientId && sourcePatient.id && sourcePatient.id !== appointment.patientId ? { userId: appointment.patientId } : {}),
    name: appointment.patientName || sourcePatient.name || "Accepted patient",
    age: sourcePatient.age || "Not recorded",
    status: "Accepted",
    nextVisit: appointment.date || sourcePatient.nextVisit || "Scheduled",
    concern: appointment.title || sourcePatient.concern || appointment.detail || "Accepted appointment"
  };

  targetDepartment.patients = [patient, ...targetDepartment.patients];

  const patientForRecords = {
    ...patient,
    departmentId: targetDepartment.id,
    departmentName: targetDepartment.name,
    departmentLead: targetDepartment.lead
  };
  if (!patientProfiles[patient.id]) {
    patientProfiles[patient.id] = sourcePatient.id && patientProfiles[sourcePatient.id]
      ? { ...patientProfiles[sourcePatient.id], patientId: patient.id, patientName: patient.name, updatedAt: appointment.date || "Accepted" }
      : defaultProfileForPatient(patientForRecords);
  }
  const hasDepartmentRecord = patientRecords.some((record) => record.patientId === patient.id && record.departmentId === targetDepartment.id);
  if (!hasDepartmentRecord) {
    patientRecords = [
      ...recordsForPatient(patientForRecords).map((record) => ({ ...record, id: `${record.id}-${targetDepartment.id}` })),
      ...patientRecords
    ];
  }

  return patient;
}

function patientIdsForUser(user) {
  if (!user || user.role !== "Patient") return [];
  const ids = new Set([user.id]);
  for (const department of departments) {
    for (const patient of department.patients) {
      if (patient.id === user.id || patient.userId === user.id || patient.name === user.name) ids.add(patient.id);
    }
  }
  return [...ids];
}

function messageVisibleToUser(user, item) {
  if (!item || (user.role !== "Admin" && item.hidden)) return false;
  if (user.role === "Admin") return true;
  if (user.role === "Patient") {
    const patientIds = patientIdsForUser(user);
    return patientIds.includes(item.patientId) || item.senderId === user.id || item.receiverId === user.id;
  }
  if (user.role === "Provider") {
    const doctorIds = providerDoctorIds(user);
    const departmentIds = providerDepartmentIds(user);
    return doctorIds.includes(item.doctorId) || departmentIds.includes(item.departmentId) || item.senderId === user.id || item.receiverId === user.id;
  }
  return false;
}

function findMessagePatient(patientId) {
  if (!patientId) return null;
  for (const department of departments) {
    const patient = department.patients.find((candidate) => candidate.id === patientId || candidate.userId === patientId);
    if (patient) return { department, patient };
  }
  return null;
}

function recordVisibleToUser(user, item) {
  if (!item || (user.role !== "Admin" && item.hidden)) return false;
  if (user.role === "Admin") return true;
  if (user.role === "Patient") return patientIdsForUser(user).includes(item.patientId);
  if (user.role === "Provider") return providerDepartmentIds(user).includes(item.departmentId);
  return false;
}

function transferVisibleToUser(user, item) {
  if (!item) return false;
  if (user.role === "Admin") return true;
  if (user.role === "Patient") return patientIdsForUser(user).includes(item.patientId);
  if (user.role === "Provider") {
    const departmentIds = providerDepartmentIds(user);
    return departmentIds.includes(item.sourceDepartmentId) || departmentIds.includes(item.targetDepartmentId);
  }
  return false;
}

function scopedProfilesForUser(user) {
  if (user.role === "Admin") return patientProfiles;
  if (user.role === "Patient") {
    return patientIdsForUser(user).reduce((profiles, patientId) => {
      if (patientProfiles[patientId]) profiles[patientId] = patientProfiles[patientId];
      return profiles;
    }, {});
  }
  if (user.role === "Provider") {
    const departmentIds = providerDepartmentIds(user);
    const patientIds = departments
      .filter((department) => departmentIds.includes(department.id))
      .flatMap((department) => department.patients.map((patient) => patient.id));
    return patientIds.reduce((profiles, patientId) => {
      if (patientProfiles[patientId]) profiles[patientId] = patientProfiles[patientId];
      return profiles;
    }, {});
  }
  return {};
}

function scopedPortalData(user) {
  const visible = (item) => user.role === "Admin" || !item.hidden;
  const doctorIds = providerDoctorIds(user);
  const appointmentVisibleToUser = (item) => {
    if (!visible(item)) return false;
    if (user.role === "Admin") return true;
    if (user.role === "Patient") return patientIdsForUser(user).includes(item.patientId);
    if (user.role === "Provider") return item.doctorId && doctorIds.includes(item.doctorId);
    return false;
  };
  const notificationVisibleToUser = (item) => {
    if (!visible(item)) return false;
    if (user.role === "Admin") return true;
    if (item.audience !== user.role) return false;
    if (user.role === "Patient") return !item.patientId || patientIdsForUser(user).includes(item.patientId);
    if (user.role === "Provider") return !item.doctorId || doctorIds.includes(item.doctorId);
    return true;
  };

  return {
    appointments: appointments.filter(appointmentVisibleToUser),
    messages: messages.filter((item) => messageVisibleToUser(user, item)),
    notifications: notifications.filter(notificationVisibleToUser),
    records: patientRecords.filter((item) => recordVisibleToUser(user, item)),
    patientProfiles: scopedProfilesForUser(user),
    transfers: transfers.filter((item) => transferVisibleToUser(user, item))
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CareBridge API",
    storage: portalStore ? "Supabase" : "Local JSON",
    time: new Date().toISOString()
  });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = users.find((candidate) => candidate.email === email);
  const adminRequest = adminApprovalRequests.find((candidate) => candidate.email === email && ["Requested", "Rejected"].includes(candidate.status));

  if (!user && adminRequest && (await bcrypt.compare(password, adminRequest.passwordHash))) {
    addAuditLog(null, "Pending admin login blocked", `${email} attempted login while admin access is ${adminRequest.status.toLowerCase()}.`, "Warning");
    return res.status(403).json({
      message:
        adminRequest.status === "Requested"
          ? "Your admin account request is waiting for approval from an existing admin."
          : "Your admin account request was rejected. Contact the current admin."
    });
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    addAuditLog(null, "Failed login", `Failed login attempt for ${email}.`, "Warning");
    return res.status(401).json({ message: "Email or password did not match a portal account." });
  }

  addAuditLog(user, "Successful login", `${user.email} signed in as ${user.role}.`, "Info");
  res.json({ token: createToken(user), user: publicUser(user) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "Enter the email address for the portal account." });

  pruneExpiredPasswordResetRequests();
  const user = users.find((candidate) => candidate.email === email);
  if (!user) {
    addAuditLog(null, "Password reset requested", `Password reset was requested for an unknown email: ${email}.`, "Warning");
    queueSave();
    return res.json({ message: "If that account exists, a reset code has been prepared." });
  }

  const resetCode = createPasswordResetCode();
  const codeHash = await bcrypt.hash(resetCode, 10);
  passwordResetRequests = [
    {
      id: `reset-${Date.now()}`,
      userId: user.id,
      email,
      codeHash,
      expiresAt: Date.now() + PASSWORD_RESET_TTL_MS,
      attempts: 0
    },
    ...passwordResetRequests.filter((request) => request.email !== email)
  ];

  addAuditLog(user, "Password reset requested", `${user.email} requested a password reset code.`, "Warning");
  queueSave();
  res.json({
    message: "Reset code created. Enter it with a new password.",
    resetCode,
    expiresInMinutes: Math.round(PASSWORD_RESET_TTL_MS / 60000)
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const code = String(req.body.code || "").trim();
  const password = String(req.body.password || "");

  if (!email || !code || password.length < 6) {
    return res.status(400).json({ message: "Enter email, reset code, and a new password with at least 6 characters." });
  }

  pruneExpiredPasswordResetRequests();
  const user = users.find((candidate) => candidate.email === email);
  const request = passwordResetRequests.find((candidate) => candidate.email === email);
  if (!user || !request) {
    addAuditLog(null, "Password reset failed", `Invalid or expired password reset attempt for ${email}.`, "Warning");
    queueSave();
    return res.status(400).json({ message: "Reset code is invalid or expired." });
  }

  request.attempts += 1;
  const codeMatches = await bcrypt.compare(code, request.codeHash);
  if (!codeMatches) {
    if (request.attempts >= 5) {
      passwordResetRequests = passwordResetRequests.filter((candidate) => candidate.id !== request.id);
    }
    addAuditLog(user, "Password reset failed", `${user.email} entered an invalid reset code.`, "Warning");
    queueSave();
    return res.status(400).json({ message: "Reset code is invalid or expired." });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  passwordResetRequests = passwordResetRequests.filter((candidate) => candidate.userId !== user.id);
  addAuditLog(user, "Password reset completed", `${user.email} updated their password using reset verification.`, "Critical");
  queueSave();
  res.json({ message: "Password updated. You can sign in with the new password." });
});

app.patch("/api/auth/change-password", requireAuth, async (req, res) => {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!currentPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Enter your current password and a new password with at least 6 characters." });
  }

  const currentMatches = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!currentMatches) {
    addAuditLog(req.user, "Password change failed", `${req.user.email} entered an incorrect current password.`, "Warning");
    queueSave();
    return res.status(400).json({ message: "Current password is incorrect." });
  }

  if (await bcrypt.compare(newPassword, req.user.passwordHash)) {
    return res.status(400).json({ message: "Choose a new password that is different from the current password." });
  }

  req.user.passwordHash = await bcrypt.hash(newPassword, 10);
  addAuditLog(req.user, "Password changed", `${req.user.email} changed their portal password.`, "Critical");
  queueSave();
  res.json({ message: "Password changed successfully." });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = ["Patient", "Provider", "Admin"].includes(req.body.role) ? req.body.role : "Patient";

  if (!name || !email || password.length < 6) {
    return res.status(400).json({ message: "Enter a name, valid email, and a password with at least 6 characters." });
  }

  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  if (role === "Admin") {
    const openRequest = adminApprovalRequests.find((request) => request.email === email && request.status === "Requested");
    if (openRequest) {
      return res.status(409).json({ message: "An admin approval request already exists for this email." });
    }

    const request = {
      id: `admin-request-${Date.now()}`,
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      status: "Requested",
      requestedAt: new Date().toLocaleString(),
      verificationNote: "Pending identity and role verification by an existing admin."
    };
    adminApprovalRequests = [request, ...adminApprovalRequests];
    notifications = [
      {
        id: `n${Date.now()}-admin-request`,
        audience: "Admin",
        title: "New admin approval request",
        detail: `${name} requested admin portal access with ${email}. Verify identity before approval.`,
        date: "Just now",
        tag: "Admin request",
        hidden: false
      },
      ...notifications
    ];
    addAuditLog(null, "Admin approval requested", `${email} requested admin access and is waiting for existing admin approval.`, "Critical");
    queueSave();
    return res.status(202).json({
      pendingApproval: true,
      message: "Admin account request submitted. An existing admin must approve it before login is enabled.",
      adminRequest: publicAdminRequest(request)
    });
  }

  const user = {
    id: `u${users.length + 1}`,
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role,
    dob: role === "Patient" ? "New patient profile" : "New staff profile",
    mrn: role === "Patient" ? "MRN pending" : "Staff ID pending",
    plan: "New account",
    careTeam: role === "Patient" ? "Care team pending" : "Portal workspace",
    avatar: initials(name)
  };

  users.push(user);
  addAuditLog(user, "Account registered", `${user.email} registered as ${user.role}.`, "Info");
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

app.get("/api/portal", requireAuth, (req, res) => {
  const scoped = scopedPortalData(req.user);
  const profileIds = Object.keys(scoped.patientProfiles);

  res.json({
    user: publicUser(req.user),
    vitals,
    records: scoped.records,
    appointments: scoped.appointments,
    messages: scoped.messages,
    notifications: scoped.notifications,
    patientProfile: scoped.patientProfiles[profileIds[0]] || patientProfile,
    patientProfiles: scoped.patientProfiles,
    transfers: scoped.transfers,
    departments,
    doctorSchedules,
    adminApprovalRequests: req.user.role === "Admin" ? adminApprovalRequests.map(publicAdminRequest) : [],
    auditLogs: req.user.role === "Admin" ? auditLogs : [],
    resources,
    adminItems: req.user.role === "Admin" ? adminItems : []
  });
});

app.get("/api/audit-logs", requireAuth, (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  res.json({ auditLogs });
});

app.get("/api/search", requireAuth, (req, res) => {
  const query = String(req.query.q || "").toLowerCase();
  const filter = String(req.query.filter || "All");
  const scoped = scopedPortalData(req.user);
  const items = [
    ...scoped.records,
    ...scoped.appointments,
    ...scoped.messages,
    ...scoped.transfers.map((transfer) => ({
      title: `Transfer ${transfer.status}`,
      detail: `${transfer.patientName} from ${transfer.sourceDepartmentName} to ${transfer.targetDepartmentName}. ${transfer.reason}`,
      date: transfer.requestedAt,
      tag: "Transfer"
    })),
    ...resources,
    ...(req.user.role === "Admin" ? adminItems : [])
  ];
  const results = items.filter((item) => {
    const matchesFilter = filter === "All" || item.tag === filter || item.type === filter;
    const content = `${item.title} ${item.detail} ${item.date} ${item.tag} ${item.type || ""}`.toLowerCase();
    return matchesFilter && content.includes(query);
  });

  res.json({ results });
});

app.post("/api/appointments", requireAuth, (req, res) => {
  if (req.user.role !== "Patient") {
    return res.status(403).json({ message: "Only patients can request appointments." });
  }
  const requestedDate = `${req.body.date || "Requested date"}, ${req.body.time || "Requested time"}`;
  let assigned;
  try {
    assigned = assignDoctor(req.body.departmentId, req.body.doctorId, requestedDate);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
  const { department, doctor, assignment } = assigned;
  const appointment = {
    id: `a${Date.now()}`,
    patientId: req.user.id,
    patientName: req.user.name,
    departmentId: department.id,
    departmentName: department.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    assignment,
    title: String(req.body.type || "Appointment"),
    detail: String(req.body.reason || "Appointment request"),
    date: requestedDate,
    location: req.body.type === "Virtual visit" ? "Virtual visit" : department.location,
    tag: "Requested",
    status: "Pending",
    hidden: false
  };

  appointments = [appointment, ...appointments];
  doctorSchedules[doctor.id] = [
    {
      id: `slot-${appointment.id}`,
      appointmentId: appointment.id,
      doctorId: doctor.id,
      title: `${req.user.name}: ${appointment.title}`,
      date: appointment.date,
      status: "Pending"
    },
    ...(doctorSchedules[doctor.id] || [])
  ];
  addAuditLog(req.user, "Appointment requested", `${req.user.name} requested ${appointment.title} with ${doctor.name} in ${department.name}. ${assignment}.`, "Info");
  notifications = [
    {
      id: `n${Date.now()}`,
      audience: "Provider",
      doctorId: doctor.id,
      title: "New patient request",
      detail: `${req.user.name} requested ${appointment.title} with ${doctor.name} for ${appointment.date}.`,
      date: "Just now",
      tag: "Request",
      hidden: false
    },
    ...notifications
  ];
  queueSave();
  res.status(201).json({ appointment, appointments: scopedPortalData(req.user).appointments, notifications: scopedPortalData(req.user).notifications, doctorSchedules });
});

app.patch("/api/appointments/:id/status", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can update appointment requests." });
  }

  const status = req.body.status === "Rejected" ? "Rejected" : "Approved";
  const appointment = appointments.find((item) => item.id === req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found." });
  if (!canManageAppointment(req.user, appointment)) {
    return res.status(403).json({ message: "This appointment is outside your provider schedule." });
  }

  appointment.status = status;
  appointment.tag = status;
  const acceptedPatient = status === "Approved" ? ensureAcceptedAppointmentPatient(appointment) : null;
  if (appointment.doctorId && doctorSchedules[appointment.doctorId]) {
    doctorSchedules[appointment.doctorId] = doctorSchedules[appointment.doctorId].map((slot) =>
      slot.appointmentId === appointment.id ? { ...slot, status } : slot
    );
  }
  addAuditLog(req.user, `Appointment ${status.toLowerCase()}`, `${req.user.name} ${status.toLowerCase()} request ${appointment.id}: ${appointment.title}.`, "Important");
  notifications = [
    {
      id: `n${Date.now()}`,
      audience: "Patient",
      patientId: appointment.patientId,
      title: `Appointment ${status.toLowerCase()}`,
      detail: `${req.user.name} ${status.toLowerCase()} your request for ${appointment.title}.`,
      date: "Just now",
      tag: status,
      hidden: false
    },
    ...(acceptedPatient
      ? [{
          id: `n-roster-${Date.now()}`,
          audience: "Provider",
          doctorId: appointment.doctorId,
          patientId: acceptedPatient.id,
          title: "Patient added to portfolio",
          detail: `${acceptedPatient.name} is now visible in your ${appointment.departmentName || "department"} patient panel.`,
          date: "Just now",
          tag: "Portfolio",
          hidden: false
        }]
      : []),
    ...notifications
  ];
  queueSave();

  const scoped = scopedPortalData(req.user);
  res.json({
    appointment,
    appointments: scoped.appointments,
    notifications: scoped.notifications,
    doctorSchedules,
    departments,
    patientProfiles: scoped.patientProfiles,
    records: scoped.records
  });
});

app.patch("/api/patient-profile", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can update patient profiles." });
  }
  const allPatients = departments.flatMap((department) => department.patients);
  const selectedPatient = allPatients.find((patient) => patient.id === req.body.patientId) || allPatients[0];
  if (!canProviderAccessPatient(req.user, selectedPatient.id)) {
    return res.status(403).json({ message: "This patient is outside your assigned department." });
  }

  const updatedProfile = {
    ...(patientProfiles[selectedPatient.id] || patientProfile),
    patientId: selectedPatient.id,
    patientName: selectedPatient.name,
    summary: String(req.body.summary || patientProfiles[selectedPatient.id]?.summary || patientProfile.summary),
    riskLevel: String(req.body.riskLevel || patientProfiles[selectedPatient.id]?.riskLevel || patientProfile.riskLevel),
    lastUpdatedBy: req.user.name,
    updatedAt: "Just now"
  };
  patientProfiles[selectedPatient.id] = updatedProfile;
  patientProfile = updatedProfile;
  patientRecords = [
    {
      id: `rec-${selectedPatient.id}-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      departmentId: findPatientDepartment(selectedPatient.id)?.department.id,
      type: "Provider note",
      title: "Care profile updated",
      detail: updatedProfile.summary,
      date: "Just now",
      provider: req.user.name,
      tag: updatedProfile.riskLevel,
      hidden: false
    },
    ...patientRecords
  ];
  addAuditLog(req.user, "Patient profile updated", `${req.user.name} updated ${selectedPatient.name}'s profile summary and risk level ${updatedProfile.riskLevel}.`, "Important");

  notifications = [
    {
      id: `n${Date.now()}`,
      audience: "Patient",
      patientId: selectedPatient.id,
      title: "Profile updated",
      detail: `${req.user.name} updated ${selectedPatient.name}'s care profile: ${updatedProfile.summary}`,
      date: "Just now",
      tag: "Profile",
      hidden: false
    },
    ...notifications
  ];
  queueSave();

  const scoped = scopedPortalData(req.user);
  res.json({ patientProfile: updatedProfile, patientProfiles: scoped.patientProfiles, records: scoped.records, notifications: scoped.notifications });
});

app.post("/api/patients", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can create patient profiles." });
  }

  const departmentId = String(req.body.departmentId || "dept-primary");
  const department = departments.find((item) => item.id === departmentId) || departments[0];
  if (req.user.role === "Provider" && !providerDepartmentIds(req.user).includes(department.id)) {
    return res.status(403).json({ message: "Providers can only create patients in their assigned department." });
  }
  const patient = {
    id: `p${Date.now()}`,
    name: String(req.body.name || "New Patient"),
    age: Number(req.body.age || 0),
    status: String(req.body.status || "New intake"),
    nextVisit: String(req.body.nextVisit || "To be scheduled"),
    concern: String(req.body.concern || "New patient profile")
  };

  department.patients = [patient, ...department.patients];
  const patientForRecords = { ...patient, departmentId: department.id, departmentName: department.name, departmentLead: department.lead };
  patientProfiles[patient.id] = defaultProfileForPatient(patientForRecords);
  patientRecords = [...recordsForPatient(patientForRecords), ...patientRecords];
  addAuditLog(req.user, "Patient profile created", `${req.user.name} created ${patient.name} in ${department.name}.`, "Important");

  notifications = [
    {
      id: `n${Date.now()}`,
      audience: "Admin",
      title: "New patient profile",
      detail: `${req.user.name} created ${patient.name} in ${department.name}.`,
      date: "Just now",
      tag: "Profile",
      hidden: false
    },
    ...notifications
  ];
  queueSave();

  const scoped = scopedPortalData(req.user);
  res.status(201).json({ patient, departments, patientProfiles: scoped.patientProfiles, records: scoped.records, notifications: scoped.notifications });
});

app.patch("/api/patients/:id/transfer", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can transfer patients." });
  }

  const source = findPatientDepartment(req.params.id);
  if (!source) return res.status(404).json({ message: "Patient not found." });

  if (req.user.role === "Provider" && !providerDepartmentIds(req.user).includes(source.department.id)) {
    return res.status(403).json({ message: "Providers can only transfer patients from their assigned department." });
  }

  const targetDepartmentId = String(req.body.targetDepartmentId || "");
  const targetDepartment = departments.find((department) => department.id === targetDepartmentId);
  if (!targetDepartment) return res.status(400).json({ message: "Target department is required." });
  if (targetDepartment.id === source.department.id) {
    return res.status(400).json({ message: "Choose a different department for transfer." });
  }

  const reason = String(req.body.reason || "Clinical transfer requested").trim();
  if (transfers.some((transfer) => transfer.patientId === source.patient.id && transfer.status === "Requested")) {
    return res.status(409).json({ message: "This patient already has a pending transfer request." });
  }

  const transfer = {
    id: `t${Date.now()}`,
    patientId: source.patient.id,
    patientName: source.patient.name,
    sourceDepartmentId: source.department.id,
    sourceDepartmentName: source.department.name,
    targetDepartmentId: targetDepartment.id,
    targetDepartmentName: targetDepartment.name,
    requestedById: req.user.id,
    requestedByName: req.user.name,
    reason,
    status: "Requested",
    requestedAt: "Just now",
    decidedAt: "",
    decidedByName: "",
    hidden: false
  };
  transfers = [transfer, ...transfers];
  source.patient.status = "Transfer requested";
  source.patient.concern = reason || source.patient.concern;

  const providerNotifications = (targetDepartment.doctors || []).map((doctor, index) => ({
    id: `n${Date.now()}-${index}`,
    audience: "Provider",
      doctorId: doctor.id,
      title: "Incoming patient transfer",
      detail: `${source.patient.name} is requested for transfer from ${source.department.name} to ${targetDepartment.name}. Reason: ${reason}.`,
      date: "Just now",
      tag: "Transfer",
      hidden: false
  }));

  notifications = [
    {
      id: `n${Date.now()}-patient`,
      audience: "Patient",
      patientId: source.patient.id,
      title: "Department transfer requested",
      detail: `${req.user.name} requested to transfer your care from ${source.department.name} to ${targetDepartment.name}.`,
      date: "Just now",
      tag: "Transfer",
      hidden: false
    },
    {
      id: `n${Date.now()}-admin`,
      audience: "Admin",
      title: "Patient transfer requested",
      detail: `${req.user.name} requested ${source.patient.name}'s transfer from ${source.department.name} to ${targetDepartment.name}.`,
      date: "Just now",
      tag: "Audit",
      hidden: false
    },
    ...providerNotifications,
    ...notifications
  ];
  addAuditLog(req.user, "Patient transfer requested", `${req.user.name} requested transfer for ${source.patient.name} from ${source.department.name} to ${targetDepartment.name}. Reason: ${reason}.`, "Critical");
  queueSave();

  const scoped = scopedPortalData(req.user);
  res.json({ transfer, departments, notifications: scoped.notifications, transfers: scoped.transfers, patientProfiles: scoped.patientProfiles, patientProfile });
});

app.patch("/api/transfers/:id/status", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only receiving providers or admins can decide transfers." });
  }

  const transfer = transfers.find((item) => item.id === req.params.id);
  if (!transfer) return res.status(404).json({ message: "Transfer request not found." });
  if (transfer.status !== "Requested") return res.status(409).json({ message: "Transfer has already been decided." });
  if (req.user.role === "Provider" && !providerDepartmentIds(req.user).includes(transfer.targetDepartmentId)) {
    return res.status(403).json({ message: "Only the receiving department can accept or reject this transfer." });
  }

  const status = req.body.status === "Rejected" ? "Rejected" : "Accepted";
  const source = findPatientDepartment(transfer.patientId);
  const targetDepartment = departments.find((department) => department.id === transfer.targetDepartmentId);
  if (!source || !targetDepartment) return res.status(404).json({ message: "Transfer departments are no longer available." });

  transfer.status = status;
  transfer.decidedAt = "Just now";
  transfer.decidedByName = req.user.name;

  if (status === "Accepted") {
    const movedPatient = {
      ...source.patient,
      status: "Transferred",
      concern: transfer.reason,
      nextVisit: "Transfer intake pending"
    };
    source.department.patients = source.department.patients.filter((patient) => patient.id !== transfer.patientId);
    targetDepartment.patients = [movedPatient, ...targetDepartment.patients];

    const patientUser = users.find((user) => user.id === movedPatient.id);
    if (patientUser) {
      patientUser.plan = `${targetDepartment.name} care plan`;
      patientUser.careTeam = targetDepartment.lead;
    }

    const updatedProfile = {
      ...(patientProfiles[movedPatient.id] || defaultProfileForPatient({ ...movedPatient, departmentLead: targetDepartment.lead })),
      patientId: movedPatient.id,
      patientName: movedPatient.name,
      summary: `${transfer.reason}. Transfer accepted by ${targetDepartment.name}; intake pending.`,
      updatedAt: "Just now",
      lastUpdatedBy: req.user.name
    };
    patientProfiles[movedPatient.id] = updatedProfile;
    patientProfile = updatedProfile;
    patientRecords = [
      {
        id: `rec-${movedPatient.id}-transfer-${Date.now()}`,
        patientId: movedPatient.id,
        patientName: movedPatient.name,
        departmentId: targetDepartment.id,
        type: "Transfer",
        title: "Department transfer accepted",
        detail: `${req.user.name} accepted transfer from ${source.department.name} to ${targetDepartment.name}. Reason: ${transfer.reason}.`,
        date: "Just now",
        provider: req.user.name,
        tag: "Transfer",
        hidden: false
      },
      ...patientRecords
    ];
  } else {
    source.patient.status = "Transfer rejected";
  }

  notifications = [
    {
      id: `n${Date.now()}-patient`,
      audience: "Patient",
      patientId: transfer.patientId,
      title: `Transfer ${status.toLowerCase()}`,
      detail: `${req.user.name} ${status.toLowerCase()} your transfer request to ${transfer.targetDepartmentName}.`,
      date: "Just now",
      tag: status,
      hidden: false
    },
    {
      id: `n${Date.now()}-admin`,
      audience: "Admin",
      title: `Transfer ${status.toLowerCase()}`,
      detail: `${req.user.name} ${status.toLowerCase()} ${transfer.patientName}'s transfer to ${transfer.targetDepartmentName}.`,
      date: "Just now",
      tag: "Audit",
      hidden: false
    },
    ...notifications
  ];
  addAuditLog(req.user, `Patient transfer ${status.toLowerCase()}`, `${req.user.name} ${status.toLowerCase()} ${transfer.patientName}'s transfer to ${transfer.targetDepartmentName}.`, "Critical");
  queueSave();

  const scoped = scopedPortalData(req.user);
  res.json({ transfer, departments, transfers: scoped.transfers, notifications: scoped.notifications, patientProfiles: scoped.patientProfiles, records: scoped.records, patientProfile });
});

app.post("/api/doctors", requireAuth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only admins can create doctor profiles." });
  }

  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const specialty = String(req.body.specialty || "General Medicine").trim();
  const departmentName = String(req.body.department || "Primary Care").trim();
  const password = String(req.body.password || "TempPass123!");

  if (!name || !email || password.length < 6) {
    return res.status(400).json({ message: "Doctor name, email, and password with 6+ characters are required." });
  }

  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "A user with that email already exists." });
  }

  const doctor = {
    id: `d${Date.now()}`,
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "Provider",
    dob: specialty,
    mrn: `Provider ID: D-${Date.now()}`,
    plan: `${departmentName} workspace`,
    careTeam: departmentName,
    avatar: initials(name)
  };

  users.push(doctor);
  const departmentRecord = departments.find((item) => item.name.toLowerCase() === departmentName.toLowerCase());
  if (departmentRecord) {
    departmentRecord.doctors = [
      ...(departmentRecord.doctors || []),
      { id: doctor.id, name: doctor.name, email: doctor.email, specialty }
    ];
    doctorSchedules[doctor.id] = [
      {
        id: `slot-${doctor.id}-1`,
        doctorId: doctor.id,
        title: "New provider onboarding",
        date: "To be scheduled",
        status: "Open"
      }
    ];
  }
  addAuditLog(req.user, "Doctor profile created", `${req.user.name} created doctor profile ${doctor.name} for ${departmentName}.`, "Critical");

  notifications = [
    {
      id: `n${Date.now()}`,
      audience: "Admin",
      title: "Doctor profile created",
      detail: `${doctor.name} can login with ${doctor.email}.`,
      date: "Just now",
      tag: "Provider",
      hidden: false
    },
    ...notifications
  ];
  queueSave();

  res.status(201).json({ doctor: publicUser(doctor), notifications });
});

app.patch("/api/admin-requests/:id/status", requireAuth, (req, res) => {
  if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin access required." });

  const status = String(req.body.status || "");
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Admin request status must be Approved or Rejected." });
  }

  const request = adminApprovalRequests.find((candidate) => candidate.id === req.params.id);
  if (!request) return res.status(404).json({ message: "Admin approval request not found." });
  if (request.status !== "Requested") {
    return res.status(409).json({ message: `This admin request is already ${request.status.toLowerCase()}.` });
  }

  if (status === "Approved") {
    if (users.some((user) => user.email === request.email)) {
      request.status = "Rejected";
      request.decidedAt = new Date().toLocaleString();
      request.decidedBy = req.user.name;
      request.decisionNote = "Rejected because an account already exists for this email.";
      queueSave();
      return res.status(409).json({ message: "A user with that email already exists." });
    }

    const adminUser = {
      id: `admin-${Date.now()}`,
      name: request.name,
      email: request.email,
      passwordHash: request.passwordHash,
      role: "Admin",
      dob: "Operations",
      mrn: `Admin ID: ADM-${Date.now()}`,
      plan: "Compliance workspace",
      careTeam: "Admin approved access",
      avatar: initials(request.name)
    };
    users.push(adminUser);
    request.approvedUserId = adminUser.id;
  }

  request.status = status;
  request.decidedAt = new Date().toLocaleString();
  request.decidedBy = req.user.name;
  request.decisionNote =
    status === "Approved"
      ? "Verified by existing admin and promoted to admin account."
      : "Rejected by existing admin after verification review.";

  notifications = [
    {
      id: `n${Date.now()}-admin-decision`,
      audience: "Admin",
      title: `Admin request ${status.toLowerCase()}`,
      detail: `${req.user.name} ${status.toLowerCase()} admin access for ${request.email}.`,
      date: "Just now",
      tag: status,
      hidden: false
    },
    ...notifications
  ];
  addAuditLog(req.user, `Admin request ${status.toLowerCase()}`, `${req.user.name} ${status.toLowerCase()} admin access for ${request.email}.`, "Critical");
  queueSave();

  res.json({
    adminRequest: publicAdminRequest(request),
    adminApprovalRequests: adminApprovalRequests.map(publicAdminRequest),
    notifications,
    auditLogs
  });
});

app.patch("/api/admin/items/:collection/:id", requireAuth, (req, res) => {
  if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin access required." });

  const collections = { appointments, messages, notifications, records: patientRecords, transfers };
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ message: "Collection not found." });

  const item = collection.find((candidate) => candidate.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found." });

  if (typeof req.body.hidden === "boolean") item.hidden = req.body.hidden;
  if (req.body.title) item.title = String(req.body.title);
  if (req.body.detail) item.detail = String(req.body.detail);
  item.adminNote = "Changed by admin. Item was not deleted.";
  addAuditLog(
    req.user,
    "Admin content changed",
    `Admin ${req.body.hidden === true ? "hid" : req.body.hidden === false ? "showed" : "changed"} ${req.params.collection} item ${req.params.id}. No delete was performed.`,
    "Critical"
  );
  queueSave();

  res.json({ item, appointments, messages, notifications, records: patientRecords, transfers });
});

app.post("/api/messages", requireAuth, (req, res) => {
  const detail = String(req.body.detail || "").trim();
  if (!detail) return res.status(400).json({ message: "Message cannot be empty." });
  const subject = String(req.body.subject || "").trim();
  const category = String(req.body.category || "Care").trim() || "Care";
  const requestedRecipientRole = ["Patient", "Provider", "Admin"].includes(req.body.recipientRole) ? req.body.recipientRole : "";
  const recipientLabel = String(req.body.recipientLabel || requestedRecipientRole || "Care Team").trim();
  const providerDepartmentIdsForUser = providerDepartmentIds(req.user);
  const providerDepartment = req.user.role === "Provider" ? departments.find((department) => providerDepartmentIdsForUser.includes(department.id)) : null;
  const patientIds = req.user.role === "Patient" ? patientIdsForUser(req.user) : [];
  const requestedPatientId = String(req.body.patientId || "").trim();
  const senderPatientMatch = req.user.role === "Patient" ? patientIds.map((patientId) => findMessagePatient(patientId)).find(Boolean) : null;
  const selectedPatientMatch = requestedPatientId ? findMessagePatient(requestedPatientId) : senderPatientMatch;

  if (req.user.role === "Provider" && requestedRecipientRole === "Patient") {
    if (!selectedPatientMatch) return res.status(400).json({ message: "Select a patient before sending a patient message." });
    if (!canProviderAccessPatient(req.user, selectedPatientMatch.patient.id)) return res.status(403).json({ message: "Provider cannot message a patient outside their department." });
  }

  if (req.user.role === "Provider" && selectedPatientMatch && !canProviderAccessPatient(req.user, selectedPatientMatch.patient.id)) {
    return res.status(403).json({ message: "Provider cannot attach messages to a patient outside their department." });
  }

  const receiverRole =
    req.user.role === "Patient"
      ? requestedRecipientRole === "Admin" ? "Admin" : "Provider"
      : req.user.role === "Provider"
        ? requestedRecipientRole === "Patient" ? "Patient" : "Admin"
        : requestedRecipientRole === "Provider" ? "Provider" : "Patient";
  const patientId = req.user.role === "Patient" ? senderPatientMatch?.patient.id || patientIds[0] || req.user.id : selectedPatientMatch?.patient.id || "";
  const patientName = req.user.role === "Patient" ? senderPatientMatch?.patient.name || req.user.name : selectedPatientMatch?.patient.name || "";
  const departmentId = selectedPatientMatch?.department.id || providerDepartment?.id || "";
  const doctorId =
    receiverRole === "Provider"
      ? selectedPatientMatch?.department.doctors?.[0]?.id || providerDoctorIds(req.user)[0] || ""
      : providerDoctorIds(req.user)[0] || selectedPatientMatch?.department.doctors?.[0]?.id || "";
  const title = subject || `${req.user.name} to ${recipientLabel}`;

  const message = {
    id: `m${Date.now()}`,
    title,
    detail,
    date: "Just now",
    tag: category,
    senderId: req.user.id,
    senderRole: req.user.role,
    receiverRole,
    recipientLabel,
    patientId,
    patientName,
    departmentId,
    doctorId,
    hidden: false
  };

  messages = [message, ...messages];
  notifications = [
    {
      id: `n-msg-${Date.now()}`,
      audience: receiverRole,
      patientId,
      departmentId,
      doctorId: receiverRole === "Provider" ? doctorId : "",
      title: "New secure message",
      detail: `${req.user.name}: ${title}`,
      date: "Just now",
      tag: "Message",
      hidden: false
    },
    ...notifications
  ];
  addAuditLog(req.user, "Secure message sent", `${req.user.name} sent a secure message to care team.`, "Info");
  queueSave();
  const scoped = scopedPortalData(req.user);
  res.status(201).json({ message, messages: scoped.messages, notifications: scoped.notifications });
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    saveStateNow().finally(() => process.exit(0));
  });
}

async function startServer() {
  const restoredState = await hydratePersistedState();
  ensureClinicalCoverage();
  persistenceReady = true;
  if (!restoredState.restored) await saveStateNow();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareBridge API running on http://localhost:${PORT}`);
    console.log(`Portal storage: ${restoredState.source}`);
    if (portalStore) {
      console.log(`Supabase row id: ${portalStore.rowId}`);
    }
  });
}

startServer().catch((error) => {
  console.error(`CareBridge API failed to start: ${error.message}`);
  process.exit(1);
});
