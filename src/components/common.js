import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

function PageHeader({ title, subtitle }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Panel({ title, items, masked = false, action, onAction, flow = false }) {
  return (
    <View style={[styles.panel, flow && styles.flowPanel]}>
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
      {!items.length ? (
        <RecordCard item={{ title: "No items", detail: "Nothing needs attention in this section right now.", date: "Current", tag: "Clear" }} />
      ) : null}
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



export {
  Field,
  MiniMetric,
  PageHeader,
  Panel,
  RecordCard,
  ToggleRow,
  initials,
  tabIcon
};
