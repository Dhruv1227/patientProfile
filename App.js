import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const palette = {
  ink: "#111827",
  slate: "#334155",
  muted: "#64748b",
  soft: "#eef4f3",
  softer: "#f7faf9",
  line: "#d9e4e0",
  surface: "#ffffff",
  teal: "#0f766e",
  tealDark: "#115e59",
  blue: "#1d4ed8",
  indigo: "#4338ca",
  amber: "#b45309",
  rose: "#be123c",
  green: "#15803d"
};

const seededUsers = [
  {
    id: "u1",
    name: "Maya Patel",
    email: "maya@care.test",
    password: "portal123",
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
    password: "portal123",
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
    password: "portal123",
    role: "Admin",
    dob: "Operations",
    mrn: "Admin ID: OPS-007",
    plan: "Compliance workspace",
    careTeam: "Access controls",
    avatar: "CA"
  }
];

const vitals = [
  { label: "Blood pressure", value: "118/76", trend: "Normal", tone: "green" },
  { label: "Heart rate", value: "72 bpm", trend: "Stable", tone: "teal" },
  { label: "A1C", value: "5.4%", trend: "In range", tone: "blue" },
  { label: "LDL", value: "92", trend: "Improved", tone: "indigo" }
];

const records = [
  { type: "Visit", title: "Annual physical", detail: "No new concerns. Continue exercise plan and allergy medication as needed.", date: "Apr 18, 2026", provider: "Dr. Lena Chen", tag: "Completed" },
  { type: "Lab", title: "Comprehensive metabolic panel", detail: "A1C 5.4%, LDL 92 mg/dL, vitamin D normal, kidney function normal.", date: "Mar 27, 2026", provider: "North Clinic Lab", tag: "Reviewed" },
  { type: "Medication", title: "Cetirizine 10mg", detail: "Take one tablet as needed for seasonal allergies.", date: "Active", provider: "Pharmacy", tag: "Active" },
  { type: "Allergy", title: "Penicillin allergy", detail: "Reaction documented. Alert visible to care team before prescribing.", date: "Verified", provider: "CareBridge", tag: "Alert" },
  { type: "Imaging", title: "Chest X-ray", detail: "No acute cardiopulmonary abnormality detected.", date: "Feb 12, 2026", provider: "North Imaging", tag: "Reviewed" },
  { type: "Immunization", title: "COVID-19 booster", detail: "Updated booster recorded in immunization history.", date: "Jan 24, 2026", provider: "Student Health Centre", tag: "Completed" },
  { type: "Care plan", title: "Preventive care plan", detail: "Exercise 150 minutes weekly, repeat lipid panel in 6 months, continue allergy plan.", date: "Apr 18, 2026", provider: "Dr. Lena Chen", tag: "Plan" }
];

