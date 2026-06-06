import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import {
  actionByRole,
  adminApprovalRequestSeed,
  adminItems,
  appointmentSeed,
  auditLogSeed,
  departmentSeed,
  departmentsWithDoctors,
  doctorScheduleSeed,
  messagesSeed,
  navByRole,
  notificationSeed,
  operationalTasks,
  profileSeed,
  records,
  resources,
  seededUsers
} from "./src/data/portalSeed";
import { apiRequest } from "./src/services/api";
import { Field, tabIcon } from "./src/components/common";
import {
  AdminView,
  AppointmentsView,
  Dashboard,
  MessagesView,
  RecordsView,
  SearchView,
  SecurityView
} from "./src/screens/PortalScreens";
import {
  appointmentsForUser,
  departmentsForUser,
  initials,
  notificationsForUser,
  messagesForUser,
  patientOperationalSummary,
  profileForUser,
  recordsForUser
} from "./src/utils/roleScope";
import { styles } from "./src/styles";
import { clearSession, restoreSession, saveSession } from "./src/services/sessionStorage";

const PORTAL_REFRESH_INTERVAL_MS = 10000;

function initialPortalTab() {
  try {
    return new URLSearchParams(globalThis?.location?.search || "").get("tab") || "Dashboard";
  } catch {
    return "Dashboard";
  }
}

