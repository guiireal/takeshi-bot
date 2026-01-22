// src/utils/ADVT_warnSystem.js
// © Sistema ADVT – Inspirado na Aleatory-MD v4.7
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "../../database/ADVT_warns.json");

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    return {};
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function ensureGroup(db, groupId) {
  if (!db[groupId]) {
    db[groupId] = {
      warnLimit: 3, // Padrão inicial
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

// --- CORE ---
export function ADVT_addWarn(groupId, userLid, reason = "Advertência genérica") {
  const db = loadDB();
  const user = ensureUser(db, groupId, userLid);
  user.push({ reason, timestamp: Date.now(), valid: true });
  saveDB(db);
  return user.filter(w => w.valid).length;
}

export function ADVT_getAllWarns(groupId, userLid) {
  const db = loadDB();
  return db[groupId]?.warns?.[userLid] || [];}

export function ADVT_getWarnLimit(groupId) {
  const db = loadDB();
  return db[groupId]?.warnLimit || 3;
}

export function ADVT_removeLastValidWarn(groupId, userLid) {
  const db = loadDB();
  const user = db[groupId]?.warns?.[userLid];
  if (!user) return 0;

  for (let i = user.length - 1; i >= 0; i--) {
    if (user[i].valid) {
      user[i].valid = false;
      break;
    }
  }
  saveDB(db);
  return ADVT_getAllWarns(groupId, userLid).filter(w => w.valid).length;
}

export function ADVT_revokeWarnByIndex(groupId, userLid, index) {
  const db = loadDB();
  const user = db[groupId]?.warns?.[userLid];
  if (!user) return false;

  const validWarns = user.filter(w => w.valid);
  if (index < 0 || index >= validWarns.length) return false;

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

export function ADVT_reactivateWarnByIndex(groupId, userLid, index) {
  const db = loadDB();
  const user = db[groupId]?.warns?.[userLid];
  if (!user) return false;

  const invalidWarns = user.filter(w => !w.valid);  if (index < 0 || index >= invalidWarns.length) return false;

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