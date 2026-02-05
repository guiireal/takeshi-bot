/**
 * Sistema de advertências progressivas
 *
 * @author HunterTheCraft-OFICIAL
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../../database/warns.json");
const INITIAL_WARN_LIMIT = 3;

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    console.log("[WARN SYSTEM] Criando arquivo warns.json...");
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    return {};
  }

  const content = fs.readFileSync(DB_PATH, "utf8");
  const parsed = JSON.parse(content);

  if (Array.isArray(parsed)) {
    console.log("[WARN SYSTEM] Convertendo warns.json de array para objeto...");
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    return {};
  }

  return parsed;
}

function saveDB(data) {
  console.log(
    "[WARN SYSTEM] Salvando advertências:",
    JSON.stringify(data, null, 2),
  );
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  console.log("[WARN SYSTEM] ✅ Advertências salvas com sucesso!");
}

function ensureGroup(db, groupId) {
  if (!db[groupId]) {
    db[groupId] = {
      warnLimit: INITIAL_WARN_LIMIT,
      warns: {},
    };
  }
  return db[groupId];
}

function ensureUser(db, groupId, userLid) {
  const group = ensureGroup(db, groupId);
  if (!group.warns[userLid]) group.warns[userLid] = [];
  return group.warns[userLid];
}

export function addWarn(groupId, userLid, reason = "Advertência genérica") {
  console.log(
    `[WARN SYSTEM] Adicionando advertência - Grupo: ${groupId}, Usuário: ${userLid}, Motivo: ${reason}`,
  );

  const db = loadDB();
  const user = ensureUser(db, groupId, userLid);

  user.push({ reason, timestamp: Date.now(), valid: true });
  saveDB(db);

  const validCount = user.filter((w) => w.valid).length;
  console.log(`[WARN SYSTEM] Total de advertências válidas: ${validCount}`);

  return validCount;
}
export function getAllWarns(groupId, userLid) {
  const db = loadDB();
  return db[groupId]?.warns?.[userLid] || [];
}

export function getWarnLimit(groupId) {
  const db = loadDB();
  return db[groupId]?.warnLimit || INITIAL_WARN_LIMIT;
}

export function removeLastWarn(groupId, userLid) {
  const db = loadDB();

  const user = db[groupId]?.warns?.[userLid];

  if (!user) {
    return 0;
  }

  for (let i = user.length - 1; i >= 0; i--) {
    if (user[i].valid) {
      user[i].valid = false;
      break;
    }
  }

  saveDB(db);

  return getAllWarns(groupId, userLid).filter((w) => w.valid).length;
}

export function revokeWarnByIndex(groupId, userLid, index) {
  const db = loadDB();

  const user = db[groupId]?.warns?.[userLid];

  if (!user) {
    return false;
  }

  const validWarns = user.filter((w) => w.valid);

  if (index < 0 || index >= validWarns.length) {
    return false;
  }

  let found = 0;

  for (let i = 0; i < user.length; i++) {
    if (user[i].valid) {
      if (found === index) {
        user[i].valid = false;
        saveDB(db);
        return true;
      }
      found++;
    }
  }
  return false;
}

export function reactivateWarnByIndex(groupId, userLid, index) {
  const db = loadDB();

  const user = db[groupId]?.warns?.[userLid];
  if (!user) {
    return false;
  }

  const invalidWarns = user.filter((w) => !w.valid);

  if (index < 0 || index >= invalidWarns.length) {
    return false;
  }

  let found = 0;

  for (let i = 0; i < user.length; i++) {
    if (!user[i].valid) {
      if (found === index) {
        user[i].valid = true;
        saveDB(db);
        return true;
      }
      found++;
    }
  }

  return false;
}
