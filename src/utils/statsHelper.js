import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function countCommandFiles() {
  const commandsDir = path.join(__dirname, "..", "commands");
  let count = 0;

  function countInDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        countInDir(filePath);
      } else if (file.endsWith(".js") && !file.startsWith("🤖")) {
        count++;
      }
    });
  }

  countInDir(commandsDir);
  return count;
}

export function countGroups() {
  const databaseDir = path.join(__dirname, "..", "..", "database");
  const files = [
    "prefix-groups.json",
    "welcome-groups.json",
    "exit-groups.json",
  ];

  const groups = new Set();

  files.forEach((file) => {
    const filePath = path.join(databaseDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        Object.keys(data).forEach((key) => groups.add(key));
      } catch (err) {
        // File is empty or invalid JSON
      }
    }
  });

  return groups.size;
}

export function countMutedUsers() {
  const databaseDir = path.join(__dirname, "..", "..", "database");
  const mutedPath = path.join(databaseDir, "muted.json");

  if (!fs.existsSync(mutedPath)) return 0;

  try {
    const data = JSON.parse(fs.readFileSync(mutedPath, "utf-8"));
    let count = 0;

    Object.values(data).forEach((group) => {
      if (Array.isArray(group)) {
        count += group.length;
      }
    });

    return count;
  } catch (err) {
    return 0;
  }
}

export function countAutoResponders() {
  const databaseDir = path.join(__dirname, "..", "..", "database");
  const autoResponderPath = path.join(databaseDir, "auto-responder.json");

  if (!fs.existsSync(autoResponderPath)) return 0;

  try {
    const data = JSON.parse(fs.readFileSync(autoResponderPath, "utf-8"));
    return Array.isArray(data) ? data.length : 0;
  } catch (err) {
    return 0;
  }
}
