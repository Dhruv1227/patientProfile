export const seededUsers = [
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

export const vitals = [
  { label: "Blood pressure", value: "118/76", trend: "Normal", tone: "green" },
  { label: "Heart rate", value: "72 bpm", trend: "Stable", tone: "teal" },
  { label: "A1C", value: "5.4%", trend: "In range", tone: "blue" },
  { label: "LDL", value: "92", trend: "Improved", tone: "indigo" }
];

export const records = [
  { id: "rec-u1-visit", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Visit", title: "Annual physical", detail: "No new concerns. Continue exercise plan and allergy medication as needed.", date: "Apr 18, 2026", provider: "Dr. Lena Chen", tag: "Completed", hidden: false },
  { id: "rec-u1-lab", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Lab", title: "Comprehensive metabolic panel", detail: "A1C 5.4%, LDL 92 mg/dL, vitamin D normal, kidney function normal.", date: "Mar 27, 2026", provider: "North Clinic Lab", tag: "Reviewed", hidden: false },
  { id: "rec-u1-med", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Medication", title: "Cetirizine 10mg", detail: "Take one tablet as needed for seasonal allergies.", date: "Active", provider: "Pharmacy", tag: "Active", hidden: false },
  { id: "rec-u1-allergy", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Allergy", title: "Penicillin allergy", detail: "Reaction documented. Alert visible to care team before prescribing.", date: "Verified", provider: "CareBridge", tag: "Alert", hidden: false },
  { id: "rec-u1-imaging", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Imaging", title: "Chest X-ray", detail: "No acute cardiopulmonary abnormality detected.", date: "Feb 12, 2026", provider: "North Imaging", tag: "Reviewed", hidden: false },
  { id: "rec-u1-imm", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Immunization", title: "COVID-19 booster", detail: "Updated booster recorded in immunization history.", date: "Jan 24, 2026", provider: "Student Health Centre", tag: "Completed", hidden: false },
  { id: "rec-u1-plan", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", type: "Care plan", title: "Preventive care plan", detail: "Exercise 150 minutes weekly, repeat lipid panel in 6 months, continue allergy plan.", date: "Apr 18, 2026", provider: "Dr. Lena Chen", tag: "Plan", hidden: false }
];

export const appointmentSeed = [
  { id: "a1", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", departmentName: "Primary Care", doctorId: "d1001", doctorName: "Dr. Lena Chen", assignment: "Selected by patient", title: "Video follow-up", detail: "Medication review with Dr. Lena Chen", date: "May 18, 2026, 9:30 AM", location: "Virtual visit", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a2", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-cardiology", departmentName: "Cardiology", doctorId: "d2001", doctorName: "Dr. Marcus Reed", assignment: "Referral routing", title: "Cardiology consult", detail: "Referral appointment for preventive screening", date: "Jun 4, 2026, 2:00 PM", location: "North Clinic, Suite 204", tag: "In person", status: "Approved", hidden: false },
  { id: "a3", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", departmentName: "Primary Care", doctorId: "d1001", doctorName: "Dr. Lena Chen", assignment: "Care team reminder", title: "Vaccination reminder", detail: "Flu booster eligibility opens this fall", date: "Sep 12, 2026", location: "Student health center", tag: "Reminder", status: "Scheduled", hidden: false },
  { id: "a4", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", departmentName: "Primary Care", doctorId: "d1002", doctorName: "Dr. Victor Sloan", assignment: "Auto-assigned by schedule", title: "Nutrition counselling", detail: "Review meal planning for cholesterol management.", date: "Jun 14, 2026, 11:15 AM", location: "Wellness Clinic, Room 118", tag: "Confirmed", status: "Approved", hidden: false },
  { id: "a5", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-dermatology", departmentName: "Dermatology", doctorId: "d4001", doctorName: "Dr. Naomi Brooks", assignment: "Referral routing", title: "Dermatology referral", detail: "Skin irritation follow-up after primary care visit.", date: "Jul 2, 2026, 3:45 PM", location: "Specialty Care Centre", tag: "Referral", status: "Pending", hidden: false },
  { id: "a6", patientId: "p3001", patientName: "Mia Anderson", departmentId: "dept-pediatrics", departmentName: "Pediatrics", doctorId: "d3001", doctorName: "Dr. Priya Shah", assignment: "Selected by patient", title: "Pediatric vaccination visit", detail: "Vaccination visit and growth chart review.", date: "May 21, 2026, 10:00 AM", location: "Family Wing, Floor 2", tag: "Requested", status: "Pending", hidden: false }
];

export const messagesSeed = [
  { id: "m1", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", doctorId: "d1001", senderRole: "Provider", receiverRole: "Patient", title: "Dr. Chen", detail: "Your lab values look stable. Keep your current plan and book a follow-up if symptoms change.", date: "2h ago", tag: "Unread", hidden: false },
  { id: "m2", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", senderRole: "Admin", receiverRole: "Patient", title: "Billing team", detail: "Your insurance claim was processed successfully.", date: "Yesterday", tag: "Billing", hidden: false },
  { id: "m3", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-cardiology", doctorId: "d2001", senderRole: "Provider", receiverRole: "Patient", title: "Care coordinator", detail: "I uploaded your referral notes to the portal for the cardiology visit.", date: "May 8", tag: "Care", hidden: false },
  { id: "m4", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", senderRole: "Provider", receiverRole: "Patient", title: "Pharmacy", detail: "Your refill request for cetirizine is ready for pickup.", date: "May 7", tag: "Pharmacy", hidden: false },
  { id: "m5", patientId: "u1", patientName: "Maya Patel", departmentId: "dept-primary", senderRole: "Provider", receiverRole: "Patient", title: "Lab services", detail: "Fasting is required for your next lipid panel. Water is allowed.", date: "May 5", tag: "Lab", hidden: false }
];

export const notificationSeed = [
  { id: "n1", audience: "Patient", title: "Welcome back", detail: "Your CareBridge portal is ready.", date: "Today", tag: "Info", hidden: false },
  { id: "n2", audience: "Provider", doctorId: "d3001", title: "Pending appointment request", detail: "Mia Anderson has 1 pediatric appointment request waiting for review.", date: "Today", tag: "Request", hidden: false }
];

export const profileSeed = {
  patientId: "p1001",
  patientName: "Maya Patel",
  summary: "Stable health profile. Seasonal allergies active. Preventive care plan reviewed.",
  riskLevel: "Low",
  lastUpdatedBy: "Dr. Lena Chen",
  updatedAt: "Apr 18, 2026",
  hidden: false
};

export const auditLogSeed = [
  { id: "log1", actor: "System", role: "System", action: "Portal started", detail: "CareBridge portal initialized.", date: "Today", severity: "Info" }
];

export const adminApprovalRequestSeed = [
  {
    id: "admin-request-1",
    name: "Jordan Lee",
    email: "jordan.admin@care.test",
    status: "Requested",
    requestedAt: "Today",
    verificationNote: "Verify school or clinic authorization before granting admin access."
  }
];

export const departmentSeed = [
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

export const departmentDoctorSeed = {
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

export function departmentsWithDoctors(seed = departmentSeed) {
  return seed.map((department) => ({
    ...department,
    doctors: department.doctors || departmentDoctorSeed[department.id] || []
  }));
}

export const doctorScheduleSeed = Object.values(departmentDoctorSeed).flat().reduce((schedule, doctor, index) => {
  schedule[doctor.id] = [
    { id: `slot-${doctor.id}-1`, doctorId: doctor.id, title: "Clinic block", date: `May ${18 + index}, 2026, 9:00 AM`, status: index % 2 === 0 ? "Booked" : "Open" },
    { id: `slot-${doctor.id}-2`, doctorId: doctor.id, title: "Patient follow-up", date: `May ${19 + index}, 2026, 1:30 PM`, status: "Open" }
  ];
  return schedule;
}, {});

export const resources = [
  { title: "Medication safety", detail: "How to read labels and avoid interactions.", date: "Guide", tag: "Education" },
  { title: "Privacy settings", detail: "Manage who can see appointments and lab results.", date: "Security", tag: "Settings" },
  { title: "Find a provider", detail: "Search primary care, cardiology, pediatrics, and urgent care.", date: "Directory", tag: "Providers" },
  { title: "Preparing for video visits", detail: "Checklist for camera, ID, insurance card, and current medications.", date: "Guide", tag: "Education" },
  { title: "Insurance and claims", detail: "Understand deductibles, claim status, and billing contacts.", date: "Support", tag: "Billing" }
];

export const adminItems = [
  { title: "Role access review", detail: "3 staff accounts need quarterly approval.", date: "Today", tag: "Admin" },
  { title: "Audit export", detail: "Security logs are ready for compliance review.", date: "Ready", tag: "Audit" },
  { title: "Consent requests", detail: "2 releases of information are pending.", date: "Pending", tag: "Consent" },
  { title: "Failed login review", detail: "5 failed attempts were blocked by account protection.", date: "Today", tag: "Security" },
  { title: "Provider onboarding", detail: "1 provider account is waiting for supervisor approval.", date: "Tomorrow", tag: "Admin" }
];

export const operationalTasks = {
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

export const visitReadinessTasks = [
  { title: "Bring government ID", detail: "Required for in-person visits and first-time check-in.", date: "Visit day", tag: "ID" },
  { title: "Update medications", detail: "Include prescriptions, supplements, allergies, and recent changes.", date: "Before visit", tag: "Medication" },
  { title: "Arrive 10 minutes early", detail: "Allows time for check-in, vitals, and rooming.", date: "In person", tag: "Arrival" }
];

export const navByRole = {
  Patient: ["Dashboard", "Appointments", "Messages", "Records", "Search", "Security"],
  Provider: ["Dashboard", "Appointments", "Messages", "Records", "Search", "Security"],
  Admin: ["Dashboard", "Appointments", "Messages", "Records", "Search", "Security", "Admin"]
};

export const actionByRole = {
  Patient: ["Book visit", "Message care team", "View lab results", "Share records"],
  Provider: ["Review queue", "Send note", "Order labs", "Create referral"],
  Admin: ["Access review", "Audit logs", "Consent queue", "Usage report"]
};
