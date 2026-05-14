import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { adminItems, visitReadinessTasks, vitals } from "../data/portalSeed";
import { Field, MiniMetric, PageHeader, Panel, RecordCard, ToggleRow } from "../components/common";
import { maskedName, patientOperationalSummary } from "../utils/roleScope";
import { styles } from "../styles";

function Dashboard({ appointments, currentUser, messages, notifications, patientProfile, records, departments, masked, operationalTasks, quickActions, role, apiStatus, setActiveTab, setMasked, isWide }) {
  const firstName = currentUser.name.split(" ")[0];
  const totalPatients = departments.reduce((sum, department) => sum + department.patients.length, 0);
  const pendingRequests = appointments.filter((item) => item.status === "Pending").length;
  const identityTitle = role === "Patient" ? (masked ? "Protected profile" : "Patient profile") : role === "Provider" ? "Provider workspace" : "Admin workspace";
  const identityValue = role === "Patient" && masked ? maskedName(currentUser.name) : currentUser.name;
  const identityPrimaryLine = role === "Patient" && masked ? "MRN hidden" : currentUser.mrn;
  const dashboardRecords =
    role === "Patient"
      ? records.slice(0, 3)
      : departments
          .flatMap((department) =>
            department.patients.map((patient) => ({
              title: patient.name,
              detail: patientOperationalSummary(patient),
              date: department.name,
              tag: patient.status
            }))
          )
          .slice(0, 3);
  const profileCard =
    role === "Patient"
      ? { title: "Clinical summary", detail: patientProfile.hidden ? "Hidden by admin" : patientProfile.summary, date: patientProfile.updatedAt, tag: patientProfile.riskLevel }
      : role === "Provider"
        ? {
            title: `${currentUser.name} care workspace`,
            detail: departments.length ? `Assigned to ${departments.map((department) => department.name).join(", ")} with ${totalPatients} active department patients.` : "No department assignment found.",
            date: `${pendingRequests} pending request${pendingRequests === 1 ? "" : "s"}`,
            tag: "Provider"
          }
        : {
            title: "Clinic operations workspace",
            detail: `Monitoring ${totalPatients} patients, ${departments.length} departments, access controls, and audit activity.`,
            date: "Live",
            tag: "Admin"
          };

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
          <Text style={styles.identityLabel}>{identityTitle}</Text>
          <Text style={styles.identityValue}>{identityValue}</Text>
          <Text style={styles.identityLine}>{identityPrimaryLine}</Text>
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
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Pending requests</Text>
              <Text style={styles.metricValue}>{pendingRequests}</Text>
              <Text style={[styles.metricTrend, styles.amberText]}>Needs review</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Notifications</Text>
              <Text style={styles.metricValue}>{notifications.length}</Text>
              <Text style={[styles.metricTrend, styles.tealText]}>Role scoped</Text>
            </View>
          </>
        ) : (
          vitals.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{masked ? "--" : item.value}</Text>
              <Text style={[styles.metricTrend, styles[`${item.tone}Text`]]}>{item.trend}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.controlsRow}>
        <Text style={styles.sectionTitle}>Today at a Glance</Text>
        <TouchableOpacity style={styles.smallButton} onPress={() => setMasked(!masked)}>
          <Text style={styles.smallButtonText}>{masked ? "Show PHI" : "Mask PHI"}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.workspaceGrid, isWide && styles.workspaceGridWide]}>
        <Panel title={role === "Provider" ? "Doctor Requests" : "Upcoming Appointments"} items={appointments.slice(0, 3)} action="Open scheduler" onAction={() => setActiveTab("Appointments")} />
        <Panel title="Operational Tasks" items={operationalTasks} action={role === "Patient" ? "Open visits" : "Open records"} onAction={() => setActiveTab(role === "Patient" ? "Appointments" : "Records")} />
        <Panel title="Notifications" items={notifications.slice(0, 3)} action="Open messages" onAction={() => setActiveTab("Messages")} />
        {role !== "Patient" ? <DepartmentPanel departments={departments} /> : null}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{role === "Patient" ? "Patient Profile" : "Workspace Summary"}</Text>
          <RecordCard item={profileCard} />
        </View>
        <Panel title={role === "Patient" ? "Recent Records" : "Department Patient Notes"} items={dashboardRecords} masked={role === "Patient" && masked} action="View chart" onAction={() => setActiveTab("Records")} />
      </View>
    </View>
  );
}

