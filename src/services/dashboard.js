import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { successLog } from "../utils/logger.js";
import { BOT_NAME } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardDir = path.resolve(__dirname, "..", "dashboard");
const htmlPath = path.join(dashboardDir, "index.html");
const cssPath = path.join(dashboardDir, "styles.css");

let botStats = {
  startTime: Date.now(),
  isConnected: false,
  totalCommands: 0,
  totalGroups: 0,
  mutedUsers: 0,
  autoResponders: 0,
};

export function updateBotStats(stats) {
  botStats = { ...botStats, ...stats };
}

export function setBotConnected(connected) {
  botStats.isConnected = connected;
}

function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function renderHTML() {
  let html = fs.readFileSync(htmlPath, "utf-8");

  const uptime = formatUptime(Date.now() - botStats.startTime);
  const status = botStats.isConnected ? "🟢 Conectado" : "🔴 Desconectado";
  const statusLabel = botStats.isConnected
    ? "Painel de Monitoramento"
    : "Sistema Offline";
  const statusClass = botStats.isConnected ? "connected" : "disconnected";

  const replacements = {
    "{{BOT_NAME}}": BOT_NAME,
    "{{STATUS}}": status,
    "{{STATUS_LABEL}}": statusLabel,
    "{{STATUS_CLASS}}": statusClass,
    "{{UPTIME}}": uptime,
    "{{TOTAL_COMMANDS}}": botStats.totalCommands,
    "{{TOTAL_GROUPS}}": botStats.totalGroups,
    "{{MUTED_USERS}}": botStats.mutedUsers,
    "{{AUTO_RESPONDERS}}": botStats.autoResponders,
    "{{VERSION}}": "7.11.0",
    "{{NODE_VERSION}}": process.version,
    "{{PLATFORM}}": process.platform.toUpperCase(),
    "{{MEMORY_USAGE}}": (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
      2,
    ),
    "{{CPU_CORES}}": os.cpus().length,
    "{{LAST_UPDATE}}": new Date().toLocaleTimeString("pt-BR"),
  };

  Object.entries(replacements).forEach(([key, value]) => {
    html = html.replace(new RegExp(key, "g"), value);
  });

  return html;
}

function getCSS() {
  return fs.readFileSync(cssPath, "utf-8");
}

export function startDashboard(port = 3000) {
  const server = http.createServer((req, res) => {
    if (req.url === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderHTML());
    } else if (req.url === "/styles.css" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(getCSS());
    } else if (req.url === "/api/stats" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ...botStats,
          uptime: Date.now() - botStats.startTime,
        }),
      );
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(port, () => {
    successLog(`🎛️ Dashboard rodando em: http://localhost:${port}`);
  });

  return server;
}
