import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import chromeLauncher from "chrome-launcher";
import ws from "ws";

const WebSocketClient = ws.WebSocket || ws.default || ws;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, "docs", "screenshots");
const port = Number(process.env.SCREENSHOT_PORT || 4173);
const baseUrl = `http://127.0.0.1:${port}`;

const mobileViewport = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
};

const desktopViewport = {
  width: 1440,
  height: 1200,
  deviceScaleFactor: 1,
  mobile: false
};

const users = {
  patient: {
    id: "u1",
    name: "Maya Patel",
    email: "maya@care.test",
    role: "Patient",
    dob: "May 14, 1998",
    mrn: "MRN-284193",
    plan: "Lakehead Student Health Plan",
    careTeam: "Dr. Lena Chen",
    avatar: "MP"
  },
  provider: {
    id: "d5002",
    name: "Dr. Mira Lawson",
    email: "mira.lawson@care.test",
    role: "Provider",
    dob: "Counselling Psychology",
    mrn: "Provider ID: ML-5002",
    plan: "Mental Health workspace",
    careTeam: "Mental Health",
    avatar: "ML"
  },
  dermatologist: {
    id: "d4001",
    name: "Dr. Naomi Brooks",
    email: "naomi.brooks@care.test",
    role: "Provider",
    dob: "Dermatology",
    mrn: "Provider ID: D4001",
    plan: "Dermatology workspace",
    careTeam: "Dermatology department",
    avatar: "DN"
  },
  admin: {
    id: "u3",
    name: "Care Admin",
    email: "admin@care.test",
    role: "Admin",
    dob: "Operations",
    mrn: "Admin ID: OPS-007",
    plan: "Compliance workspace",
    careTeam: "Access controls",
    avatar: "CA"
  }
};

const scenarios = [
  { name: "login-mobile", user: null },
  { name: "patient-dashboard-mobile", user: users.patient },
  { name: "patient-appointments-mobile", user: users.patient, tab: "Appointments", tabText: "Visits" },
  { name: "patient-messages-mobile", user: users.patient, tab: "Messages", tabText: "Messages" },
  { name: "provider-dashboard-desktop", user: users.dermatologist, viewport: desktopViewport },
  { name: "provider-messages-desktop", user: users.dermatologist, tab: "Messages", tabText: "Messages", viewport: desktopViewport },
  { name: "admin-panel-mobile", user: users.admin, tab: "Admin", tabText: "Admin" },
  { name: "admin-approval-mobile", user: users.admin, tab: "Admin", tabText: "Admin", scrollText: "Admin Approval Hierarchy" },
  { name: "provider-transfers-mobile", user: users.provider, tab: "Records", tabText: "Records", scrollText: "Incoming Transfer Requests" }
];

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".js")) return "text/javascript";
  if (filePath.endsWith(".json")) return "application/json";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".css")) return "text/css";
  return "application/octet-stream";
}

function createStaticServer() {
  return createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", baseUrl);
    const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, "");
    const requestedPath = safePath === "/" ? "/index.html" : safePath;
    const filePath = path.join(distDir, requestedPath);

    try {
      const file = await readFile(filePath);
      response.writeHead(200, { "Content-Type": contentType(filePath) });
      response.end(file);
    } catch {
      const fallback = await readFile(path.join(distDir, "index.html"));
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(fallback);
    }
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocketClient(webSocketUrl);
  let id = 0;
  const pending = new Map();

  socket.on("message", (message) => {
    const payload = JSON.parse(message.toString());
    if (!payload.id || !pending.has(payload.id)) return;
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) reject(new Error(payload.error.message));
    else resolve(payload.result);
  });

  return new Promise((resolve, reject) => {
    socket.once("open", () => {
      resolve({
        send(method, params = {}) {
          const commandId = ++id;
          socket.send(JSON.stringify({ id: commandId, method, params }));
          return new Promise((commandResolve, commandReject) => {
            pending.set(commandId, { resolve: commandResolve, reject: commandReject });
          });
        },
        close() {
          socket.close();
        }
      });
    });
    socket.once("error", reject);
  });
}