export default function App() {
  const [users, setUsers] = useState(seededUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient"
  });
  const [resetForm, setResetForm] = useState({
    email: "",
    code: "",
    password: ""
  });
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordChangeNotice, setPasswordChangeNotice] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [activeTab, setActiveTab] = useState(initialPortalTab);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [appointments, setAppointments] = useState(appointmentSeed);
  const [messages, setMessages] = useState(messagesSeed);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [patientProfile, setPatientProfile] = useState(profileSeed);
  const [patientProfiles, setPatientProfiles] = useState({
    [profileSeed.patientId]: profileSeed,
    u1: { ...profileSeed, patientId: "u1" }
  });
  const [medicalRecords, setMedicalRecords] = useState(records);
  const [transfers, setTransfers] = useState([]);
  const [adminApprovalRequests, setAdminApprovalRequests] = useState(adminApprovalRequestSeed);
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
  const [transferForm, setTransferForm] = useState({
    targetDepartmentId: "dept-cardiology",
    reason: "Specialty care transfer requested"
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
  const [appError, setAppError] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageForm, setMessageForm] = useState({
    recipientRole: "Provider",
    recipientLabel: "Care Team",
    category: "Care",
    subject: "Care question",
    patientId: ""
  });
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
  const tabs = navByRole[role] || navByRole.Patient;
  const quickActions = actionByRole[role] || actionByRole.Patient;
  const orderedMobileTabs = role === "Admin" ? ["Dashboard", "Admin", ...tabs.filter((tab) => tab !== "Dashboard" && tab !== "Admin")] : tabs;
  const mobileTabs = orderedMobileTabs.map((tab) => ({
    name: tab,
    label: tab === "Dashboard" ? "Home" : tab === "Appointments" ? "Visits" : tab
  }));
  const scopedDepartments = currentUser ? departmentsForUser(departments, currentUser) : departments;
  const visibleAppointments = currentUser ? appointmentsForUser(appointments, currentUser, departments) : appointments;
  const visibleMessages = currentUser ? messagesForUser(messages, currentUser, departments) : messages;
  const visibleRecords = currentUser ? recordsForUser(medicalRecords, currentUser, departments) : medicalRecords;
  const visibleNotifications = currentUser ? notificationsForUser(notifications, currentUser, departments) : notifications;
  const activePatientProfile = currentUser ? profileForUser(patientProfiles, patientProfile, currentUser, departments, selectedProfilePatientId) : patientProfile;

  useEffect(() => {
    if (currentUser && !tabs.includes(activeTab)) {
      setActiveTab("Dashboard");
    }
  }, [activeTab, currentUser, tabs]);

  useEffect(() => {
    if (!currentUser || role !== "Provider") return;
    const providerPatients = scopedDepartments.flatMap((department) => department.patients);
    if (!providerPatients.length) return;
    const selectedIsInScope = providerPatients.some((patient) => patient.id === selectedProfilePatientId);
    if (!selectedIsInScope) {
      setSelectedProfilePatientId(providerPatients[0].id);
      setProfileDraft(patientOperationalSummary(providerPatients[0]));
    }
  }, [currentUser, role, scopedDepartments, selectedProfilePatientId]);

  useEffect(() => {
    let isMounted = true;

    async function restoreStoredSession() {
      const session = restoreSession();
      if (!session?.user) {
        if (isMounted) setIsRestoringSession(false);
        return;
      }

      if (!isMounted) return;
      setCurrentUser(session.user);
      setAuthToken(session.token);
      setApiStatus(session.token ? "Restoring secure API session" : "Offline continuity mode");

      if (session.token) {
        try {
          await loadPortal(session.token);
          if (isMounted) setApiStatus("Secure API connected");
        } catch (error) {
          if (String(error.message || "").includes("session")) {
            clearSession();
            if (isMounted) {
              setCurrentUser(null);
              setAuthToken("");
              setAuthError("Session expired. Please sign in again.");
              setIsRestoringSession(false);
            }
            return;
          }

          if (isMounted) {
            setAuthToken("");
            setApiStatus("Offline continuity mode");
            saveSession(session.user, "");
          }
        }
      }

      if (isMounted) setIsRestoringSession(false);
    }

    restoreStoredSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return undefined;
    let lockTimer;
    const lockSession = () => {
      setAuthError("Session locked after inactivity. Please sign in again.");
      signOut();
    };
    const resetTimer = () => {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(lockSession, 10 * 60 * 1000);
    };
    resetTimer();
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    if (globalThis?.addEventListener) {
      events.forEach((eventName) => globalThis.addEventListener(eventName, resetTimer));
    }
    return () => {
      clearTimeout(lockTimer);
      if (globalThis?.removeEventListener) {
        events.forEach((eventName) => globalThis.removeEventListener(eventName, resetTimer));
      }
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser || !authToken || isRestoringSession) return undefined;

    let isMounted = true;
    let refreshInFlight = false;

    const refreshPortalData = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;

      try {
        await loadPortal(authToken, { syncProfileDraft: false });
        if (isMounted) setApiStatus("Secure API connected");
      } catch (error) {
        if (!isMounted) return;

        if (String(error.message || "").includes("session")) {
          clearSession();
          setCurrentUser(null);
          setAuthToken("");
          setAuthError("Session expired. Please sign in again.");
          return;
        }

        if (!isNetworkError(error)) {
          setAppError(error.message || "Could not refresh portal data.");
        }
      } finally {
        refreshInFlight = false;
      }
    };

    const refreshTimer = setInterval(refreshPortalData, PORTAL_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, [authToken, currentUser?.id, isRestoringSession]);

  const searchItems = useMemo(() => {
    const transferItems = transfers.map((transfer) => ({
      title: `Transfer ${transfer.status}`,
      detail: `${transfer.patientName} from ${transfer.sourceDepartmentName} to ${transfer.targetDepartmentName}. ${transfer.reason}`,
      date: transfer.requestedAt || transfer.decidedAt || "Transfer",
      tag: "Transfer"
    }));
    const base = [...visibleRecords, ...visibleAppointments, ...visibleMessages, ...transferItems, ...resources];
    return role === "Admin" ? [...base, ...adminItems] : base;
  }, [visibleRecords, visibleAppointments, visibleMessages, transfers, role]);

  const filteredItems = searchItems.filter((item) => {
    const matchesFilter = filter === "All" || item.tag === filter || item.type === filter;
    const content = `${item.title} ${item.detail} ${item.date} ${item.tag} ${item.type ?? ""}`.toLowerCase();
    return matchesFilter && content.includes(query.trim().toLowerCase());
  });

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateResetForm(key, value) {
    setResetForm((current) => ({ ...current, [key]: value }));
  }

  function updatePasswordChangeForm(key, value) {
    setPasswordChangeForm((current) => ({ ...current, [key]: value }));
    setPasswordChangeNotice("");
    setPasswordChangeError("");
  }

  function switchAuthMode(mode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthNotice("");
    if (mode === "forgot") {
      setResetForm((current) => ({
        ...current,
        email: current.email || form.email.trim().toLowerCase(),
        code: "",
        password: ""
      }));
    }
  }

  async function loadPortal(token, options = {}) {
    const { syncProfileDraft = true } = options;
    const data = await apiRequest("/api/portal", { token });
    setAppointments(data.appointments || appointmentSeed);
    setMessages(data.messages || messagesSeed);
    setNotifications(data.notifications || notificationSeed);
    setPatientProfile(data.patientProfile || profileSeed);
    setPatientProfiles(data.patientProfiles || { [profileSeed.patientId]: data.patientProfile || profileSeed });
    setMedicalRecords(data.records || records);
    setTransfers(data.transfers || []);
    setAdminApprovalRequests(data.adminApprovalRequests || adminApprovalRequestSeed);
    setDepartments(departmentsWithDoctors(data.departments || departmentSeed));
    setDoctorSchedules(data.doctorSchedules || doctorScheduleSeed);
    setAuditLogs(data.auditLogs || auditLogSeed);
    if (syncProfileDraft) {
      setProfileDraft((data.patientProfile || profileSeed).summary);
    }
    setAppError("");
  }

  function showAppError(message) {
    setAppError(message);
    setApiStatus(message || "Offline continuity mode");
  }

  function hasScheduleConflict(doctorId, date) {
    return (doctorSchedules[doctorId] || []).some((slot) => slot.date === date && !["Open", "Rejected", "Cancelled"].includes(slot.status));
  }

  function isNetworkError(error) {
    return /failed to fetch|network request failed|load failed/i.test(String(error?.message || ""));
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

  function startSession(user, token = "") {
    setAuthToken(token);
    setCurrentUser(user);
    saveSession(user, token);
  }

  function signOut() {
    setCurrentUser(null);
    setAuthToken("");
    setActiveTab("Dashboard");
    clearSession();
  }

  async function requestPasswordReset() {
    setAuthError("");
    setAuthNotice("");
    const email = (resetForm.email || form.email).trim().toLowerCase();
    if (!email) {
      setAuthError("Enter the account email first.");
      return;
    }

    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      setResetForm((current) => ({ ...current, email, code: data.resetCode || current.code }));
      setAuthNotice(
        data.resetCode
          ? `Demo reset code: ${data.resetCode}. It expires in ${data.expiresInMinutes || 10} minutes.`
          : data.message || "If that account exists, a reset code has been prepared."
      );
      setApiStatus("Password reset code ready");
    } catch (error) {
      setApiStatus("Offline continuity mode");
      setAuthError(isNetworkError(error) ? "Password reset needs the backend server running." : error.message || "Reset code could not be created.");
    }
  }

  async function completePasswordReset() {
    setAuthError("");
    const email = resetForm.email.trim().toLowerCase();
    if (!email || !resetForm.code.trim() || resetForm.password.length < 6) {
      setAuthError("Enter email, reset code, and a new password with at least 6 characters.");
      return;
    }

    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: {
          email,
          code: resetForm.code,
          password: resetForm.password
        }
      });
      setForm((current) => ({ ...current, email, password: "" }));
      setResetForm({ email: "", code: "", password: "" });
      setAuthMode("login");
      setAuthNotice(data.message || "Password updated. You can sign in now.");
      setApiStatus("Password reset completed");
    } catch (error) {
      setApiStatus("Offline continuity mode");
      setAuthError(isNetworkError(error) ? "Password reset needs the backend server running." : error.message || "Password could not be reset.");
    }
  }

  async function changePassword() {
    setPasswordChangeNotice("");
    setPasswordChangeError("");

    if (!authToken) {
      setPasswordChangeError("Password changes require a secure backend session. Start the backend and sign in again.");
      return;
    }

    if (!passwordChangeForm.currentPassword || passwordChangeForm.newPassword.length < 6) {
      setPasswordChangeError("Enter your current password and a new password with at least 6 characters.");
      return;
    }

    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      setPasswordChangeError("New password and confirmation do not match.");
      return;
    }

    try {
      const data = await apiRequest("/api/auth/change-password", {
        method: "PATCH",
        token: authToken,
        body: {
          currentPassword: passwordChangeForm.currentPassword,
          newPassword: passwordChangeForm.newPassword
        }
      });
      setPasswordChangeForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordChangeNotice(data.message || "Password changed successfully.");
      setApiStatus("Password changed");
      await loadPortal(authToken, { syncProfileDraft: false });
    } catch (error) {
      setPasswordChangeError(isNetworkError(error) ? "Password change needs the backend server running." : error.message || "Password could not be changed.");
    }
  }

  async function handleAuth() {
    setAuthError("");
    setAuthNotice("");
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
        if (data.pendingApproval) {
          setAuthMode("login");
          setAuthError(data.message || "Admin account request submitted for approval.");
          setApiStatus("Admin approval pending");
          setForm((current) => ({ ...current, password: "" }));
          return;
        }
        startSession(data.user, data.token);
        setApiStatus("Secure API connected");
        await loadPortal(data.token);
        setActiveTab("Dashboard");
        return;
      } catch (error) {
        setApiStatus("Offline continuity mode");
        if (form.role === "Admin") {
          setAuthError(
            isNetworkError(error)
              ? "Admin accounts require approval from an existing admin. Start the backend and submit the request again."
              : error.message || "Admin registration could not be submitted."
          );
          return;
        }
        if (!isNetworkError(error)) {
          setAuthError(error.message || "Registration could not be completed.");
          return;
        }
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
      startSession(newUser);
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
      startSession(data.user, data.token);
      setApiStatus("Secure API connected");
      await loadPortal(data.token);
      setActiveTab("Dashboard");
      return;
    } catch (error) {
      setApiStatus("Offline continuity mode");
      if (!isNetworkError(error)) {
        setAuthError(error.message || "Sign in failed.");
        return;
      }
    }

    const match = users.find((user) => user.email === normalizedEmail && user.password === form.password);
    if (!match) {
      setAuthError("Email or password did not match a portal account.");
      return;
    }
    startSession(match);
    setActiveTab("Dashboard");
  }

  async function scheduleAppointment() {
    const selectedDepartment = departments.find((department) => department.id === appointmentForm.departmentId) || departments[0];
    const requestedDate = `${appointmentForm.date}, ${appointmentForm.time}`;
    const selectedDoctor = selectedDepartment.doctors.find((doctor) => doctor.id === appointmentForm.doctorId);
    if (selectedDoctor && hasScheduleConflict(selectedDoctor.id, requestedDate)) {
      showAppError(`${selectedDoctor.name} already has a scheduled item at ${requestedDate}. Choose another time or auto assign.`);
      return;
    }
    const assignedDoctor =
      selectedDoctor ||
      [...selectedDepartment.doctors]
        .filter((doctor) => !hasScheduleConflict(doctor.id, requestedDate))
        .sort((a, b) => (doctorSchedules[a.id] || []).length - (doctorSchedules[b.id] || []).length)[0];
    if (!assignedDoctor) {
      showAppError(`No doctors are available in ${selectedDepartment.name} at ${requestedDate}. Choose another time.`);
      return;
    }
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
      date: requestedDate,
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
        showAppError(error.message || "Appointment request could not be synced.");
        return;
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
      { id: `n-${Date.now()}`, audience: "Provider", doctorId: assignedDoctor?.id, title: "New patient request", detail: `${currentUser.name} requested ${localAppointment.title}.`, date: "Just now", tag: "Request", hidden: false },
      ...current
    ]);
    setAppointmentForm((current) => ({ ...current, reason: "" }));
  }

  async function sendMessage() {
    if (!messageDraft.trim()) return;
    const departmentPatients = scopedDepartments.flatMap((department) => department.patients || []);
    const selectedMessagePatientId =
      currentUser.role === "Patient"
        ? currentUser.id
        : messageForm.patientId || departmentPatients[0]?.id || selectedProfilePatientId || "";
    const messagePayload = {
      detail: messageDraft.trim(),
      subject: messageForm.subject,
      category: messageForm.category,
      recipientRole: messageForm.recipientRole,
      recipientLabel: messageForm.recipientLabel,
      patientId: selectedMessagePatientId
    };

    if (authToken) {
      try {
        const data = await apiRequest("/api/messages", {
          method: "POST",
          token: authToken,
          body: messagePayload
        });
        setMessages(data.messages);
        if (data.notifications) setNotifications(data.notifications);
        setMessageDraft("");
        setApiStatus("Secure API connected");
        return;
      } catch (error) {
        showAppError(error.message || "Message could not be synced.");
        return;
      }
    }

    setMessages((current) => [
      {
        id: `m-${Date.now()}`,
        title: messageForm.subject || (currentUser.role === "Patient" ? "You to Care Team" : `${currentUser.name} secure note`),
        detail: `${messageForm.recipientLabel}: ${messageDraft.trim()}`,
        date: "Just now",
        tag: messageForm.category || currentUser.role,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        receiverRole: messageForm.recipientRole,
        recipientLabel: messageForm.recipientLabel,
        patientId: selectedMessagePatientId,
        departmentId: scopedDepartments[0]?.id,
        doctorId: scopedDepartments[0]?.doctors?.[0]?.id,
        hidden: false
      },
      ...current
    ]);
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
        setDepartments(departmentsWithDoctors(data.departments || departments));
        setPatientProfiles(data.patientProfiles || patientProfiles);
        setMedicalRecords(data.records || medicalRecords);
        await loadPortal(authToken);
        return;
      } catch (error) {
        showAppError(error.message || "Appointment status could not be synced.");
        return;
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
    if (status === "Approved" && target?.departmentId) {
      setDepartments((currentDepartments) => {
        const sourcePatient = currentDepartments.flatMap((department) => department.patients).find((patient) => patient.id === target.patientId || patient.name === target.patientName);
        return currentDepartments.map((department) => {
          if (department.id !== target.departmentId) return department;
          const alreadyAssigned = department.patients.some((patient) => patient.id === target.patientId || patient.name === target.patientName);
          if (alreadyAssigned) return department;
          const acceptedPatient = {
            id: target.patientId || `accepted-${Date.now()}`,
            name: target.patientName || sourcePatient?.name || "Accepted patient",
            age: sourcePatient?.age || "Not recorded",
            status: "Accepted",
            nextVisit: target.date || "Scheduled",
            concern: target.title || sourcePatient?.concern || "Accepted appointment"
          };
          return { ...department, patients: [acceptedPatient, ...department.patients] };
        });
      });
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
      ...activePatientProfile,
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
          body: { patientId: selectedPatient?.id, summary: profileDraft, riskLevel: activePatientProfile.riskLevel }
        });
        setPatientProfile(data.patientProfile);
        setPatientProfiles(data.patientProfiles || patientProfiles);
        setMedicalRecords(data.records || medicalRecords);
        setNotifications(data.notifications || notifications);
        await loadPortal(authToken);
        return;
      } catch (error) {
        showAppError(error.message || "Patient profile update could not be synced.");
        return;
      }
    }

    setPatientProfile(updated);
    setPatientProfiles((current) => ({ ...current, [selectedPatient?.id]: updated }));
    setMedicalRecords((current) => [
      {
        id: `rec-${selectedPatient?.id}-${Date.now()}`,
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.name,
        departmentId: scopedDepartments.find((department) => department.patients.some((patient) => patient.id === selectedPatient?.id))?.id,
        type: "Provider note",
        title: "Care profile updated",
        detail: profileDraft,
        date: "Just now",
        provider: currentUser.name,
        tag: updated.riskLevel,
        hidden: false
      },
      ...current
    ]);
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
      if (collection === "records") setMedicalRecords(toggle);
      if (collection === "transfers") setTransfers(toggle);
      addLocalAudit("Admin content changed", `${currentUser.name} changed visibility for ${collection} item ${id}. No delete was performed.`, "Critical");
    };

    if (authToken) {
      const source = { appointments, messages, notifications, records: medicalRecords, transfers }[collection] || [];
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
        setMedicalRecords(data.records || medicalRecords);
        setTransfers(data.transfers || transfers);
        await loadPortal(authToken);
        return;
      } catch (error) {
        showAppError(error.message || "Admin update could not be synced.");
        return;
      }
    }

    applyLocal();
  }

  async function adminChangeText(collection, id) {
    const source = { appointments, messages, notifications, records: medicalRecords, transfers }[collection] || [];
    const item = source.find((candidate) => candidate.id === id);
    const reviewedTitle = `${item?.title || item?.patientName || collection} (reviewed)`;
    const reviewedDetail = `${item?.detail || item?.reason || "Admin reviewed this item."} Admin reviewed and changed this item.`;

    if (authToken) {
      try {
        const data = await apiRequest(`/api/admin/items/${collection}/${id}`, {
          method: "PATCH",
          token: authToken,
          body: {
            title: reviewedTitle,
            detail: reviewedDetail
          }
        });
        setAppointments(data.appointments || appointments);
        setMessages(data.messages || messages);
        setNotifications(data.notifications || notifications);
        setMedicalRecords(data.records || medicalRecords);
        setTransfers(data.transfers || transfers);
        await loadPortal(authToken);
        return;
      } catch (error) {
        showAppError(error.message || "Admin change could not be synced.");
        return;
      }
    }

    const change = (items) =>
      items.map((item) =>
        item.id === id ? { ...item, title: reviewedTitle, detail: reviewedDetail, adminNote: "Changed by admin. Item was not deleted." } : item
      );
    if (collection === "appointments") setAppointments(change);
    if (collection === "messages") setMessages(change);
    if (collection === "notifications") setNotifications(change);
    if (collection === "records") setMedicalRecords(change);
    if (collection === "transfers") setTransfers(change);
    addLocalAudit("Admin content changed", `${currentUser.name} changed text for ${collection} item ${id}. No delete was performed.`, "Critical");
  }

  async function createPatientProfile() {
    const localPatientId = `p-local-${Date.now()}`;
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
        setPatientProfiles(data.patientProfiles || patientProfiles);
        setMedicalRecords(data.records || medicalRecords);
        await loadPortal(authToken);
        setNewPatientForm((current) => ({ ...current, name: "New Patient", concern: "Initial assessment" }));
        return;
      } catch (error) {
        showAppError(error.message || "Patient profile could not be created.");
        return;
      }
    }

    setDepartments((current) =>
      current.map((department) =>
        department.id === patient.departmentId
          ? {
              ...department,
              patients: [
                {
                  id: localPatientId,
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
    setPatientProfiles((current) => ({
      ...current,
      [localPatientId]: {
        patientId: localPatientId,
        patientName: patient.name,
        summary: `${patient.concern}. Status: ${patient.status}. Next visit: ${patient.nextVisit}.`,
        riskLevel: "Low",
        lastUpdatedBy: currentUser.name,
        updatedAt: "Just now",
        hidden: false
      }
    }));
    addLocalAudit("Patient profile created", `${currentUser.name} created ${patient.name}.`, "Important");
    setNewPatientForm((current) => ({ ...current, name: "New Patient", concern: "Initial assessment" }));
  }

  async function transferPatientDepartment(patientId, targetDepartmentId = transferForm.targetDepartmentId) {
    const sourceDepartment = departments.find((department) => department.patients.some((patient) => patient.id === patientId));
    const selectedPatient = sourceDepartment?.patients.find((patient) => patient.id === patientId);
    const targetDepartment = departments.find((department) => department.id === targetDepartmentId);
    const reason = transferForm.reason.trim() || "Clinical transfer requested";

    if (!selectedPatient || !sourceDepartment || !targetDepartment || sourceDepartment.id === targetDepartment.id) return;

    if (authToken) {
      try {
        const data = await apiRequest(`/api/patients/${patientId}/transfer`, {
          method: "PATCH",
          token: authToken,
          body: {
            targetDepartmentId: targetDepartment.id,
            reason
          }
        });
        setDepartments(departmentsWithDoctors(data.departments || departments));
        setNotifications(data.notifications || notifications);
        setPatientProfile(data.patientProfile || patientProfile);
        setPatientProfiles(data.patientProfiles || patientProfiles);
        setTransfers(data.transfers || transfers);
        await loadPortal(authToken);
        setTransferForm((current) => ({ ...current, reason: "Specialty care transfer requested" }));
        return;
      } catch (error) {
        showAppError(error.message || "Transfer request could not be synced.");
        return;
      }
    }

    const transfer = {
      id: `t-local-${Date.now()}`,
      patientId,
      patientName: selectedPatient.name,
      sourceDepartmentId: sourceDepartment.id,
      sourceDepartmentName: sourceDepartment.name,
      targetDepartmentId: targetDepartment.id,
      targetDepartmentName: targetDepartment.name,
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
      reason,
      status: "Requested",
      requestedAt: "Just now",
      hidden: false
    };
    setTransfers((current) => [transfer, ...current]);
    setDepartments((current) =>
      current.map((department) =>
        department.id === sourceDepartment.id
          ? {
              ...department,
              patients: department.patients.map((patient) => (patient.id === patientId ? { ...patient, status: "Transfer requested", concern: reason } : patient))
            }
          : department
      )
    );
    const providerNotifications = (targetDepartment.doctors || []).map((doctor) => ({
      id: `n-${Date.now()}-${doctor.id}`,
      audience: "Provider",
      doctorId: doctor.id,
      title: "Incoming patient transfer",
      detail: `${selectedPatient.name} is requested for transfer from ${sourceDepartment.name} to ${targetDepartment.name}. Reason: ${reason}.`,
      date: "Just now",
      tag: "Transfer",
      hidden: false
    }));
    setNotifications((current) => [
      {
        id: `n-${Date.now()}-patient`,
        audience: "Patient",
        patientId,
        title: "Department transfer requested",
        detail: `${currentUser.name} requested to transfer your care from ${sourceDepartment.name} to ${targetDepartment.name}.`,
        date: "Just now",
        tag: "Transfer",
        hidden: false
      },
      {
        id: `n-${Date.now()}-admin`,
        audience: "Admin",
        title: "Patient transfer requested",
        detail: `${currentUser.name} requested ${selectedPatient.name}'s transfer from ${sourceDepartment.name} to ${targetDepartment.name}.`,
        date: "Just now",
        tag: "Audit",
        hidden: false
      },
      ...providerNotifications,
      ...current
    ]);
    addLocalAudit("Patient transfer requested", `${currentUser.name} requested ${selectedPatient.name}'s transfer from ${sourceDepartment.name} to ${targetDepartment.name}. Reason: ${reason}.`, "Critical");
    setTransferForm((current) => ({ ...current, reason: "Specialty care transfer requested" }));
  }

  async function updateTransferStatus(transferId, status) {
    if (authToken) {
      try {
        const data = await apiRequest(`/api/transfers/${transferId}/status`, {
          method: "PATCH",
          token: authToken,
          body: { status }
        });
        setDepartments(departmentsWithDoctors(data.departments || departments));
        setTransfers(data.transfers || transfers);
        setNotifications(data.notifications || notifications);
        setPatientProfiles(data.patientProfiles || patientProfiles);
        setMedicalRecords(data.records || medicalRecords);
        setPatientProfile(data.patientProfile || patientProfile);
        await loadPortal(authToken);
        return;
      } catch (error) {
        showAppError(error.message || "Transfer decision could not be synced.");
        return;
      }
    }

    const transfer = transfers.find((item) => item.id === transferId);
    if (!transfer) return;
    setTransfers((current) => current.map((item) => (item.id === transferId ? { ...item, status, decidedAt: "Just now", decidedByName: currentUser.name } : item)));
    if (status === "Accepted") {
      const sourceDepartment = departments.find((department) => department.id === transfer.sourceDepartmentId);
      const targetDepartment = departments.find((department) => department.id === transfer.targetDepartmentId);
      const patient = sourceDepartment?.patients.find((candidate) => candidate.id === transfer.patientId);
      if (sourceDepartment && targetDepartment && patient) {
        const movedPatient = { ...patient, status: "Transferred", nextVisit: "Transfer intake pending", concern: transfer.reason };
        setDepartments((current) =>
          current.map((department) => {
            if (department.id === sourceDepartment.id) return { ...department, patients: department.patients.filter((candidate) => candidate.id !== transfer.patientId) };
            if (department.id === targetDepartment.id) return { ...department, patients: [movedPatient, ...department.patients] };
            return department;
          })
        );
      }
    }
    setNotifications((current) => [
      {
        id: `n-${Date.now()}-patient`,
        audience: "Patient",
        patientId: transfer.patientId,
        title: `Transfer ${status.toLowerCase()}`,
        detail: `${currentUser.name} ${status.toLowerCase()} your transfer request to ${transfer.targetDepartmentName}.`,
        date: "Just now",
        tag: status,
        hidden: false
      },
      ...current
    ]);
    addLocalAudit(`Patient transfer ${status.toLowerCase()}`, `${currentUser.name} ${status.toLowerCase()} ${transfer.patientName}'s transfer to ${transfer.targetDepartmentName}.`, "Critical");
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
        showAppError(error.message || "Doctor profile could not be created.");
        return;
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

  async function reviewAdminRequest(requestId, status) {
    if (authToken) {
      try {
        const data = await apiRequest(`/api/admin-requests/${requestId}/status`, {
          method: "PATCH",
          token: authToken,
          body: { status }
        });
        setAdminApprovalRequests(data.adminApprovalRequests || adminApprovalRequests);
        setNotifications(data.notifications || notifications);
        setAuditLogs(data.auditLogs || auditLogs);
        await loadPortal(authToken);
        return;
      } catch (error) {
        showAppError(error.message || "Admin request decision could not be saved.");
        return;
      }
    }

    setAdminApprovalRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              decidedAt: "Just now",
              decidedBy: currentUser.name,
              decisionNote: status === "Approved" ? "Verified by existing admin." : "Rejected by existing admin."
            }
          : request
      )
    );
    addLocalAudit(`Admin request ${status.toLowerCase()}`, `${currentUser.name} ${status.toLowerCase()} admin request ${requestId}.`, "Critical");
  }

  if (isRestoringSession) {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <View style={styles.authPage}>
          <View style={styles.authCard}>
            <Text style={styles.loginTitle}>CareBridge</Text>
            <Text style={styles.loginSubtitle}>Restoring secure session...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
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
            <Text style={styles.loginTitle}>{authMode === "forgot" ? "Reset password" : authMode === "login" ? "Sign in" : "Create account"}</Text>
            <Text style={styles.loginSubtitle}>
              {authMode === "forgot" ? "Verify your account and set a new password." : "Use your portal credentials to continue."}
            </Text>

            {authMode !== "forgot" && (
              <View style={styles.segment}>
                {["login", "register"].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.segmentButton, authMode === mode && styles.segmentButtonActive]}
                    onPress={() => switchAuthMode(mode)}
                  >
                    <Text style={[styles.segmentText, authMode === mode && styles.segmentTextActive]}>
                      {mode === "login" ? "Login" : "Register"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {authMode === "forgot" ? (
              <>
                <Field label="Account email" value={resetForm.email} onChangeText={(value) => updateResetForm("email", value)} placeholder="name@example.com" />
                <TouchableOpacity style={styles.secondaryButton} onPress={requestPasswordReset}>
                  <Text style={styles.secondaryButtonText}>Get Reset Code</Text>
                </TouchableOpacity>
                <Field label="Reset code" value={resetForm.code} onChangeText={(value) => updateResetForm("code", value)} placeholder="6-digit code" keyboardType="number-pad" />
                <Field
                  label="New password"
                  value={resetForm.password}
                  onChangeText={(value) => updateResetForm("password", value)}
                  placeholder="At least 6 characters"
                  secureTextEntry
                />
              </>
            ) : (
              <>
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
              </>
            )}

            {authNotice ? <Text style={styles.successText}>{authNotice}</Text> : null}
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={authMode === "forgot" ? completePasswordReset : handleAuth}>
              <Text style={styles.primaryButtonText}>
                {authMode === "forgot" ? "Update Password" : authMode === "login" ? "Enter Secure Portal" : "Create Secure Account"}
              </Text>
            </TouchableOpacity>

            {authMode === "login" ? (
              <TouchableOpacity style={styles.textButton} onPress={() => switchAuthMode("forgot")}>
                <Text style={styles.textButtonText}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}

            {authMode === "forgot" ? (
              <TouchableOpacity style={styles.textButton} onPress={() => switchAuthMode("login")}>
                <Text style={styles.textButtonText}>Back to sign in</Text>
              </TouchableOpacity>
            ) : null}

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
                onPress={signOut}
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
                onPress={signOut}
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

        <ScrollView style={styles.contentScroller} contentContainerStyle={[styles.content, !isWide && styles.mobileContent]}>
          {appError ? (
            <TouchableOpacity style={styles.accessNotice} onPress={() => setAppError("")}>
              <Text style={styles.errorText}>{appError}</Text>
              <Text style={styles.accessNoticeText}>Tap to dismiss.</Text>
            </TouchableOpacity>
          ) : null}
          {activeTab === "Dashboard" && (
            <Dashboard
              appointments={visibleAppointments}
              currentUser={currentUser}
              messages={visibleMessages}
              notifications={visibleNotifications}
              patientProfile={activePatientProfile}
              records={visibleRecords}
              departments={scopedDepartments}
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
              appointments={visibleAppointments}
              currentUser={currentUser}
              departments={scopedDepartments}
              doctorSchedules={doctorSchedules}
              role={role}
              scheduleAppointment={scheduleAppointment}
              setAppointmentForm={setAppointmentForm}
              updateAppointmentStatus={updateAppointmentStatus}
              isWide={isWide}
            />
          )}
          {activeTab === "Messages" && (
            <MessagesView
              currentUser={currentUser}
              departments={scopedDepartments}
              messageDraft={messageDraft}
              messageForm={messageForm}
              messages={visibleMessages}
              notifications={visibleNotifications}
              role={role}
              sendMessage={sendMessage}
              setMessageDraft={setMessageDraft}
              setMessageForm={setMessageForm}
            />
          )}
          {activeTab === "Records" && (
            <RecordsView
              masked={masked}
              patientProfile={activePatientProfile}
              patientProfiles={patientProfiles}
              records={visibleRecords}
              profileDraft={profileDraft}
              currentUser={currentUser}
              departments={scopedDepartments}
              targetDepartments={departments}
              newPatientForm={newPatientForm}
              transferForm={transferForm}
              transfers={transfers}
              selectedProfilePatientId={selectedProfilePatientId}
              role={role}
              setMasked={setMasked}
              setProfileDraft={setProfileDraft}
              setNewPatientForm={setNewPatientForm}
              setTransferForm={setTransferForm}
              setSelectedProfilePatientId={setSelectedProfilePatientId}
              createPatientProfile={createPatientProfile}
              transferPatientDepartment={transferPatientDepartment}
              updateTransferStatus={updateTransferStatus}
              updatePatientProfile={updatePatientProfile}
              isWide={isWide}
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
              passwordChangeForm={passwordChangeForm}
              passwordChangeNotice={passwordChangeNotice}
              passwordChangeError={passwordChangeError}
              setPasswordChangeForm={updatePasswordChangeForm}
              changePassword={changePassword}
            />
          )}
          {activeTab === "Admin" && (
            <AdminView
              adminApprovalRequests={adminApprovalRequests}
              appointments={appointments}
              auditLogs={auditLogs}
              departments={departments}
              messages={messages}
              notifications={notifications}
              records={medicalRecords}
              transfers={transfers}
              newDoctorForm={newDoctorForm}
              setNewDoctorForm={setNewDoctorForm}
              createDoctorProfile={createDoctorProfile}
              reviewAdminRequest={reviewAdminRequest}
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
