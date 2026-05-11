const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "carebridge-class-demo-secret";

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
  { id: "a1", patientId: "u1", title: "Video follow-up", detail: "Medication review with Dr. Lena Chen", date: "May 18, 2026, 9:30 AM", location: "Virtual visit", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a2", patientId: "u1", title: "Cardiology consult", detail: "Referral appointment for preventive screening", date: "Jun 4, 2026, 2:00 PM", location: "North Clinic, Suite 204", tag: "In person", status: "Approved", hidden: false },
  { id: "a3", patientId: "u1", title: "Vaccination reminder", detail: "Flu booster eligibility opens this fall", date: "Sep 12, 2026", location: "Student health center", tag: "Reminder", status: "Scheduled", hidden: false },
  { id: "a4", patientId: "u1", title: "Nutrition counselling", detail: "Review meal planning for cholesterol management.", date: "Jun 14, 2026, 11:15 AM", location: "Wellness Clinic, Room 118", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a5", patientId: "u1", title: "Dermatology referral", detail: "Skin irritation follow-up after primary care visit.", date: "Jul 2, 2026, 3:45 PM", location: "Specialty Care Centre", tag: "Referral", status: "Pending", hidden: false }
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
  { id: "n2", audience: "Provider", title: "Pending appointment request", detail: "Maya Patel has 1 appointment request waiting for review.", date: "Today", tag: "Request", hidden: false }
];

let patientProfile = {
  patientId: "u1",
  summary: "Stable health profile. Seasonal allergies active. Preventive care plan reviewed.",
  riskLevel: "Low",
  lastUpdatedBy: "Dr. Lena Chen",
  updatedAt: "Apr 18, 2026",
  hidden: false
};

let auditLogs = [
  {
    id: "log1",
    actor: "System",
    role: "System",
    action: "Portal started",
    detail: "CareBridge demo portal initialized.",
    date: "Today",
    severity: "Info"
  }
];

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

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
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

function assignDoctor(departmentId, requestedDoctorId) {
  const department = findDepartment(departmentId);
  const requestedDoctor = department.doctors.find((doctor) => doctor.id === requestedDoctorId);
  if (requestedDoctor) return { department, doctor: requestedDoctor, assignment: "Selected by patient" };

  const doctor = [...department.doctors].sort((a, b) => (doctorSchedules[a.id] || []).length - (doctorSchedules[b.id] || []).length)[0];
  return { department, doctor, assignment: "Auto-assigned by schedule" };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CareBridge API", time: new Date().toISOString() });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    addAuditLog(null, "Failed login", `Failed login attempt for ${email}.`, "Warning");
    return res.status(401).json({ message: "Email or password did not match a portal account." });
  }

  addAuditLog(user, "Successful login", `${user.email} signed in as ${user.role}.`, "Info");
  res.json({ token: createToken(user), user: publicUser(user) });
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
  const visible = (item) => req.user.role === "Admin" || !item.hidden;
  res.json({
    user: publicUser(req.user),
    vitals,
    records,
    appointments: appointments.filter(visible),
    messages: messages.filter(visible),
    notifications: notifications.filter((item) => {
      const audienceMatch = item.audience === req.user.role || req.user.role === "Admin";
      const patientMatch = req.user.role !== "Patient" || !item.patientId || item.patientId === req.user.id;
      return audienceMatch && patientMatch && visible(item);
    }),
    patientProfile,
    departments,
    doctorSchedules,
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
  const items = [...records, ...appointments, ...messages, ...resources, ...(req.user.role === "Admin" ? adminItems : [])];
  const results = items.filter((item) => {
    const matchesFilter = filter === "All" || item.tag === filter || item.type === filter;
    const content = `${item.title} ${item.detail} ${item.date} ${item.tag} ${item.type || ""}`.toLowerCase();
    return matchesFilter && content.includes(query);
  });

  res.json({ results });
});

app.post("/api/appointments", requireAuth, (req, res) => {
  const { department, doctor, assignment } = assignDoctor(req.body.departmentId, req.body.doctorId);
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
    date: `${req.body.date || "Requested date"}, ${req.body.time || "Requested time"}`,
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
      title: "New patient request",
      detail: `${req.user.name} requested ${appointment.title} with ${doctor.name} for ${appointment.date}.`,
      date: "Just now",
      tag: "Request",
      hidden: false
    },
    ...notifications
  ];
  res.status(201).json({ appointment, appointments });
});