function DepartmentPanel({ departments, flow = false }) {
  return (
    <View style={[styles.panel, flow && styles.flowPanel]}>
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

function ChoiceGroup({ children, scroll }) {
  if (scroll) {
    return (
      <ScrollView horizontal style={styles.filterScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.filterWrap}>{children}</View>;
}

function AppointmentsView({ appointmentForm, appointments, currentUser, departments, doctorSchedules, role, scheduleAppointment, setAppointmentForm, updateAppointmentStatus, isWide }) {
  const pending = appointments.filter((item) => item.status === "Pending" && !item.hidden);
  const visibleAppointments = role === "Admin" ? appointments : appointments.filter((item) => !item.hidden);
  const canReviewRequests = role === "Provider" || role === "Admin";
  const selectedDepartment = departments.find((department) => department.id === appointmentForm.departmentId) || departments[0];
  const selectedDoctor = selectedDepartment?.doctors.find((doctor) => doctor.id === appointmentForm.doctorId);
  const scopedDoctorIds = departments.flatMap((department) => department.doctors || []).map((doctor) => doctor.id);
  const scheduleItems = Object.entries(doctorSchedules).filter(([doctorId]) => role === "Admin" || scopedDoctorIds.includes(doctorId)).flatMap(([doctorId, slots]) =>
    slots.map((slot) => {
      const doctor = departments.flatMap((department) => department.doctors || []).find((candidate) => candidate.id === doctorId);
      return { title: doctor?.name || doctorId, detail: slot.title, date: slot.date, tag: slot.status };
    })
  );

  return (
    <View style={styles.screen}>
      <PageHeader
        title={role === "Provider" ? "Doctor Panel" : role === "Admin" ? "Appointment Operations" : "Appointments"}
        subtitle={canReviewRequests ? "Approve, reject, and monitor patient appointment requests." : "Book, review, and prepare for upcoming healthcare visits."}
      />
      <View style={[styles.twoColumn, isWide && styles.twoColumnWide]}>
        {canReviewRequests ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{role === "Admin" ? "All Patient Requests" : "Patient Requests"}</Text>
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
            <ChoiceGroup scroll={isWide}>
              {departments.map((department) => (
                <TouchableOpacity
                  key={department.id}
                  style={[styles.filterPill, appointmentForm.departmentId === department.id && styles.filterPillActive]}
                  onPress={() => setAppointmentForm((current) => ({ ...current, departmentId: department.id, doctorId: "" }))}
                >
                  <Text style={[styles.filterText, appointmentForm.departmentId === department.id && styles.filterTextActive]}>{department.name}</Text>
                </TouchableOpacity>
              ))}
            </ChoiceGroup>
            <Text style={styles.inputLabel}>Doctor</Text>
            <ChoiceGroup scroll={isWide}>
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
            </ChoiceGroup>
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

function optionForRole(role) {
  if (role === "Patient") {
    return [
      { label: "Care Team", recipientRole: "Provider", category: "Care", subject: "Care question" },
      { label: "Billing", recipientRole: "Admin", category: "Billing", subject: "Billing question" },
      { label: "Pharmacy", recipientRole: "Provider", category: "Medication", subject: "Medication question" }
    ];
  }
  if (role === "Provider") {
    return [
      { label: "Patient", recipientRole: "Patient", category: "Care", subject: "Care team update" },
      { label: "Admin", recipientRole: "Admin", category: "Operations", subject: "Operational note" }
    ];
  }
  return [
    { label: "Patient", recipientRole: "Patient", category: "Portal", subject: "Portal update" },
    { label: "Provider", recipientRole: "Provider", category: "Operations", subject: "Admin note" }
  ];
}

function MessagesView({ currentUser, departments, messageDraft, messageForm, messages, notifications, role, sendMessage, setMessageDraft, setMessageForm }) {
  const roleNotifications = notifications.filter((item) => role === "Admin" || item.audience === role);
  const recipientOptions = optionForRole(role);
  React.useEffect(() => {
    if (!recipientOptions.some((option) => option.label === messageForm.recipientLabel)) {
      const defaultOption = recipientOptions[0];
      setMessageForm((current) => ({
        ...current,
        recipientRole: defaultOption.recipientRole,
        recipientLabel: defaultOption.label,
        category: defaultOption.category,
        subject: defaultOption.subject
      }));
    }
  }, [messageForm.recipientLabel, recipientOptions, setMessageForm]);
  const categories = role === "Patient" ? ["Care", "Billing", "Medication", "Lab"] : ["Care", "Operations", "Follow-up", "Referral"];
  const patientOptions = departments.flatMap((department) => department.patients.map((patient) => ({ ...patient, departmentName: department.name })));
  const selectedPatient = patientOptions.find((patient) => patient.id === messageForm.patientId) || patientOptions[0];
  const showPatientPicker = role !== "Patient" && patientOptions.length > 0;
  const recipientName =
    role === "Patient"
      ? messageForm.recipientLabel
      : messageForm.recipientRole === "Patient"
        ? selectedPatient?.name || "selected patient"
        : messageForm.recipientLabel;
  const routeDetail =
    role === "Patient"
      ? `From ${currentUser.name} to ${messageForm.recipientLabel}. This message is attached to the patient's care record.`
      : selectedPatient
        ? `From ${currentUser.name} to ${recipientName}. Patient context: ${selectedPatient.name}, ${selectedPatient.departmentName}.`
        : `From ${currentUser.name} to ${recipientName}.`;
  const updateMessageForm = (patch) => setMessageForm((current) => ({ ...current, ...patch }));

  return (
    <View style={styles.screen}>
      <PageHeader title="Messages" subtitle="Secure communication with providers, billing, and care coordination." />
      <Panel title={`${role} Notifications`} items={roleNotifications} />
      <View style={[styles.panel, styles.flowPanel]}>
        <Text style={styles.panelTitle}>New Secure Message</Text>
        <Text style={styles.inputLabel}>Route message to</Text>
        <View style={styles.filterWrap}>
          {recipientOptions.map((option) => {
            const active = messageForm.recipientLabel === option.label;
            return (
              <TouchableOpacity
                key={option.label}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => updateMessageForm({
                  recipientRole: option.recipientRole,
                  recipientLabel: option.label,
                  category: option.category,
                  subject: option.subject
                })}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {showPatientPicker ? (
          <>
            <Text style={styles.inputLabel}>{messageForm.recipientRole === "Patient" ? "Patient recipient" : "Patient context"}</Text>
            <View style={styles.filterWrap}>
              {patientOptions.map((patient) => {
                const active = (messageForm.patientId || selectedPatient?.id) === patient.id;
                return (
                  <TouchableOpacity
                    key={patient.id}
                    style={[styles.filterPill, active && styles.filterPillActive]}
                    onPress={() => updateMessageForm({ patientId: patient.id })}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>{patient.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}
        <Text style={styles.inputLabel}>Message category</Text>
        <View style={styles.filterWrap}>
          {categories.map((category) => {
            const active = messageForm.category === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => updateMessageForm({ category })}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Field label="Subject" value={messageForm.subject} onChangeText={(subject) => updateMessageForm({ subject })} />
        <TextInput
          style={styles.messageInput}
          multiline
          numberOfLines={4}
          value={messageDraft}
          onChangeText={setMessageDraft}
          placeholder="Write a message to your care team..."
          placeholderTextColor="#82918d"
        />
        <RecordCard
          item={{
            title: "Route preview",
            detail: routeDetail,
            date: messageForm.category,
            tag: messageForm.recipientLabel
          }}
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
  currentUser,
  departments,
  targetDepartments,
  patientProfiles,
  records,
  newPatientForm,
  transferForm,
  transfers,
  selectedProfilePatientId,
  role,
  setMasked,
  setProfileDraft,
  setNewPatientForm,
  setTransferForm,
  setSelectedProfilePatientId,
  createPatientProfile,
  transferPatientDepartment,
  updateTransferStatus,
  updatePatientProfile,
  isWide
}) {
  const allPatients = departments.flatMap((department) => department.patients.map((patient) => ({ ...patient, departmentId: department.id, departmentName: department.name })));
  const selectedPatient = allPatients.find((patient) => patient.id === selectedProfilePatientId) || allPatients[0];
  const selectedProfile = selectedPatient ? patientProfiles?.[selectedPatient.id] : null;
  const transferDepartments = (targetDepartments || departments).filter((department) => department.id !== selectedPatient?.departmentId);
  const selectedTransferDepartment = transferDepartments.find((department) => department.id === transferForm?.targetDepartmentId) || transferDepartments[0];
  const visibleTransfers = (transfers || []).filter((transfer) => role === "Admin" || transfer.status === "Requested");
  const selectedPendingTransfer = selectedPatient ? (transfers || []).find((transfer) => transfer.patientId === selectedPatient.id && transfer.status === "Requested") : null;
  const incomingTransfers = visibleTransfers.filter((transfer) => role === "Admin" || transfer.targetDepartmentId === selectedPatient?.departmentId || departments.some((department) => department.id === transfer.targetDepartmentId));
  const selectedSummary =
    selectedProfile
      ? selectedProfile.summary
      : selectedPatient && patientProfile.patientId === selectedPatient.id
        ? patientProfile.summary
      : patientOperationalSummary(selectedPatient);
  const selectedUpdatedAt = selectedProfile?.updatedAt || (selectedPatient && patientProfile.patientId === selectedPatient.id ? patientProfile.updatedAt : selectedPatient?.nextVisit || "Current");
  const selectedRisk = selectedProfile?.riskLevel || (selectedPatient && patientProfile.patientId === selectedPatient.id ? patientProfile.riskLevel : selectedPatient?.status || "Active");
  const profileTitle =
    role === "Patient"
      ? patientProfile.patientName ? `${patientProfile.patientName} care summary` : "Care summary"
      : selectedPatient ? `${selectedPatient.name} care summary` : `${currentUser.name} patient workspace`;
  const historyItems =
    role === "Patient"
      ? records
      : allPatients.map((patient) => ({
          title: patient.name,
          detail: patientOperationalSummary(patient),
          date: patient.departmentName,
          tag: patient.status
        }));

  return (
    <View style={styles.screen}>
      <PageHeader title={role === "Provider" ? "Doctor Patient Panel" : "Medical Records"} subtitle="Clinical history, labs, medication, allergies, and provider notes." />
      <View style={[styles.panel, styles.flowPanel]}>
        <Text style={styles.panelTitle}>Patient Profile</Text>
        <RecordCard
          item={{
            title: profileTitle,
            detail: patientProfile.hidden ? "Hidden by admin" : role === "Patient" ? patientProfile.summary : selectedSummary,
            date: role === "Patient" ? patientProfile.updatedAt : selectedUpdatedAt,
            tag: role === "Patient" ? patientProfile.riskLevel : selectedRisk
          }}
        />
        {role === "Provider" || role === "Admin" ? (
          <>
            <Text style={styles.inputLabel}>Select patient to update</Text>
            <ChoiceGroup scroll={isWide}>
              {allPatients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.filterPill, selectedProfilePatientId === patient.id && styles.filterPillActive]}
                  onPress={() => {
                    setSelectedProfilePatientId(patient.id);
                    setProfileDraft(patientProfiles?.[patient.id]?.summary || (patientProfile.patientId === patient.id ? patientProfile.summary : patientOperationalSummary(patient)));
                  }}
                >
                  <Text style={[styles.filterText, selectedProfilePatientId === patient.id && styles.filterTextActive]}>{patient.name}</Text>
                </TouchableOpacity>
              ))}
            </ChoiceGroup>
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
      {(role === "Provider" || role === "Admin") && selectedPatient ? (
        <View style={[styles.panel, styles.flowPanel]}>
          <Text style={styles.panelTitle}>Transfer Department</Text>
          <RecordCard
            item={{
              title: selectedPatient.name,
              detail: `${selectedPatient.name} is currently assigned to ${selectedPatient.departmentName}.`,
              date: selectedPatient.nextVisit || "Current care team",
              tag: selectedPatient.status || "Active"
            }}
          />
          <Text style={styles.inputLabel}>Target department</Text>
          <ChoiceGroup scroll={isWide}>
            {transferDepartments.map((department) => (
              <TouchableOpacity
                key={department.id}
                style={[styles.filterPill, selectedTransferDepartment?.id === department.id && styles.filterPillActive]}
                onPress={() => setTransferForm((current) => ({ ...current, targetDepartmentId: department.id }))}
              >
                <Text style={[styles.filterText, selectedTransferDepartment?.id === department.id && styles.filterTextActive]}>{department.name}</Text>
              </TouchableOpacity>
            ))}
          </ChoiceGroup>
          <Field label="Transfer reason" value={transferForm?.reason || ""} onChangeText={(value) => setTransferForm((current) => ({ ...current, reason: value }))} />
          <TouchableOpacity
            style={[styles.primaryButton, (!selectedTransferDepartment || selectedPendingTransfer) && styles.disabledButton]}
            disabled={!selectedTransferDepartment || Boolean(selectedPendingTransfer)}
            onPress={() => transferPatientDepartment(selectedPatient.id, selectedTransferDepartment?.id)}
          >
            <Text style={styles.primaryButtonText}>
              {selectedPendingTransfer ? "Transfer Request Pending" : `Transfer to ${selectedTransferDepartment?.name || "Department"}`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {role === "Provider" || role === "Admin" ? (
        <View style={[styles.panel, styles.flowPanel]}>
          <Text style={styles.panelTitle}>Incoming Transfer Requests</Text>
          {incomingTransfers.length === 0 ? <RecordCard item={{ title: "No transfer requests", detail: "There are no pending department transfers for this workspace.", date: "Now", tag: "Clear" }} /> : null}
          {incomingTransfers.map((transfer) => (
            <View key={transfer.id} style={styles.actionCard}>
              <RecordCard
                item={{
                  title: transfer.patientName,
                  detail: `${transfer.sourceDepartmentName} to ${transfer.targetDepartmentName}. ${transfer.reason}`,
                  date: transfer.requestedAt || transfer.decidedAt || "Transfer",
                  tag: transfer.status
                }}
              />
              {transfer.status === "Requested" ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.approveButton} onPress={() => updateTransferStatus(transfer.id, "Accepted")}>
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={() => updateTransferStatus(transfer.id, "Rejected")}>
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      {role === "Provider" || role === "Admin" ? (
        <View style={[styles.panel, styles.flowPanel]}>
          <Text style={styles.panelTitle}>Create Patient Profile</Text>
          <Field label="Patient name" value={newPatientForm.name} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, name: value }))} />
          <Field label="Age" value={String(newPatientForm.age)} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, age: value }))} />
          <Field label="Status" value={newPatientForm.status} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, status: value }))} />
          <Field label="Next visit" value={newPatientForm.nextVisit} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, nextVisit: value }))} />
          <Field label="Concern" value={newPatientForm.concern} onChangeText={(value) => setNewPatientForm((current) => ({ ...current, concern: value }))} />
          <Text style={styles.inputLabel}>Department</Text>
          <ChoiceGroup scroll={isWide}>
            {departments.map((department) => (
              <TouchableOpacity
                key={department.id}
                style={[styles.filterPill, newPatientForm.departmentId === department.id && styles.filterPillActive]}
                onPress={() => setNewPatientForm((current) => ({ ...current, departmentId: department.id }))}
              >
                <Text style={[styles.filterText, newPatientForm.departmentId === department.id && styles.filterTextActive]}>{department.name}</Text>
              </TouchableOpacity>
            ))}
          </ChoiceGroup>
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
      <Panel title={role === "Patient" ? "Health History" : "Department Patient List"} items={historyItems} masked={role === "Patient" && masked} />
    </View>
  );
}

function SearchView({ filter, filteredItems, query, setFilter, setQuery }) {
  const filters = ["All", "Visit", "Lab", "Medication", "Transfer", "Provider note", "Alert", "Confirmed", "Unread", "Settings"];

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

function AdminView({
  adminApprovalRequests,
  appointments,
  auditLogs,
  departments,
  messages,
  notifications,
  records,
  transfers,
  newDoctorForm,
  setNewDoctorForm,
  createDoctorProfile,
  reviewAdminRequest,
  adminToggleHidden,
  adminChangeText
}) {
  const totalPatients = departments.reduce((sum, department) => sum + department.patients.length, 0);
  const totalDoctors = departments.reduce((sum, department) => sum + (department.doctors || []).length, 0);
  const pendingAdminRequests = (adminApprovalRequests || []).filter((request) => request.status === "Requested").length;
  return (
    <View style={styles.screen}>
      <PageHeader title="Admin Panel" subtitle="Admin can hide/show or change portal content. Nothing is deleted." />
      <View style={styles.metricGrid}>
        <MiniMetric label="Active users" value={String(totalPatients + totalDoctors + 1)} />
        <MiniMetric label="Departments" value={String(departments.length)} />
        <MiniMetric label="Patients" value={String(totalPatients)} />
        <MiniMetric label="Hidden items" value={String([...appointments, ...messages, ...notifications, ...records, ...transfers].filter((item) => item.hidden).length)} />
        <MiniMetric label="Admin requests" value={String(pendingAdminRequests)} />
        <MiniMetric label="Audit events" value={String(auditLogs.length)} />
      </View>
      <DepartmentPanel departments={departments} flow />
      <AdminApprovalQueue requests={adminApprovalRequests || []} onDecision={reviewAdminRequest} />
      <View style={[styles.panel, styles.flowPanel]}>
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
      <Panel title="Access and Compliance" items={adminItems} flow />
      <Panel
        title="Security Activity Log"
        flow
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
      <AdminCollection title="Manage Medical Records" collection="records" items={records} onHide={adminToggleHidden} onChange={adminChangeText} />
      <AdminCollection
        title="Manage Transfer Requests"
        collection="transfers"
        items={transfers.map((transfer) => ({
          ...transfer,
          title: transfer.title || transfer.patientName,
          detail: transfer.detail || `${transfer.sourceDepartmentName} to ${transfer.targetDepartmentName}. ${transfer.reason}`,
          date: transfer.requestedAt || transfer.decidedAt || "Transfer",
          tag: transfer.status
        }))}
        onHide={adminToggleHidden}
        onChange={adminChangeText}
      />
    </View>
  );
}

function AdminApprovalQueue({ requests, onDecision }) {
  const sortedRequests = [...requests].sort((a, b) => (a.status === "Requested" ? -1 : 1) - (b.status === "Requested" ? -1 : 1));

  return (
    <View style={[styles.panel, styles.flowPanel]}>
      <Text style={styles.panelTitle}>Admin Approval Hierarchy</Text>
      <Text style={styles.recordDetail}>New admin accounts stay pending until an existing admin verifies the person and approves access.</Text>
      {sortedRequests.map((request) => (
        <View key={request.id} style={styles.actionCard}>
          <RecordCard
            item={{
              title: request.name,
              detail: `${request.email}. ${request.verificationNote || request.decisionNote || "Verify identity and role before approval."}`,
              date: request.decidedAt ? `${request.status} by ${request.decidedBy || "admin"} on ${request.decidedAt}` : request.requestedAt || "Requested",
              tag: request.status
            }}
          />
          {request.status === "Requested" ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.approveButton} onPress={() => onDecision(request.id, "Approved")}>
                <Text style={styles.actionButtonText}>Approve Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => onDecision(request.id, "Rejected")}>
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ))}
      {!sortedRequests.length ? <RecordCard item={{ title: "No admin requests", detail: "There are no pending admin access requests.", date: "Current", tag: "Clear" }} /> : null}
    </View>
  );
}

function AdminCollection({ title, collection, items, onHide, onChange }) {
  return (
    <View style={[styles.panel, styles.flowPanel]}>
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
      {!items.length ? <RecordCard item={{ title: "No items", detail: "There are no records in this collection yet.", date: "Current", tag: "Clear" }} /> : null}
    </View>
  );
}



export {
  AdminView,
  AppointmentsView,
  Dashboard,
  MessagesView,
  RecordsView,
  SearchView,
  SecurityView
};
