export function providerDoctorIdsForUser(departments, user) {
  if (!user || user.role !== "Provider") return [];
  return departments
    .flatMap((department) => department.doctors || [])
    .filter((doctor) => doctor.email === user.email || doctor.name === user.name || doctor.id === user.id)
    .map((doctor) => doctor.id);
}

export function patientIdsForUser(departments, user) {
  if (!user || user.role !== "Patient") return [];
  const ids = new Set([user.id]);
  departments
    .flatMap((department) => department.patients || [])
    .filter((patient) => patient.id === user.id || patient.userId === user.id || patient.name === user.name)
    .forEach((patient) => ids.add(patient.id));
  return [...ids];
}

export function providerDepartmentIdsForUser(departments, user) {
  if (!user || user.role !== "Provider") return [];
  const doctorIds = providerDoctorIdsForUser(departments, user);
  return departments
    .filter((department) => (department.doctors || []).some((doctor) => doctorIds.includes(doctor.id)))
    .map((department) => department.id);
}

export function departmentsForUser(departments, user) {
  if (!user || user.role !== "Provider") return departments;
  const departmentIds = providerDepartmentIdsForUser(departments, user);
  return departments.filter((department) => departmentIds.includes(department.id));
}

export function appointmentsForUser(appointments, user, departments) {
  if (!user) return [];
  const visible = appointments.filter((item) => !item.hidden);
  if (user.role === "Admin") return appointments;
  if (user.role === "Patient") {
    const patientIds = patientIdsForUser(departments, user);
    return visible.filter((item) => item.patientId && patientIds.includes(item.patientId));
  }
  if (user.role === "Provider") {
    const doctorIds = providerDoctorIdsForUser(departments, user);
    return visible.filter((item) => item.doctorId && doctorIds.includes(item.doctorId));
  }
  return visible;
}

export function notificationsForUser(notifications, user, departments) {
  if (!user) return [];
  if (user.role === "Admin") return notifications;
  const doctorIds = providerDoctorIdsForUser(departments, user);
  const patientIds = patientIdsForUser(departments, user);
  return notifications.filter((item) => {
    if (item.hidden) return false;
    if (item.audience !== user.role) return false;
    if (user.role === "Patient") return !item.patientId || patientIds.includes(item.patientId);
    if (user.role === "Provider") return !item.doctorId || doctorIds.includes(item.doctorId);
    return true;
  });
}

export function messagesForUser(messages, user, departments) {
  if (!user) return [];
  if (user.role === "Admin") return messages;
  const visible = messages.filter((item) => !item.hidden);
  if (user.role === "Patient") {
    const patientIds = patientIdsForUser(departments, user);
    return visible.filter(
      (item) =>
        item.patientId && patientIds.includes(item.patientId) ||
        item.senderId === user.id ||
        item.receiverId === user.id
    );
  }
  if (user.role === "Provider") {
    const doctorIds = providerDoctorIdsForUser(departments, user);
    const departmentIds = providerDepartmentIdsForUser(departments, user);
    return visible.filter(
      (item) =>
        doctorIds.includes(item.doctorId) ||
        item.senderId === user.id ||
        item.receiverId === user.id ||
        departmentIds.includes(item.departmentId)
    );
  }
  return visible;
}

export function recordsForUser(records, user, departments) {
  if (!user) return [];
  if (user.role === "Admin") return records;
  const visible = records.filter((item) => !item.hidden);
  if (user.role === "Patient") {
    const patientIds = patientIdsForUser(departments, user);
    return visible.filter((item) => !item.patientId || patientIds.includes(item.patientId));
  }
  if (user.role === "Provider") {
    const departmentIds = providerDepartmentIdsForUser(departments, user);
    return visible.filter((item) => item.departmentId && departmentIds.includes(item.departmentId));
  }
  return visible;
}

export function profileForUser(patientProfiles, fallbackProfile, user, departments, selectedPatientId) {
  if (!patientProfiles || Array.isArray(patientProfiles)) return fallbackProfile;
  if (user?.role === "Patient") {
    const ids = patientIdsForUser(departments, user);
    return ids.map((id) => patientProfiles[id]).find(Boolean) || fallbackProfile;
  }
  if (selectedPatientId && patientProfiles[selectedPatientId]) return patientProfiles[selectedPatientId];
  return fallbackProfile;
}

export function maskedName(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || "Patient";
  return `${parts[0]} ${parts[1][0]}.`;
}

export function patientOperationalSummary(patient) {
  if (!patient) return "";
  return `${patient.concern}. Status: ${patient.status}. Next visit: ${patient.nextVisit}.`;
}



export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}