async function openPage(chrome, url) {
  const response = await fetch(`http://127.0.0.1:${chrome.port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT"
  });
  const target = await response.json();
  return createCdpClient(target.webSocketDebuggerUrl);
}

async function waitForText(page, text) {
  for (let index = 0; index < 25; index += 1) {
    const result = await page.send("Runtime.evaluate", {
      expression: `document.body && document.body.innerText.includes(${JSON.stringify(text)})`,
      returnByValue: true
    });
    if (result.result?.value) return;
    await wait(200);
  }
}

async function clickText(page, text) {
  await page.send("Runtime.evaluate", {
    expression: `
      (() => {
        const target = [...document.querySelectorAll("*")]
          .filter((node) => node.textContent && node.textContent.trim() === ${JSON.stringify(text)})
          .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)
          .find((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
        if (target) (target.closest('[role="button"]') || target).click();
      })();
    `
  });
}

async function scrollToText(page, text) {
  await page.send("Runtime.evaluate", {
    expression: `
      (() => {
        const target = [...document.querySelectorAll("*")]
          .filter((node) => node.textContent && node.textContent.trim() === ${JSON.stringify(text)})
          .find((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
        if (target) target.scrollIntoView({ block: "start", inline: "nearest" });
      })();
    `
  });
}

async function assertNoHorizontalOverflow(page, scenarioName) {
  const evaluation = await page.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `
      (() => {
        const viewportWidth = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll("body *")]
          .map((node) => {
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            const label = (node.innerText || node.textContent || "")
              .trim()
              .replace(/\\s+/g, " ")
              .slice(0, 90);

            return {
              tag: node.tagName.toLowerCase(),
              label,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              display: style.display,
              visibility: style.visibility
            };
          })
          .filter((item) =>
            item.width > 0 &&
            item.display !== "none" &&
            item.visibility !== "hidden" &&
            (item.left < -2 || item.right > viewportWidth + 2)
          )
          .slice(0, 6);

        return {
          viewportWidth,
          scrollWidth: document.documentElement.scrollWidth,
          offenders
        };
      })();
    `
  });

  const result = evaluation.result.value;
  if (result.scrollWidth > result.viewportWidth + 2 || result.offenders.length) {
    throw new Error(`${scenarioName} has horizontal overflow: ${JSON.stringify(result)}`);
  }
}

async function applySession(page, user) {
  const session = user
    ? {
        user,
        token: "",
        savedAt: new Date().toISOString()
      }
    : null;

  await page.send("Runtime.evaluate", {
    expression: `
      localStorage.clear();
      ${session ? `localStorage.setItem("carebridge.portal.session", ${JSON.stringify(JSON.stringify(session))});` : ""}
    `
  });
  await page.send("Page.reload", { ignoreCache: true });
  await waitForText(page, "CareBridge");
  await wait(800);
}

async function captureScenario(page, scenario) {
  const viewport = scenario.viewport || mobileViewport;
  await page.send("Emulation.setDeviceMetricsOverride", viewport);
  await page.send("Emulation.setUserAgentOverride", {
    userAgent: viewport.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });

  const url = scenario.tab ? `${baseUrl}?tab=${encodeURIComponent(scenario.tab)}` : baseUrl;
  await page.send("Page.navigate", { url });
  await waitForText(page, "CareBridge");
  await applySession(page, scenario.user);

  if (scenario.tabText) {
    await clickText(page, scenario.tabText);
    await wait(700);
  }

  if (scenario.scrollText) {
    await scrollToText(page, scenario.scrollText);
    await wait(700);
  }

  if (!viewport.mobile) {
    await assertNoHorizontalOverflow(page, scenario.name);
  }

  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true
  });
  const filePath = path.join(outputDir, `${scenario.name}.png`);
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
  console.log(`Captured ${path.relative(rootDir, filePath)}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-dev-shm-usage"
    ],
    logLevel: "silent"
  });

  const page = await openPage(chrome, baseUrl);
  try {
    await page.send("Page.enable");
    await page.send("Runtime.enable");

    for (const scenario of scenarios) {
      await captureScenario(page, scenario);
    }
  } finally {
    page.close();
    await chrome.kill();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