app.patch("/api/appointments/:id/status", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can update appointment requests." });
  }

  const status = req.body.status === "Rejected" ? "Rejected" : "Approved";
  const appointment = appointments.find((item) => item.id === req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found." });

  appointment.status = status;
  appointment.tag = status;
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
      title: `Appointment ${status.toLowerCase()}`,
      detail: `Dr. Chen ${status.toLowerCase()} your request for ${appointment.title}.`,
      date: "Just now",
      tag: status,
      hidden: false
    },
    ...notifications
  ];

  res.json({ appointment, appointments, notifications, doctorSchedules });
});

app.patch("/api/patient-profile", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can update patient profiles." });
  }
  const allPatients = departments.flatMap((department) => department.patients);
  const selectedPatient = allPatients.find((patient) => patient.id === req.body.patientId) || allPatients[0];

  patientProfile = {
    ...patientProfile,
    patientId: selectedPatient.id,
    patientName: selectedPatient.name,
    summary: String(req.body.summary || patientProfile.summary),
    riskLevel: String(req.body.riskLevel || patientProfile.riskLevel),
    lastUpdatedBy: req.user.name,
    updatedAt: "Just now"
  };
  addAuditLog(req.user, "Patient profile updated", `${req.user.name} updated ${selectedPatient.name}'s profile summary and risk level ${patientProfile.riskLevel}.`, "Important");

  notifications = [
    {
      id: `n${Date.now()}`,
      audience: "Patient",
      patientId: selectedPatient.id,
      title: "Profile updated",
      detail: `${req.user.name} updated ${selectedPatient.name}'s care profile: ${patientProfile.summary}`,
      date: "Just now",
      tag: "Profile",
      hidden: false
    },
    ...notifications
  ];

  res.json({ patientProfile, notifications });
});

app.post("/api/patients", requireAuth, (req, res) => {
  if (req.user.role !== "Provider" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only providers or admins can create patient profiles." });
  }

  const departmentId = String(req.body.departmentId || "dept-primary");
  const department = departments.find((item) => item.id === departmentId) || departments[0];
  const patient = {
    id: `p${Date.now()}`,
    name: String(req.body.name || "New Patient"),
    age: Number(req.body.age || 0),
    status: String(req.body.status || "New intake"),
    nextVisit: String(req.body.nextVisit || "To be scheduled"),
    concern: String(req.body.concern || "New patient profile")
  };

  department.patients = [patient, ...department.patients];
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

  res.status(201).json({ patient, departments, notifications });
});

app.post("/api/doctors", requireAuth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only admins can create doctor profiles." });
  }

  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const specialty = String(req.body.specialty || "General Medicine").trim();
  const department = String(req.body.department || "Primary Care").trim();
  const password = String(req.body.password || "portal123");

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
    plan: `${department} workspace`,
    careTeam: department,
    avatar: initials(name)
  };

  users.push(doctor);
  addAuditLog(req.user, "Doctor profile created", `${req.user.name} created doctor profile ${doctor.name} for ${department}.`, "Critical");

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

  res.status(201).json({ doctor: publicUser(doctor), notifications });
});

app.patch("/api/admin/items/:collection/:id", requireAuth, (req, res) => {
  if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin access required." });

  const collections = { appointments, messages, notifications };
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

  res.json({ item, appointments, messages, notifications });
});

app.post("/api/messages", requireAuth, (req, res) => {
  const detail = String(req.body.detail || "").trim();
  if (!detail) return res.status(400).json({ message: "Message cannot be empty." });

  const message = {
    id: `m${Date.now()}`,
    title: `${req.user.name} to Care Team`,
    detail,
    date: "Just now",
    tag: "Sent",
    hidden: false
  };

  messages = [message, ...messages];
  addAuditLog(req.user, "Secure message sent", `${req.user.name} sent a secure message to care team.`, "Info");
  res.status(201).json({ message, messages });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareBridge API running on http://localhost:${PORT}`);
});
