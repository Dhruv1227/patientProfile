import { StyleSheet } from "react-native";

export const palette = {
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


export const styles = StyleSheet.create({
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
  disabledButton: {
    backgroundColor: "#94a3b8"
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
  successText: {
    color: palette.green,
    fontWeight: "800",
    lineHeight: 20
  },
  textButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  textButtonText: {
    color: palette.teal,
    fontWeight: "900"
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
    backgroundColor: palette.softer,
    minHeight: 0
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
  contentScroller: {
    flex: 1,
    minHeight: 0
  },
  mobileContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 112
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
  amberText: {
    color: palette.amber
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
    flexWrap: "wrap",
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
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
    maxWidth: "100%",
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    gap: 10
  },
  flowPanel: {
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
    alignSelf: "stretch"
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
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 2,
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
    flexShrink: 0,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 8,
    paddingBottom: 10
  },
  mobileTabScroller: {
    paddingHorizontal: 8,
    gap: 4
  },
  mobileTab: {
    width: 58,
    minHeight: 56,
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
    fontSize: 10,
    fontWeight: "900"
  },
  mobileTabTextActive: {
    color: "#ffffff"
  }
});
