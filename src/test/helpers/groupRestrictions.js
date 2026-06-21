import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach } from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const groupRestrictionsPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "database",
  "group-restrictions.json",
);

export function backupGroupRestrictions() {
  if (!fs.existsSync(groupRestrictionsPath)) {
    return null;
  }

  return fs.readFileSync(groupRestrictionsPath);
}

export function restoreGroupRestrictions(backup) {
  if (backup === null) {
    if (fs.existsSync(groupRestrictionsPath)) {
      fs.unlinkSync(groupRestrictionsPath);
    }
    return;
  }

  fs.writeFileSync(groupRestrictionsPath, backup);
}

export function useGroupRestrictionsCleanup(setup) {
  let backup;

  beforeEach(() => {
    backup = backupGroupRestrictions();
    setup?.();
  });

  afterEach(() => {
    restoreGroupRestrictions(backup);
  });
}
