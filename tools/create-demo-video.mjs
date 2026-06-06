import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const screenshotDir = path.join(rootDir, "docs", "screenshots");
const outputDir = path.join(rootDir, "docs", "demo");
const workDir = path.join(outputDir, ".video-work");
const outputFile = path.join(outputDir, "carebridge-demo.mp4");
const silentFlag = process.argv.includes("--silent");
const sceneDurationSeconds = 8;

const scenes = [
  {
    image: "login-mobile.png",
    title: "Secure Portal Access",
    caption: "Login, registration, admin approval, and forgot-password recovery are handled from a simple mobile-first entry screen.",
    narration: "CareBridge begins with secure portal access. Users can sign in, register, or reset a forgotten password with a short local demo code."
  },
  {
    image: "patient-dashboard-mobile.png",
    title: "Patient Dashboard",
    caption: "Patients see a personalized landing page with health summary, care team context, notifications, and quick navigation.",
    narration: "The patient dashboard gives each patient a personalized overview of their care, upcoming work, and notifications."
  },
  {
    image: "patient-appointments-mobile.png",
    title: "Appointment Scheduling",
    caption: "Patients choose a department and doctor, or let the portal auto-assign the doctor with the lightest available schedule.",
    narration: "Patients can request appointments, pick a department, choose a doctor, or let CareBridge assign the best available provider."
  },
  {
    image: "patient-messages-mobile.png",
    title: "Patient Message Routing",
    caption: "Messages route to care team, billing, or pharmacy with category, subject, and patient record context.",
    narration: "Secure messages are routed by destination and category, so the right team receives the right patient context."
  },
  {
    image: "provider-dashboard-desktop.png",
    title: "Provider Dashboard",
    caption: "Doctors see department-scoped requests, operational tasks, patient panels, notifications, and masked health information controls.",
    narration: "Providers get a department-scoped dashboard for requests, patient panels, notifications, and day-to-day care coordination."
  },
  {
    image: "provider-messages-desktop.png",
    title: "Provider Messaging",
    caption: "Providers select a patient, route the message, preview the destination, and send scoped communication.",
    narration: "Doctors can send messages with a selected patient context, route preview, subject, and category."
  },
  {
    image: "provider-transfers-mobile.png",
    title: "Department Transfers",
    caption: "Doctors can request transfers between departments, and the receiving team can approve or reject the handoff.",
    narration: "When a patient needs another department, providers can request a transfer and the receiving team can review the handoff."
  },
  {
    image: "admin-panel-mobile.png",
    title: "Admin Operations",
    caption: "Admins manage doctor profiles, operational items, role-scoped activity, and audit visibility without deleting clinical history.",
    narration: "Admins manage providers, operational content, and audit visibility while keeping clinical history protected."
  },
  {
    image: "admin-approval-mobile.png",
    title: "Admin Approval Hierarchy",
    caption: "New admin accounts wait for an existing admin to verify and approve access before login is enabled.",
    narration: "Admin access is protected with an approval hierarchy. New admin requests must be verified by an existing admin."
  }
];

function commandExists(command) {
  return spawnSync("/usr/bin/which", [command], { stdio: "ignore" }).status === 0;
}

function run(command, args, label) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${label || command} failed.`);
  }
}

function escapeDrawtext(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/\n/g, " ");
}

function wrapText(value, maxLength = 76) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function videoFilter(scene) {
  const title = escapeDrawtext(scene.title);
  const captionFilters = wrapText(scene.caption).map((line, index) => {
    const y = 602 + index * 31;
    return `drawtext=text='${escapeDrawtext(line)}':x=60:y=${y}:fontsize=20:fontcolor=0x334155:box=1:boxcolor=0xffffff@0.92:boxborderw=10`;
  });
  return [
    "scale=1180:520:force_original_aspect_ratio=decrease",
    "pad=1280:720:(ow-iw)/2:110:color=0xf7faf9",
    `drawtext=text='${title}':x=60:y=34:fontsize=36:fontcolor=0x111827:box=1:boxcolor=0xffffff@0.88:boxborderw=14`,
    ...captionFilters
  ].join(",");
}

async function main() {
  if (!commandExists("ffmpeg")) {
    throw new Error("ffmpeg is required to create the demo video. Install ffmpeg, then run npm run demo:video again.");
  }

  await mkdir(outputDir, { recursive: true });
  await rm(workDir, { recursive: true, force: true });
  await mkdir(workDir, { recursive: true });

  const concatFile = path.join(workDir, "clips.txt");
  const clipPaths = [];

  for (const [index, scene] of scenes.entries()) {
    const imagePath = path.join(screenshotDir, scene.image);
    if (!existsSync(imagePath)) {
      throw new Error(`Missing screenshot: ${imagePath}. Run npm run screenshots first.`);
    }

    const clipPath = path.join(workDir, `clip-${String(index).padStart(2, "0")}.mp4`);
    clipPaths.push(clipPath);
    run(
      "ffmpeg",
      [
        "-y",
        "-loop",
        "1",
        "-t",
        String(sceneDurationSeconds),
        "-i",
        imagePath,
        "-vf",
        videoFilter(scene),
        "-r",
        "30",
        "-pix_fmt",
        "yuv420p",
        clipPath
      ],
      `rendering ${scene.title}`
    );
  }

  await writeFile(concatFile, clipPaths.map((clipPath) => `file '${clipPath.replace(/'/g, "'\\''")}'`).join("\n"));

  const silentVideo = path.join(workDir, "carebridge-demo-silent.mp4");
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatFile, "-c", "copy", silentVideo], "joining video clips");

  const narrationText = scenes.map((scene) => scene.narration).join(" ");
  const narrationFile = path.join(workDir, "narration.aiff");
  const canNarrate = !silentFlag && commandExists("say");

  if (canNarrate) {
    run("say", ["-o", narrationFile, narrationText], "creating narration");
    run("ffmpeg", ["-y", "-i", silentVideo, "-i", narrationFile, "-c:v", "copy", "-c:a", "aac", "-shortest", outputFile], "adding narration");
  } else {
    run("ffmpeg", ["-y", "-i", silentVideo, "-c", "copy", outputFile], "copying silent video");
  }

  await rm(workDir, { recursive: true, force: true });

  console.log(`Created ${outputFile}`);
  console.log(canNarrate ? "Audio narration included." : "Created silent video. Run without --silent on macOS to try narration.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