const appointmentSeed = [
  { id: "a1", title: "Video follow-up", detail: "Medication review with Dr. Lena Chen", date: "May 18, 2026, 9:30 AM", location: "Virtual visit", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a2", title: "Cardiology consult", detail: "Referral appointment for preventive screening", date: "Jun 4, 2026, 2:00 PM", location: "North Clinic, Suite 204", tag: "In person", status: "Approved", hidden: false },
  { id: "a3", title: "Vaccination reminder", detail: "Flu booster eligibility opens this fall", date: "Sep 12, 2026", location: "Student health center", tag: "Reminder", status: "Scheduled", hidden: false },
  { id: "a4", title: "Nutrition counselling", detail: "Review meal planning for cholesterol management.", date: "Jun 14, 2026, 11:15 AM", location: "Wellness Clinic, Room 118", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a5", title: "Dermatology referral", detail: "Skin irritation follow-up after primary care visit.", date: "Jul 2, 2026, 3:45 PM", location: "Specialty Care Centre", tag: "Referral", status: "Pending", hidden: false }
];

const messagesSeed = [
  { id: "m1", title: "Dr. Chen", detail: "Your lab values look stable. Keep your current plan and book a follow-up if symptoms change.", date: "2h ago", tag: "Unread", hidden: false },
  { id: "m2", title: "Billing team", detail: "Your insurance claim was processed successfully.", date: "Yesterday", tag: "Billing", hidden: false },
  { id: "m3", title: "Care coordinator", detail: "I uploaded your referral notes to the portal for the cardiology visit.", date: "May 8", tag: "Care", hidden: false },
  { id: "m4", title: "Pharmacy", detail: "Your refill request for cetirizine is ready for pickup.", date: "May 7", tag: "Pharmacy", hidden: false },
  { id: "m5", title: "Lab services", detail: "Fasting is required for your next lipid panel. Water is allowed.", date: "May 5", tag: "Lab", hidden: false }
];

const notificationSeed = [
  { id: "n1", audience: "Patient", title: "Welcome back", detail: "Your CareBridge portal is ready.", date: "Today", tag: "Info", hidden: false },
  { id: "n2", audience: "Provider", title: "Pending appointment request", detail: "Maya Patel has 1 appointment request waiting for review.", date: "Today", tag: "Request", hidden: false }
];

const profileSeed = {
  patientId: "p1001",
  patientName: "Maya Patel",
  summary: "Stable health profile. Seasonal allergies active. Preventive care plan reviewed.",
  riskLevel: "Low",
  lastUpdatedBy: "Dr. Lena Chen",
  updatedAt: "Apr 18, 2026",
  hidden: false
};

const auditLogSeed = [
  { id: "log1", actor: "System", role: "System", action: "Portal started", detail: "CareBridge portal initialized.", date: "Today", severity: "Info" }
];

const departmentSeed = [
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

const departmentDoctorSeed = {
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

function departmentsWithDoctors(seed = departmentSeed) {
  return seed.map((department) => ({
    ...department,
    doctors: department.doctors || departmentDoctorSeed[department.id] || []
  }));
}

const doctorScheduleSeed = Object.values(departmentDoctorSeed).flat().reduce((schedule, doctor, index) => {
  schedule[doctor.id] = [
    { id: `slot-${doctor.id}-1`, doctorId: doctor.id, title: "Clinic block", date: `May ${18 + index}, 2026, 9:00 AM`, status: index % 2 === 0 ? "Booked" : "Open" },
    { id: `slot-${doctor.id}-2`, doctorId: doctor.id, title: "Patient follow-up", date: `May ${19 + index}, 2026, 1:30 PM`, status: "Open" }
  ];
  return schedule;
}, {});

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

const operationalTasks = {
  Patient: [
    { title: "Complete e-check-in", detail: "Confirm contact details, visit reason, and preferred pharmacy before your next appointment.", date: "Due today", tag: "Check-in" },
    { title: "Review medication list", detail: "Verify active prescriptions and over-the-counter medications before your visit.", date: "Before visit", tag: "Medication" },
    { title: "Insurance verification", detail: "Coverage is on file. Upload a new card only if your plan has changed.", date: "Verified", tag: "Coverage" }
  ],
  Provider: [
    { title: "Triage pending requests", detail: "Review patient appointment requests and confirm schedule capacity.", date: "Today", tag: "Queue" },
    { title: "Sign chart updates", detail: "Finalize care summaries after patient profile changes.", date: "Open", tag: "Charting" },
    { title: "Review care gaps", detail: "Check patients due for labs, immunizations, or follow-up outreach.", date: "This week", tag: "Care gaps" }
  ],
  Admin: [
    { title: "Verify provider onboarding", detail: "Confirm department assignment, temporary access, and first-login instructions.", date: "Today", tag: "Access" },
    { title: "Review consent queue", detail: "Validate release-of-information requests before making records visible.", date: "Pending", tag: "Consent" },
    { title: "Audit access changes", detail: "Review staff and admin changes for privacy compliance.", date: "Daily", tag: "Audit" }
  ]
};

const visitReadinessTasks = [
  { title: "Bring government ID", detail: "Required for in-person visits and first-time check-in.", date: "Visit day", tag: "ID" },
  { title: "Update medications", detail: "Include prescriptions, supplements, allergies, and recent changes.", date: "Before visit", tag: "Medication" },
  { title: "Arrive 10 minutes early", detail: "Allows time for check-in, vitals, and rooming.", date: "In person", tag: "Arrival" }
];

const navByRole = {
  Patient: ["Dashboard", "Appointments", "Messages", "Records", "Search", "Security"],
  Provider: ["Dashboard", "Appointments", "Messages", "Records", "Search", "Security"],
  Admin: ["Dashboard", "Appointments", "Messages", "Records", "Search", "Security", "Admin"]
};

const actionByRole = {
  Patient: ["Book visit", "Message care team", "View lab results", "Share records"],
  Provider: ["Review queue", "Send note", "Order labs", "Create referral"],
  Admin: ["Access review", "Audit logs", "Consent queue", "Usage report"]
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "http://localhost:4000" : "http://127.0.0.1:4000");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

export default function App() {
  const [users, setUsers] = useState(seededUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient"
  });
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [appointments, setAppointments] = useState(appointmentSeed);
  const [messages, setMessages] = useState(messagesSeed);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [patientProfile, setPatientProfile] = useState(profileSeed);
  const [auditLogs, setAuditLogs] = useState(auditLogSeed);
  const [departments, setDepartments] = useState(departmentsWithDoctors());
  const [doctorSchedules, setDoctorSchedules] = useState(doctorScheduleSeed);
  const [profileDraft, setProfileDraft] = useState(profileSeed.summary);
  const [selectedProfilePatientId, setSelectedProfilePatientId] = useState(profileSeed.patientId);
  const [newPatientForm, setNewPatientForm] = useState({
    departmentId: "dept-primary",
    name: "New Patient",
    age: "29",
    status: "New intake",
    nextVisit: "To be scheduled",
    concern: "Initial assessment"
  });
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: "Dr. New Provider",
    email: "new.provider@care.test",
    specialty: "General Medicine",
    department: "Primary Care",
    password: "TempPass123!"
  });
  const [authToken, setAuthToken] = useState("");
  const [apiStatus, setApiStatus] = useState("Offline continuity mode");
  const [messageDraft, setMessageDraft] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({
    departmentId: "dept-primary",
    doctorId: "",
    type: "Primary care",
    date: "May 22, 2026",
    time: "10:30 AM",
    reason: "Follow-up visit"
  });
  const [masked, setMasked] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const role = currentUser?.role ?? "Patient";
  const tabs = navByRole[role];
  const quickActions = actionByRole[role];
  const mobileTabs = tabs.map((tab) => ({ name: tab, label: tab === "Appointments" ? "Visits" : tab }));

  const searchItems = useMemo(() => {
    const base = [...records, ...appointments, ...messages, ...resources];
    return role === "Admin" ? [...base, ...adminItems] : base;
  }, [appointments, messages, role]);

  const filteredItems = searchItems.filter((item) => {
    const matchesFilter = filter === "All" || item.tag === filter || item.type === filter;
    const content = `${item.title} ${item.detail} ${item.date} ${item.tag} ${item.type ?? ""}`.toLowerCase();
    return matchesFilter && content.includes(query.trim().toLowerCase());
  });

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadPortal(token) {
    const data = await apiRequest("/api/portal", { token });
    setAppointments(data.appointments || appointmentSeed);
    setMessages(data.messages || messagesSeed);
    setNotifications(data.notifications || notificationSeed);
    setPatientProfile(data.patientProfile || profileSeed);
    setDepartments(departmentsWithDoctors(data.departments || departmentSeed));
    setDoctorSchedules(data.doctorSchedules || doctorScheduleSeed);
    setAuditLogs(data.auditLogs || auditLogSeed);
    setProfileDraft((data.patientProfile || profileSeed).summary);
  }

  function addLocalAudit(action, detail, severity = "Info") {
    setAuditLogs((current) => [
      {
        id: `log-${Date.now()}`,
        actor: currentUser?.name || "Local user",
        role: currentUser?.role || "User",
        action,
        detail,
        date: "Just now",
        severity
      },
      ...current
    ]);
  }

  async function handleAuth() {
    setAuthError("");
    const normalizedEmail = form.email.trim().toLowerCase();

    if (authMode === "register") {
      if (!form.name.trim() || !normalizedEmail || form.password.length < 6) {
        setAuthError("Enter a name, valid email, and a password with at least 6 characters.");
        return;
      }

      try {
        const data = await apiRequest("/api/auth/register", {
          method: "POST",
          body: {
            name: form.name,
            email: normalizedEmail,
            password: form.password,
            role: form.role
          }
        });
        setAuthToken(data.token);
        setApiStatus("Secure API connected");
        setCurrentUser(data.user);
        await loadPortal(data.token);
        setActiveTab("Dashboard");
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }

      const newUser = {
        id: `u${users.length + 1}`,
        name: form.name.trim(),
        email: normalizedEmail,
        password: form.password,
        role: form.role,
        dob: form.role === "Patient" ? "New patient profile" : "New staff profile",
        mrn: form.role === "Patient" ? "MRN pending" : "Staff ID pending",
        plan: "New account",
        careTeam: form.role === "Patient" ? "Care team pending" : "Portal workspace",
        avatar: initials(form.name)
      };
      setUsers((existing) => [...existing, newUser]);
      setCurrentUser(newUser);
      setActiveTab("Dashboard");
      return;
    }

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: normalizedEmail,
          password: form.password
        }
      });
      setAuthToken(data.token);
      setApiStatus("Secure API connected");
      setCurrentUser(data.user);
      await loadPortal(data.token);
      setActiveTab("Dashboard");
      return;
    } catch (error) {
      setApiStatus("Offline continuity mode");
    }

    const match = users.find((user) => user.email === normalizedEmail && user.password === form.password);
    if (!match) {
      setAuthError("Email or password did not match a portal account.");
      return;
    }
    setCurrentUser(match);
    setActiveTab("Dashboard");
  }

  async function scheduleAppointment() {
    const selectedDepartment = departments.find((department) => department.id === appointmentForm.departmentId) || departments[0];
    const selectedDoctor = selectedDepartment.doctors.find((doctor) => doctor.id === appointmentForm.doctorId);
    const assignedDoctor =
      selectedDoctor ||
      [...selectedDepartment.doctors].sort((a, b) => (doctorSchedules[a.id] || []).length - (doctorSchedules[b.id] || []).length)[0];
    const localAppointment = {
      id: `local-${Date.now()}`,
      patientId: currentUser.id,
      patientName: currentUser.name,
      departmentId: selectedDepartment.id,
      departmentName: selectedDepartment.name,
      doctorId: assignedDoctor?.id,
      doctorName: assignedDoctor?.name || "Auto assignment pending",
      assignment: selectedDoctor ? "Selected by patient" : "Auto-assigned by schedule",
      title: appointmentForm.type,
      detail: appointmentForm.reason,
      date: `${appointmentForm.date}, ${appointmentForm.time}`,
      location: appointmentForm.type === "Virtual visit" ? "Virtual visit" : selectedDepartment.location,
      tag: "Requested",
      status: "Pending",
      hidden: false
    };

    if (authToken) {
      try {
        const data = await apiRequest("/api/appointments", {
          method: "POST",
          token: authToken,
          body: appointmentForm
        });
        setAppointments(data.appointments);
        setDoctorSchedules(data.doctorSchedules || doctorSchedules);
        setAppointmentForm((current) => ({ ...current, reason: "" }));
        setApiStatus("Secure API connected");
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    setAppointments((current) => [localAppointment, ...current]);
    if (assignedDoctor) {
      setDoctorSchedules((current) => ({
        ...current,
        [assignedDoctor.id]: [
          {
            id: `slot-${localAppointment.id}`,
            appointmentId: localAppointment.id,
            doctorId: assignedDoctor.id,
            title: `${currentUser.name}: ${localAppointment.title}`,
            date: localAppointment.date,
            status: "Pending"
          },
          ...(current[assignedDoctor.id] || [])
        ]
      }));
    }
    addLocalAudit("Appointment requested", `${currentUser.name} requested ${localAppointment.title} with ${localAppointment.doctorName}.`);
    setNotifications((current) => [
      { id: `n-${Date.now()}`, audience: "Provider", title: "New patient request", detail: `${currentUser.name} requested ${localAppointment.title}.`, date: "Just now", tag: "Request", hidden: false },
      ...current
    ]);
    setAppointmentForm((current) => ({ ...current, reason: "" }));
  }

  async function sendMessage() {
    if (!messageDraft.trim()) return;

    if (authToken) {
      try {
        const data = await apiRequest("/api/messages", {
          method: "POST",
          token: authToken,
          body: { detail: messageDraft.trim() }
        });
        setMessages(data.messages);
        setMessageDraft("");
        setApiStatus("Secure API connected");
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    setMessages((current) => [{ id: `m-${Date.now()}`, title: "You to Care Team", detail: messageDraft.trim(), date: "Just now", tag: "Sent", hidden: false }, ...current]);
    setMessageDraft("");
  }

  async function updateAppointmentStatus(id, status) {
    if (authToken) {
      try {
        const data = await apiRequest(`/api/appointments/${id}/status`, {
          method: "PATCH",
          token: authToken,
          body: { status }
        });
        setAppointments(data.appointments);
        setNotifications(data.notifications || notifications);
        setDoctorSchedules(data.doctorSchedules || doctorSchedules);
        await loadPortal(authToken);
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    const target = appointments.find((item) => item.id === id);
    setAppointments((current) => current.map((item) => (item.id === id ? { ...item, status, tag: status } : item)));
    if (target?.doctorId) {
      setDoctorSchedules((current) => ({
        ...current,
        [target.doctorId]: (current[target.doctorId] || []).map((slot) => (slot.appointmentId === id ? { ...slot, status } : slot))
      }));
    }
    addLocalAudit(`Appointment ${status.toLowerCase()}`, `${currentUser.name} ${status.toLowerCase()} ${target?.title || "appointment request"}.`, "Important");
    setNotifications((current) => [
      { id: `n-${Date.now()}`, audience: "Patient", patientId: target?.patientId, title: `Appointment ${status.toLowerCase()}`, detail: `${currentUser.name} ${status.toLowerCase()} your request for ${target?.title || "an appointment"}.`, date: "Just now", tag: status, hidden: false },
      ...current
    ]);
  }

  async function updatePatientProfile() {
    const allPatients = departments.flatMap((department) => department.patients);
    const selectedPatient = allPatients.find((patient) => patient.id === selectedProfilePatientId) || allPatients[0];
    const updated = {
      ...patientProfile,
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.name,
      summary: profileDraft,
      lastUpdatedBy: currentUser.name,
      updatedAt: "Just now"
    };

    if (authToken) {
      try {
        const data = await apiRequest("/api/patient-profile", {
          method: "PATCH",
          token: authToken,
          body: { patientId: selectedPatient?.id, summary: profileDraft, riskLevel: patientProfile.riskLevel }
        });
        setPatientProfile(data.patientProfile);
        setNotifications(data.notifications || notifications);
        await loadPortal(authToken);
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    setPatientProfile(updated);
    addLocalAudit("Patient profile updated", `${currentUser.name} updated ${selectedPatient?.name || "selected patient"}'s profile.`, "Important");
    setNotifications((current) => [
      { id: `n-${Date.now()}`, audience: "Patient", patientId: selectedPatient?.id, title: "Profile updated", detail: `${currentUser.name} updated ${selectedPatient?.name || "selected patient"}'s care profile: ${profileDraft}`, date: "Just now", tag: "Profile", hidden: false },
      ...current
    ]);
  }

  async function adminToggleHidden(collection, id) {
    const applyLocal = () => {
      const toggle = (items) => items.map((item) => (item.id === id ? { ...item, hidden: !item.hidden, adminNote: "Changed by admin. Item was not deleted." } : item));
      if (collection === "appointments") setAppointments(toggle);
      if (collection === "messages") setMessages(toggle);
      if (collection === "notifications") setNotifications(toggle);
      addLocalAudit("Admin content changed", `${currentUser.name} changed visibility for ${collection} item ${id}. No delete was performed.`, "Critical");
    };

    if (authToken) {
      const source = { appointments, messages, notifications }[collection] || [];
      const item = source.find((candidate) => candidate.id === id);
      try {
        const data = await apiRequest(`/api/admin/items/${collection}/${id}`, {
          method: "PATCH",
          token: authToken,
          body: { hidden: !item?.hidden }
        });
        setAppointments(data.appointments || appointments);
        setMessages(data.messages || messages);
        setNotifications(data.notifications || notifications);
        await loadPortal(authToken);
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    applyLocal();
  }

  function adminChangeText(collection, id) {
    const change = (items) =>
      items.map((item) =>
        item.id === id ? { ...item, title: `${item.title} (reviewed)`, detail: `${item.detail} Admin reviewed and changed this item.`, adminNote: "Changed by admin. Item was not deleted." } : item
      );
    if (collection === "appointments") setAppointments(change);
    if (collection === "messages") setMessages(change);
    if (collection === "notifications") setNotifications(change);
    addLocalAudit("Admin content changed", `${currentUser.name} changed text for ${collection} item ${id}. No delete was performed.`, "Critical");
  }

  async function createPatientProfile() {
    const patient = {
      ...newPatientForm,
      age: Number(newPatientForm.age || 0)
    };

    if (authToken) {
      try {
        const data = await apiRequest("/api/patients", {
          method: "POST",
          token: authToken,
          body: patient
        });
        setDepartments(data.departments || departments);
        setNotifications(data.notifications || notifications);
        await loadPortal(authToken);
        setNewPatientForm((current) => ({ ...current, name: "New Patient", concern: "Initial assessment" }));
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    setDepartments((current) =>
      current.map((department) =>
        department.id === patient.departmentId
          ? {
              ...department,
              patients: [
                {
                  id: `p-local-${Date.now()}`,
                  name: patient.name,
                  age: patient.age,
                  status: patient.status,
                  nextVisit: patient.nextVisit,
                  concern: patient.concern
                },
                ...department.patients
              ]
            }
          : department
      )
    );
    addLocalAudit("Patient profile created", `${currentUser.name} created ${patient.name}.`, "Important");
    setNewPatientForm((current) => ({ ...current, name: "New Patient", concern: "Initial assessment" }));
  }

  async function createDoctorProfile() {
    if (authToken) {
      try {
        const data = await apiRequest("/api/doctors", {
          method: "POST",
          token: authToken,
          body: newDoctorForm
        });
        setNotifications(data.notifications || notifications);
        await loadPortal(authToken);
        setNewDoctorForm((current) => ({ ...current, name: "Dr. New Provider", email: "new.provider@care.test" }));
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
      }
    }

    const doctor = {
      id: `d-local-${Date.now()}`,
      name: newDoctorForm.name,
      email: newDoctorForm.email,
      password: newDoctorForm.password,
      role: "Provider",
      dob: newDoctorForm.specialty,
      mrn: "Provider ID pending",
      plan: `${newDoctorForm.department} workspace`,
      careTeam: newDoctorForm.department,
      avatar: initials(newDoctorForm.name)
    };
    setUsers((current) => [...current, doctor]);
    setNotifications((current) => [
      { id: `n-${Date.now()}`, audience: "Admin", title: "Doctor profile created", detail: `${doctor.name} can login with ${doctor.email}.`, date: "Just now", tag: "Provider", hidden: false },
      ...current
    ]);
    addLocalAudit("Doctor profile created", `${currentUser.name} created doctor profile ${doctor.name}.`, "Critical");
    setNewDoctorForm((current) => ({ ...current, name: "Dr. New Provider", email: "new.provider@care.test" }));
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.authPage}>
          <View style={styles.simpleLoginShell}>
            <View style={styles.simpleBrand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>CB</Text>
              </View>
              <View>
                <Text style={styles.simpleBrandName}>CareBridge</Text>
                <Text style={styles.simpleBrandMeta}>Patient Portal</Text>
              </View>
            </View>

          <View style={styles.authCard}>
            <Text style={styles.loginTitle}>{authMode === "login" ? "Sign in" : "Create account"}</Text>
            <Text style={styles.loginSubtitle}>Use your portal credentials to continue.</Text>

            <View style={styles.segment}>
              {["login", "register"].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.segmentButton, authMode === mode && styles.segmentButtonActive]}
                  onPress={() => {
                    setAuthMode(mode);
                    setAuthError("");
                  }}
                >
                  <Text style={[styles.segmentText, authMode === mode && styles.segmentTextActive]}>
                    {mode === "login" ? "Login" : "Register"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {authMode === "register" && (
              <Field label="Full name" value={form.name} onChangeText={(value) => updateForm("name", value)} placeholder="Your name" />
            )}
            <Field label="Email" value={form.email} onChangeText={(value) => updateForm("email", value)} placeholder="name@example.com" />
            <Field
              label="Password"
              value={form.password}
              onChangeText={(value) => updateForm("password", value)}
              placeholder="At least 6 characters"
              secureTextEntry
            />

            {authMode === "register" && (
              <View>
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleGrid}>
                  {["Patient", "Provider", "Admin"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.rolePill, form.role === option && styles.rolePillActive]}
                      onPress={() => updateForm("role", option)}
                    >
                      <Text style={[styles.rolePillText, form.role === option && styles.rolePillTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
              <Text style={styles.primaryButtonText}>{authMode === "login" ? "Enter Secure Portal" : "Create Secure Account"}</Text>
            </TouchableOpacity>

            <View style={styles.accessNotice}>
              <Text style={styles.accessNoticeTitle}>Authorized access only</Text>
              <Text style={styles.accessNoticeText}>Use an issued patient, provider, or admin account. Test credentials are documented separately for local training.</Text>
            </View>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ExpoStatusBar style="dark" />
      <View style={[styles.appShell, isWide && styles.appShellWide]}>
        {isWide ? (
          <View style={[styles.sidebar, styles.sidebarWide]}>
            <View style={styles.productRow}>
              <View style={styles.brandMarkSmall}>
                <Text style={styles.brandMarkSmallText}>CB</Text>
              </View>
              <View>
                <Text style={styles.productName}>CareBridge</Text>
                <Text style={styles.productMeta}>Secure Portal</Text>
              </View>
            </View>

            <View style={styles.userCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{currentUser.avatar}</Text>
              </View>
              <View style={styles.userText}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <Text style={styles.userMeta}>{currentUser.role} account</Text>
              </View>
            </View>

            <View style={styles.navRow}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.navButton, activeTab === tab && styles.navButtonActive]}
                >
                  <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.sidebarFooterLabel}>Session</Text>
              <Text style={styles.sidebarFooterText}>MFA verified</Text>
              <Text style={styles.apiStatusText}>{apiStatus}</Text>
              <TouchableOpacity
                style={styles.signOut}
                onPress={() => {
                  setCurrentUser(null);
                  setAuthToken("");
                }}
              >
                <Text style={styles.signOutText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.mobileHeader}>
            <View style={styles.mobileHeaderTop}>
              <View style={styles.brandMarkSmall}>
                <Text style={styles.brandMarkSmallText}>CB</Text>
              </View>
              <View style={styles.mobileHeaderText}>
                <Text style={styles.productName}>CareBridge</Text>
                <Text style={styles.productMeta}>{apiStatus}</Text>
              </View>
              <TouchableOpacity
                style={styles.mobileSignOut}
                onPress={() => {
                  setCurrentUser(null);
                  setAuthToken("");
                }}
              >
                <Text style={styles.mobileSignOutText}>Out</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mobileUserRow}>
              <View style={styles.mobileAvatar}>
                <Text style={styles.avatarText}>{currentUser.avatar}</Text>
              </View>
              <View style={styles.userText}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <Text style={styles.userMeta}>{currentUser.role} account · MFA verified</Text>
              </View>
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={[styles.content, !isWide && styles.mobileContent]}>
          {activeTab === "Dashboard" && (
            <Dashboard
              appointments={appointments}
              currentUser={currentUser}
              messages={messages}
              notifications={notifications}
              patientProfile={patientProfile}
              departments={departments}
              masked={masked}
              operationalTasks={operationalTasks[role] || []}
              quickActions={quickActions}
              role={role}
              apiStatus={apiStatus}
              setActiveTab={setActiveTab}
              setMasked={setMasked}
              isWide={isWide}
            />
          )}
          {activeTab === "Appointments" && (
            <AppointmentsView
              appointmentForm={appointmentForm}
              appointments={appointments}
              departments={departments}
              doctorSchedules={doctorSchedules}
              role={role}
              scheduleAppointment={scheduleAppointment}
              setAppointmentForm={setAppointmentForm}
              updateAppointmentStatus={updateAppointmentStatus}
              isWide={isWide}
            />
          )}
          {activeTab === "Messages" && (
            <MessagesView messageDraft={messageDraft} messages={messages} notifications={notifications} role={role} sendMessage={sendMessage} setMessageDraft={setMessageDraft} />
          )}
          {activeTab === "Records" && (
            <RecordsView
              masked={masked}
              patientProfile={patientProfile}
              profileDraft={profileDraft}
              departments={departments}
              newPatientForm={newPatientForm}
              selectedProfilePatientId={selectedProfilePatientId}
              role={role}
              setMasked={setMasked}
              setProfileDraft={setProfileDraft}
              setNewPatientForm={setNewPatientForm}
              setSelectedProfilePatientId={setSelectedProfilePatientId}
              createPatientProfile={createPatientProfile}
              updatePatientProfile={updatePatientProfile}
            />
          )}
          {activeTab === "Search" && (
            <SearchView filter={filter} filteredItems={filteredItems} query={query} setFilter={setFilter} setQuery={setQuery} />
          )}
          {activeTab === "Security" && (
            <SecurityView
              currentUser={currentUser}
              auditLogs={auditLogs}
              masked={masked}
              role={role}
              setMasked={setMasked}
              mfaEnabled={mfaEnabled}
              setMfaEnabled={setMfaEnabled}
            />
          )}
          {activeTab === "Admin" && (
            <AdminView
              appointments={appointments}
              auditLogs={auditLogs}
              departments={departments}
              messages={messages}
              notifications={notifications}
              newDoctorForm={newDoctorForm}
              setNewDoctorForm={setNewDoctorForm}
              createDoctorProfile={createDoctorProfile}
              adminToggleHidden={adminToggleHidden}
              adminChangeText={adminChangeText}
            />
          )}
        </ScrollView>

        {!isWide && (
          <View style={styles.mobileTabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileTabScroller}>
              {mobileTabs.map((tab) => (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => setActiveTab(tab.name)}
                  style={[styles.mobileTab, activeTab === tab.name && styles.mobileTabActive]}
                >
                  <Text style={[styles.mobileTabIcon, activeTab === tab.name && styles.mobileTabIconActive]}>
                    {tabIcon(tab.name)}
                  </Text>
                  <Text style={[styles.mobileTabText, activeTab === tab.name && styles.mobileTabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function Dashboard({ appointments, currentUser, messages, notifications, patientProfile, departments, masked, operationalTasks, quickActions, role, apiStatus, setActiveTab, setMasked, isWide }) {
  const firstName = currentUser.name.split(" ")[0];
  const totalPatients = departments.reduce((sum, department) => sum + department.patients.length, 0);

  return (
    <View style={styles.screen}>
      <View style={[styles.headerPanel, isWide && styles.headerPanelWide]}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>{role} dashboard</Text>
          <Text style={styles.pageTitle}>Good morning, {firstName}</Text>
          <Text style={styles.pageSubtitle}>
            {role === "Patient"
              ? "Your care team, upcoming visits, lab results, and secure messages are organized in one place."
              : role === "Provider"
                ? "Review patient communications, visit readiness, recent records, and care coordination tasks."
                : "Monitor access, audit readiness, consent requests, and portal activity from one workspace."}
          </Text>
        </View>
        <View style={styles.identityPanel}>
          <Text style={styles.identityLabel}>{masked ? "Protected profile" : "Patient profile"}</Text>
          <Text style={styles.identityValue}>{masked ? "Maya P." : currentUser.name}</Text>
          <Text style={styles.identityLine}>{masked ? "MRN hidden" : currentUser.mrn}</Text>
          <Text style={styles.identityLine}>{currentUser.plan}</Text>
          <Text style={styles.identityLine}>{apiStatus}</Text>
        </View>
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={action}
            style={styles.quickAction}
            onPress={() => setActiveTab(["Appointments", "Messages", "Records", "Security"][index] ?? "Dashboard")}
          >
            <Text style={styles.quickIcon}>{["+", "@", "#", "*"][index]}</Text>
            <Text style={styles.quickText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.metricGrid, isWide && styles.metricGridWide]}>
        {role !== "Patient" ? (
          <>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Departments</Text>
              <Text style={styles.metricValue}>{departments.length}</Text>
              <Text style={[styles.metricTrend, styles.tealText]}>Clinic network</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Patients</Text>
              <Text style={styles.metricValue}>{totalPatients}</Text>
              <Text style={[styles.metricTrend, styles.blueText]}>Across departments</Text>
            </View>
          </>
        ) : null}
        {vitals.map((item) => (
          <View key={item.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={styles.metricValue}>{masked ? "--" : item.value}</Text>
            <Text style={[styles.metricTrend, styles[`${item.tone}Text`]]}>{item.trend}</Text>
          </View>
        ))}
      </View>

      <View style={styles.controlsRow}>
        <Text style={styles.sectionTitle}>Today at a Glance</Text>
        <TouchableOpacity style={styles.smallButton} onPress={() => setMasked(!masked)}>
          <Text style={styles.smallButtonText}>{masked ? "Show PHI" : "Mask PHI"}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.workspaceGrid, isWide && styles.workspaceGridWide]}>
        <Panel title={role === "Provider" ? "Doctor Requests" : "Upcoming Appointments"} items={appointments.filter((item) => role === "Admin" || !item.hidden).slice(0, 3)} action="Open scheduler" onAction={() => setActiveTab("Appointments")} />
        <Panel title="Operational Tasks" items={operationalTasks} action={role === "Patient" ? "Open visits" : "Open records"} onAction={() => setActiveTab(role === "Patient" ? "Appointments" : "Records")} />
        <Panel title="Notifications" items={notifications.filter((item) => role === "Admin" || item.audience === role).slice(0, 3)} action="Open messages" onAction={() => setActiveTab("Messages")} />
        {role !== "Patient" ? <DepartmentPanel departments={departments} /> : null}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Patient Profile</Text>
          <RecordCard item={{ title: "Clinical summary", detail: patientProfile.hidden ? "Hidden by admin" : patientProfile.summary, date: patientProfile.updatedAt, tag: patientProfile.riskLevel }} />
        </View>
        <Panel title="Recent Records" items={records.slice(0, 3)} masked={masked} action="View chart" onAction={() => setActiveTab("Records")} />
      </View>
    </View>
  );
}

function DepartmentPanel({ departments }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Departments</Text>
      {departments.map((department) => (
        <View key={department.id} style={styles.departmentBlock}>
          <View style={styles.recordTop}>
            <View style={styles.recordTitleWrap}>
              <Text style={styles.recordTitle}>{department.name}</Text>
              <Text style={styles.recordProvider}>{department.lead} · {department.location}</Text>
            </View>
            <Text style={styles.tag}>{department.patients.length} patients</Text>
          </View>
          {department.patients.slice(0, 5).map((patient) => (
            <View key={patient.id} style={styles.patientRow}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>Age {patient.age} · {patient.status}</Text>
              <Text style={styles.patientMeta}>{patient.nextVisit} · {patient.concern}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function AppointmentsView({ appointmentForm, appointments, departments, doctorSchedules, role, scheduleAppointment, setAppointmentForm, updateAppointmentStatus, isWide }) {
  const pending = appointments.filter((item) => item.status === "Pending" && !item.hidden);
  const visibleAppointments = role === "Admin" ? appointments : appointments.filter((item) => !item.hidden);
  const selectedDepartment = departments.find((department) => department.id === appointmentForm.departmentId) || departments[0];
  const selectedDoctor = selectedDepartment?.doctors.find((doctor) => doctor.id === appointmentForm.doctorId);
  const scheduleItems = Object.entries(doctorSchedules).flatMap(([doctorId, slots]) =>
    slots.map((slot) => {
      const doctor = departments.flatMap((department) => department.doctors || []).find((candidate) => candidate.id === doctorId);
      return { title: doctor?.name || doctorId, detail: slot.title, date: slot.date, tag: slot.status };
    })
  );

  return (
    <View style={styles.screen}>
      <PageHeader
        title={role === "Provider" ? "Doctor Panel" : "Appointments"}
        subtitle={role === "Provider" ? "Approve or reject patient appointment requests." : "Book, review, and prepare for upcoming healthcare visits."}
      />
      <View style={[styles.twoColumn, isWide && styles.twoColumnWide]}>
        {role === "Provider" ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Patient Requests</Text>
            {pending.length === 0 ? <RecordCard item={{ title: "No pending requests", detail: "All appointment requests are handled.", date: "Now", tag: "Clear" }} /> : null}
            {pending.map((item) => (
              <View key={item.id} style={styles.actionCard}>
                <RecordCard item={item} />
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.approveButton} onPress={() => updateAppointmentStatus(item.id, "Approved")}>
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={() => updateAppointmentStatus(item.id, "Rejected")}>
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Request Appointment</Text>
            <Text style={styles.inputLabel}>Department</Text>
            <ScrollView horizontal style={styles.filterScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {departments.map((department) => (
                <TouchableOpacity
                  key={department.id}
                  style={[styles.filterPill, appointmentForm.departmentId === department.id && styles.filterPillActive]}
                  onPress={() => setAppointmentForm((current) => ({ ...current, departmentId: department.id, doctorId: "" }))}
                >
                  <Text style={[styles.filterText, appointmentForm.departmentId === department.id && styles.filterTextActive]}>{department.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.inputLabel}>Doctor</Text>
            <ScrollView horizontal style={styles.filterScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <TouchableOpacity style={[styles.filterPill, !appointmentForm.doctorId && styles.filterPillActive]} onPress={() => setAppointmentForm((current) => ({ ...current, doctorId: "" }))}>
                <Text style={[styles.filterText, !appointmentForm.doctorId && styles.filterTextActive]}>Auto assign</Text>
              </TouchableOpacity>
              {(selectedDepartment?.doctors || []).map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[styles.filterPill, appointmentForm.doctorId === doctor.id && styles.filterPillActive]}
                  onPress={() => setAppointmentForm((current) => ({ ...current, doctorId: doctor.id }))}
                >
                  <Text style={[styles.filterText, appointmentForm.doctorId === doctor.id && styles.filterTextActive]}>{doctor.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <RecordCard
              item={{
                title: selectedDoctor ? selectedDoctor.name : "Auto assignment",
                detail: selectedDoctor ? selectedDoctor.specialty : "If no doctor is selected, the portal assigns the doctor with the lightest schedule in this department.",
                date: selectedDepartment?.name || "Department",
                tag: selectedDoctor ? "Selected" : "Auto"
              }}
            />
            <Field label="Visit type" value={appointmentForm.type} onChangeText={(value) => setAppointmentForm((current) => ({ ...current, type: value }))} />
            <Field label="Date" value={appointmentForm.date} onChangeText={(value) => setAppointmentForm((current) => ({ ...current, date: value }))} />
            <Field label="Time" value={appointmentForm.time} onChangeText={(value) => setAppointmentForm((current) => ({ ...current, time: value }))} />
            <Field label="Reason" value={appointmentForm.reason} onChangeText={(value) => setAppointmentForm((current) => ({ ...current, reason: value }))} />
            <TouchableOpacity style={styles.primaryButton} onPress={scheduleAppointment}>
              <Text style={styles.primaryButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        )}
        {role === "Patient" ? <Panel title="Visit Readiness" items={visitReadinessTasks} /> : null}
        <Panel title="Visit Timeline" items={visibleAppointments} />
        {role !== "Patient" ? <Panel title="Synced Doctor Schedules" items={scheduleItems.slice(0, 12)} /> : null}
      </View>
    </View>
  );
}

function MessagesView({ messageDraft, messages, notifications, role, sendMessage, setMessageDraft }) {
  const roleNotifications = notifications.filter((item) => role === "Admin" || item.audience === role);
  return (
    <View style={styles.screen}>
      <PageHeader title="Messages" subtitle="Secure communication with providers, billing, and care coordination." />
      <Panel title={`${role} Notifications`} items={roleNotifications} />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>New Secure Message</Text>
        <TextInput
          style={styles.messageInput}
          multiline
          numberOfLines={4}
          value={messageDraft}
          onChangeText={setMessageDraft}
          placeholder="Write a message to your care team..."
          placeholderTextColor="#82918d"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={sendMessage}>
          <Text style={styles.primaryButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
      <Panel title="Inbox" items={messages.filter((item) => role === "Admin" || !item.hidden)} />
    </View>
  );
}

function RecordsView({
  masked,
  patientProfile,
  profileDraft,
  departments,
  newPatientForm,
  selectedProfilePatientId,
  role,
  setMasked,
  setProfileDraft,
  setNewPatientForm,
  setSelectedProfilePatientId,
  createPatientProfile,
  updatePatientProfile
}) {
  const allPatients = departments.flatMap((department) => department.patients.map((patient) => ({ ...patient, departmentName: department.name })));
  const selectedPatient = allPatients.find((patient) => patient.id === selectedProfilePatientId) || allPatients[0];
  return (
    <View style={styles.screen}>
      <PageHeader title={role === "Provider" ? "Doctor Patient Panel" : "Medical Records"} subtitle="Clinical history, labs, medication, allergies, and provider notes." />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Patient Profile</Text>
        <RecordCard
          item={{
            title: patientProfile.patientName ? `${patientProfile.patientName} care summary` : "Care summary",
            detail: patientProfile.hidden ? "Hidden by admin" : patientProfile.summary,
            date: patientProfile.updatedAt,
            tag: patientProfile.riskLevel
          }}
        />
        {role === "Provider" || role === "Admin" ? (
          <>
            <Text style={styles.inputLabel}>Select patient to update</Text>
            <ScrollView horizontal style={styles.filterScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {allPatients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.filterPill, selectedProfilePatientId === patient.id && styles.filterPillActive]}
                  onPress={() => setSelectedProfilePatientId(patient.id)}
                >
                  <Text style={[styles.filterText, selectedProfilePatientId === patient.id && styles.filterTextActive]}>{patient.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <RecordCard
              item={{
                title: selectedPatient?.name || "No patient selected",
                detail: selectedPatient ? `${selectedPatient.departmentName} · ${selectedPatient.concern}` : "Choose a patient before sending an update.",
                date: selectedPatient?.nextVisit || "No visit",
                tag: selectedPatient?.status || "Select"
              }}
            />
            <TextInput style={styles.messageInput} multiline value={profileDraft} onChangeText={setProfileDraft} placeholder="Update patient care summary..." placeholderTextColor="#82918d" />
            <TouchableOpacity style={styles.primaryButton} onPress={updatePatientProfile}>
              <Text style={styles.primaryButtonText}>Update {selectedPatient?.name || "Patient"} Profile</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
      {role === "Provider" || role === "Admin" ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create Patient Profile</Text>
          <Field label="Patient name" value={newPatientForm.name} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, name: value }))} />
          <Field label="Age" value={String(newPatientForm.age)} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, age: value }))} />
          <Field label="Status" value={newPatientForm.status} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, status: value }))} />
          <Field label="Next visit" value={newPatientForm.nextVisit} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, nextVisit: value }))} />
          <Field label="Concern" value={newPatientForm.concern} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, concern: value }))} />
          <Text style={styles.inputLabel}>Department</Text>
          <ScrollView horizontal style={styles.filterScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {departments.map((department) => (
              <TouchableOpacity
                key={department.id}
                style={[styles.filterPill, newPatientForm.departmentId === department.id && styles.filterPillActive]}
                onPress={() => setNewPatientForm((current) => ({ ...current, departmentId: department.id }))}
              >
                <Text style={[styles.filterText, newPatientForm.departmentId === department.id && styles.filterTextActive]}>{department.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.primaryButton} onPress={createPatientProfile}>
            <Text style={styles.primaryButtonText}>Create Patient Profile</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.controlsRow}>
        <Text style={styles.sectionTitle}>Chart Timeline</Text>
        <TouchableOpacity style={styles.smallButton} onPress={() => setMasked(!masked)}>
          <Text style={styles.smallButtonText}>{masked ? "Show details" : "Hide details"}</Text>
        </TouchableOpacity>
      </View>
      <Panel title="Health History" items={records} masked={masked} />
    </View>
  );
}

function SearchView({ filter, filteredItems, query, setFilter, setQuery }) {
  const filters = ["All", "Visit", "Lab", "Medication", "Alert", "Confirmed", "Unread", "Settings"];

  return (
    <View style={styles.screen}>
      <PageHeader title="Search Portal" subtitle="Find records, appointments, secure messages, resources, and privacy settings." />
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Search labs, cardiology, billing, privacy..."
        placeholderTextColor="#82918d"
      />
      <ScrollView horizontal style={styles.filterScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((option) => (
          <TouchableOpacity key={option} style={[styles.filterPill, filter === option && styles.filterPillActive]} onPress={() => setFilter(option)}>
            <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.resultCount}>{filteredItems.length} matching result{filteredItems.length === 1 ? "" : "s"}</Text>
      <View style={styles.cardList}>
        {filteredItems.map((item, index) => (
          <RecordCard key={`${item.title}-${index}`} item={item} />
        ))}
      </View>
    </View>
  );
}

function SecurityView({ currentUser, auditLogs, masked, role, setMasked, mfaEnabled, setMfaEnabled }) {
  return (
    <View style={styles.screen}>
      <PageHeader title="Security Center" subtitle="Real-world portal controls for protected health information and role-based access." />
      <View style={styles.securityScore}>
        <View>
          <Text style={styles.securityScoreLabel}>Security posture</Text>
          <Text style={styles.securityScoreValue}>98%</Text>
        </View>
        <View style={styles.complianceBadge}>
          <Text style={styles.complianceText}>HIPAA-ready controls</Text>
        </View>
      </View>
      <View style={styles.securityGrid}>
        <ToggleRow title="Multi-factor authentication" detail="Require an extra verification step at sign in." enabled={mfaEnabled} onPress={() => setMfaEnabled(!mfaEnabled)} />
        <ToggleRow title="Privacy masking" detail="Hide protected health information on shared screens." enabled={masked} onPress={() => setMasked(!masked)} />
        <ToggleRow title="Auto-lock session" detail="Lock portal access after 10 minutes of inactivity." enabled />
        <ToggleRow title="Emergency access audit" detail="Record any break-glass access to sensitive charts." enabled />
      </View>
      {role === "Admin" ? (
        <Panel
          title="Recent Audit Activity"
          items={auditLogs.slice(0, 6).map((log) => ({
            title: log.action,
            detail: `${log.actor} (${log.role}): ${log.detail}`,
            date: log.date,
            tag: log.severity
          }))}
        />
      ) : (
        <RecordCard item={{ title: "Audit log protected", detail: "Only administrators can view security activity logs.", date: "Restricted", tag: "Admin only" }} />
      )}
    </View>
  );
}

function AdminView({ appointments, auditLogs, departments, messages, notifications, newDoctorForm, setNewDoctorForm, createDoctorProfile, adminToggleHidden, adminChangeText }) {
  const totalPatients = departments.reduce((sum, department) => sum + department.patients.length, 0);
  const totalDoctors = departments.reduce((sum, department) => sum + (department.doctors || []).length, 0);
  return (
    <View style={styles.screen}>
      <PageHeader title="Admin Panel" subtitle="Admin can hide/show or change portal content. Nothing is deleted." />
      <View style={styles.metricGrid}>
        <MiniMetric label="Active users" value={String(totalPatients + totalDoctors + 1)} />
        <MiniMetric label="Departments" value={String(departments.length)} />
        <MiniMetric label="Patients" value={String(totalPatients)} />
        <MiniMetric label="Hidden items" value={String([...appointments, ...messages, ...notifications].filter((item) => item.hidden).length)} />
        <MiniMetric label="Audit events" value={String(auditLogs.length)} />
      </View>
      <DepartmentPanel departments={departments} />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Create Doctor Profile</Text>
        <Field label="Doctor name" value={newDoctorForm.name} onChangeText={(value) => setNewDoctorForm((current) => ({ ...current, name: value }))} />
        <Field label="Email login" value={newDoctorForm.email} onChangeText={(value) => setNewDoctorForm((current) => ({ ...current, email: value }))} />
        <Field label="Specialty" value={newDoctorForm.specialty} onChangeText={(value) => setNewDoctorForm((current) => ({ ...current, specialty: value }))} />
        <Field label="Department" value={newDoctorForm.department} onChangeText={(value) => setNewDoctorForm((current) => ({ ...current, department: value }))} />
        <Field label="Temporary password" value={newDoctorForm.password} onChangeText={(value) => setNewDoctorForm((current) => ({ ...current, password: value }))} />
        <TouchableOpacity style={styles.primaryButton} onPress={createDoctorProfile}>
          <Text style={styles.primaryButtonText}>Create Doctor Profile</Text>
        </TouchableOpacity>
      </View>
      <Panel title="Access and Compliance" items={adminItems} />
      <Panel
        title="Security Activity Log"
        items={auditLogs.map((log) => ({
          title: log.action,
          detail: `${log.actor} (${log.role}): ${log.detail}`,
          date: log.date,
          tag: log.severity
        }))}
      />
      <AdminCollection title="Manage Appointment Requests" collection="appointments" items={appointments} onHide={adminToggleHidden} onChange={adminChangeText} />
      <AdminCollection title="Manage Messages" collection="messages" items={messages} onHide={adminToggleHidden} onChange={adminChangeText} />
      <AdminCollection title="Manage Notifications" collection="notifications" items={notifications} onHide={adminToggleHidden} onChange={adminChangeText} />
    </View>
  );
}

function AdminCollection({ title, collection, items, onHide, onChange }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {items.map((item) => (
        <View key={`${collection}-${item.id || item.title}`} style={styles.actionCard}>
          <RecordCard item={{ ...item, tag: item.hidden ? "Hidden" : item.tag }} />
          {item.adminNote ? <Text style={styles.adminNote}>{item.adminNote}</Text> : null}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => onHide(collection, item.id)}>
              <Text style={styles.secondaryButtonText}>{item.hidden ? "Show" : "Hide"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => onChange(collection, item.id)}>
              <Text style={styles.secondaryButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Panel({ title, items, masked = false, action, onAction }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        {action ? (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.panelAction}>{action}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {items.map((item, index) => (
        <RecordCard key={`${title}-${item.title}-${index}`} item={item} masked={masked && index < 3} />
      ))}
    </View>
  );
}

function RecordCard({ item, masked = false }) {
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={styles.recordTitleWrap}>
          <Text style={styles.recordTitle}>{item.title}</Text>
          {item.provider ? <Text style={styles.recordProvider}>{item.provider}</Text> : null}
        </View>
        <Text style={[styles.tag, item.tag === "Alert" && styles.alertTag]}>{item.tag}</Text>
      </View>
      <Text style={styles.recordDetail}>{masked ? "Protected health information hidden" : item.detail}</Text>
      {item.status ? <Text style={styles.recordProvider}>Status: {item.status}</Text> : null}
      <View style={styles.recordMetaRow}>
        <Text style={styles.recordDate}>{item.date}</Text>
        {item.location ? <Text style={styles.recordLocation}>{item.location}</Text> : null}
      </View>
    </View>
  );
}

function ToggleRow({ title, detail, enabled, onPress }) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDetail}>{detail}</Text>
      </View>
      <View style={[styles.switchTrack, enabled && styles.switchTrackOn]}>
        <View style={[styles.switchKnob, enabled && styles.switchKnobOn]} />
      </View>
    </TouchableOpacity>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#82918d" autoCapitalize="none" {...props} />
    </View>
  );
}

function MiniMetric({ value, label }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniMetricValue}>{value}</Text>
      <Text style={styles.miniMetricLabel}>{label}</Text>
    </View>
  );
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

function tabIcon(tab) {
  const icons = {
    Dashboard: "H",
    Appointments: "+",
    Messages: "@",
    Records: "#",
    Search: "?",
    Security: "*",
    Admin: "!"
  };
  return icons[tab] || ".";
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.softer
  },
  authPage: {
    minHeight: "100%",
    padding: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  simpleLoginShell: {
    width: "100%",
    maxWidth: 430,
    gap: 16
  },
  simpleBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "center",
    marginBottom: 4
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8f6ef"
  },
  brandMarkText: {
    color: palette.tealDark,
    fontSize: 20,
    fontWeight: "900"
  },
  simpleBrandName: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  simpleBrandMeta: {
    color: palette.muted,
    fontWeight: "800"
  },
  loginTitle: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900"
  },
  loginSubtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  },
  authCard: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.line
  },
  segment: {
    flexDirection: "row",
    backgroundColor: palette.soft,
    borderRadius: 8,
    padding: 4
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentButtonActive: {
    backgroundColor: palette.surface
  },
  segmentText: {
    color: palette.muted,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: palette.ink
  },
  field: {
    gap: 6
  },
  inputLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 14,
    fontSize: 16,
    color: palette.ink,
    backgroundColor: "#fbfefd"
  },
  messageInput: {
    minHeight: 116,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    fontSize: 16,
    color: palette.ink,
    backgroundColor: "#fbfefd",
    textAlignVertical: "top"
  },
  roleGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 6
  },
  rolePill: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  rolePillActive: {
    backgroundColor: palette.teal,
    borderColor: palette.teal
  },
  rolePillText: {
    color: palette.muted,
    fontWeight: "800"
  },
  rolePillTextActive: {
    color: "#ffffff"
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: palette.teal,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900"
  },
  errorText: {
    color: palette.rose,
    fontWeight: "700"
  },
  accessNotice: {
    backgroundColor: palette.softer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    gap: 3
  },
  accessNoticeTitle: {
    color: palette.ink,
    fontWeight: "900"
  },
  accessNoticeText: {
    color: palette.muted,
    fontWeight: "700",
    lineHeight: 19
  },
  appShell: {
    flex: 1,
    backgroundColor: palette.softer
  },
  appShellWide: {
    flexDirection: "row"
  },
  sidebar: {
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    padding: 14,
    gap: 12
  },
  sidebarWide: {
    width: 284,
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: palette.line,
    padding: 18
  },
  mobileHeader: {
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10
  },
  mobileHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  mobileHeaderText: {
    flex: 1
  },
  mobileUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.softer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 10
  },
  mobileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center"
  },
  mobileSignOut: {
    minHeight: 36,
    minWidth: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "center"
  },
  mobileSignOutText: {
    color: palette.rose,
    fontWeight: "900"
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  brandMarkSmall: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8f6ef"
  },
  brandMarkSmallText: {
    color: palette.tealDark,
    fontWeight: "900"
  },
  productName: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 17
  },
  productMeta: {
    color: palette.muted,
    fontWeight: "800"
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.softer,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: palette.blue,
    fontWeight: "900"
  },
  userText: {
    flex: 1
  },
  userName: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  userMeta: {
    color: palette.muted,
    fontWeight: "700"
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  navButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: palette.soft
  },
  navButtonActive: {
    backgroundColor: palette.ink
  },
  navText: {
    color: palette.slate,
    fontWeight: "800"
  },
  navTextActive: {
    color: "#ffffff"
  },
  sidebarFooter: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 12
  },
  sidebarFooterLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  sidebarFooterText: {
    color: palette.green,
    fontWeight: "900"
  },
  apiStatusText: {
    color: palette.muted,
    fontWeight: "800"
  },
  signOut: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: palette.line,
    alignSelf: "flex-start",
    marginTop: 8
  },
  signOutText: {
    color: palette.rose,
    fontWeight: "900"
  },
  content: {
    padding: 18,
    maxWidth: 1220,
    width: "100%",
    alignSelf: "center"
  },
  mobileContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 96
  },
  screen: {
    gap: 16
  },
  headerPanel: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18,
    gap: 16
  },
  headerPanelWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch"
  },
  headerCopy: {
    flex: 1,
    gap: 8
  },
  kicker: {
    color: palette.teal,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  pageHeader: {
    gap: 6
  },
  pageTitle: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 37,
    fontWeight: "900"
  },
  pageSubtitle: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 820
  },
  identityPanel: {
    minWidth: 240,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bde9d2",
    padding: 16,
    gap: 4
  },
  identityLabel: {
    color: palette.green,
    fontWeight: "900"
  },
  identityValue: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  identityLine: {
    color: palette.slate,
    fontWeight: "700"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  quickAction: {
    minWidth: 138,
    flexGrow: 1,
    minHeight: 78,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    justifyContent: "space-between"
  },
  quickIcon: {
    color: palette.blue,
    fontSize: 20,
    fontWeight: "900"
  },
  quickText: {
    color: palette.ink,
    fontWeight: "900"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricGridWide: {
    flexWrap: "nowrap"
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 138,
    borderRadius: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    gap: 5
  },
  metricLabel: {
    color: palette.muted,
    fontWeight: "800"
  },
  metricValue: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: "900"
  },
  metricTrend: {
    fontWeight: "900"
  },
  greenText: {
    color: palette.green
  },
  tealText: {
    color: palette.teal
  },
  blueText: {
    color: palette.blue
  },
  indigoText: {
    color: palette.indigo
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  smallButton: {
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: palette.ink
  },
  smallButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  workspaceGrid: {
    gap: 14
  },
  workspaceGridWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  twoColumn: {
    gap: 14
  },
  twoColumnWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  panel: {
    flex: 1,
    minWidth: 260,
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    gap: 10
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  panelTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  panelAction: {
    color: palette.teal,
    fontWeight: "900"
  },
  recordCard: {
    borderRadius: 8,
    backgroundColor: "#fbfefd",
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    gap: 8
  },
  recordTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8
  },
  recordTitleWrap: {
    flex: 1,
    gap: 2
  },
  recordTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  recordProvider: {
    color: palette.muted,
    fontWeight: "700"
  },
  recordDetail: {
    color: palette.slate,
    lineHeight: 20
  },
  recordMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  recordDate: {
    color: palette.teal,
    fontWeight: "900"
  },
  recordLocation: {
    color: palette.muted,
    fontWeight: "800"
  },
  tag: {
    color: palette.ink,
    backgroundColor: palette.soft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900"
  },
  alertTag: {
    color: palette.rose,
    backgroundColor: "#ffe4e6"
  },
  searchInput: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    color: palette.ink,
    fontSize: 16
  },
  filterScroller: {
    minHeight: 50,
    maxHeight: 54
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
    minHeight: 48,
    alignItems: "center"
  },
  filterPill: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: palette.surface,
    justifyContent: "center"
  },
  filterPillActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink
  },
  filterText: {
    color: palette.slate,
    fontWeight: "800"
  },
  filterTextActive: {
    color: "#ffffff"
  },
  resultCount: {
    color: palette.muted,
    fontWeight: "800"
  },
  cardList: {
    gap: 10
  },
  securityScore: {
    backgroundColor: palette.ink,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center"
  },
  securityScoreLabel: {
    color: "#b8c8c4",
    fontWeight: "900"
  },
  securityScoreValue: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900"
  },
  complianceBadge: {
    backgroundColor: "#d8f6ef",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  complianceText: {
    color: palette.tealDark,
    fontWeight: "900"
  },
  securityGrid: {
    gap: 10
  },
  actionCard: {
    gap: 8
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  approveButton: {
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  rejectButton: {
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: palette.rose,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  secondaryButton: {
    flexGrow: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.softer,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  secondaryButtonText: {
    color: palette.ink,
    fontWeight: "900"
  },
  adminNote: {
    color: palette.amber,
    fontWeight: "800"
  },
  departmentBlock: {
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#fbfefd",
    padding: 12
  },
  patientRow: {
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 8,
    gap: 2
  },
  patientName: {
    color: palette.ink,
    fontWeight: "900"
  },
  patientMeta: {
    color: palette.muted,
    fontWeight: "700"
  },
  toggleRow: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  toggleText: {
    flex: 1
  },
  toggleTitle: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 16
  },
  toggleDetail: {
    color: palette.muted,
    marginTop: 4,
    lineHeight: 20
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#cbd8d4",
    padding: 3
  },
  switchTrackOn: {
    backgroundColor: palette.teal
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff"
  },
  switchKnobOn: {
    transform: [{ translateX: 20 }]
  },
  miniMetric: {
    minWidth: 110,
    flexGrow: 1,
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12
  },
  miniMetricValue: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  miniMetricLabel: {
    color: palette.muted,
    fontWeight: "800"
  },
  mobileTabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 8,
    paddingBottom: 10
  },
  mobileTabScroller: {
    paddingHorizontal: 8,
    gap: 7
  },
  mobileTab: {
    width: 78,
    minHeight: 58,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: palette.softer,
    borderWidth: 1,
    borderColor: palette.line
  },
  mobileTabActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink
  },
  mobileTabIcon: {
    color: palette.slate,
    fontSize: 16,
    fontWeight: "900"
  },
  mobileTabIconActive: {
    color: "#ffffff"
  },
  mobileTabText: {
    color: palette.slate,
    fontSize: 11,
    fontWeight: "900"
  },
  mobileTabTextActive: {
    color: "#ffffff"
  }
});
