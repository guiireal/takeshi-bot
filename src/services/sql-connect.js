/*
* Cria uma conexão com banco de dados SQLite usando sql.js (WebAssembly),
* substituindo o better-sqlite3 nativo. O driver é compatível com a interface
* WaSqliteDriver do Zapo, permitindo persistência em arquivo.
* Optei pelo sql.js, para facilitar o uso dos usuários de Termux.
*
* @author: Sz — https://raikken.com.br
*/

import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";

export async function createSql(databasePath) {
  const absolutePath = path.resolve(databasePath);

  fs.mkdirSync(path.dirname(absolutePath), {
    recursive: true,
  });

  const SQL = await initSqlJs();

  let db;

  if (fs.existsSync(absolutePath)) {
    const file = fs.readFileSync(absolutePath);
    db = new SQL.Database(file);
  } else {
    db = new SQL.Database();
  }

  let closed = false;
  let dirty = false;

  function ensureOpen() {
    if (closed) {
      throw new Error("sqlite connection is closed");
    }
  }

  function normalizeParams(params) {
    if (!params || params.length === 0) {
      return [];
    }

    return Array.from(params).map((value) => {
      return value;
    });
  }

  function executeStatement(sql, params, mode) {
    ensureOpen();

    const statement = db.prepare(sql);

    try {
      const values = normalizeParams(params);

      if (values.length > 0) {
        statement.bind(values);
      }

      if (mode === "run") {
        while (statement.step()) {}

        dirty = true;

        return;
      }

      if (mode === "get") {
        if (!statement.step()) {
          return null;
        }

        return statement.getAsObject();
      }

      if (mode === "all") {
        const rows = [];

        while (statement.step()) {
          rows.push(statement.getAsObject());
        }

        return rows;
      }
    } finally {
      statement.free();
    }
  }

  function persist() {
    ensureOpen();

    if (!dirty) {
      return;
    }

    const data = db.export();

    const temporaryPath = `${absolutePath}.tmp`;

    fs.writeFileSync(
      temporaryPath,
      Buffer.from(data),
    );

    fs.renameSync(
      temporaryPath,
      absolutePath,
    );

    dirty = false;
  }

  const connection = {
    driver: "better-sqlite3",

    exec(sql) {
      ensureOpen();

      db.run(sql);

      dirty = true;
    },

    run(sql, params) {
      executeStatement(sql, params, "run");
    },

    get(sql, params) {
      return executeStatement(sql, params, "get");
    },

    all(sql, params) {
      return executeStatement(sql, params, "all");
    },

    async runInTransaction(callback) {
      ensureOpen();

      db.run("BEGIN");

      try {
        const result = callback(connection);

        if (result && typeof result.then === "function") {
          throw new Error(
            "sqlite transaction callback must be synchronous",
          );
        }

        db.run("COMMIT");

        dirty = true;

        persist();

        return result;
      } catch (error) {
        try {
          db.run("ROLLBACK");
        } catch {}

        throw error;
      }
    },

    flush() {
      persist();
    },

    close() {
      if (closed) {
        return;
      }

      persist();

      closed = true;

      db.close();
    },
  };

  return connection;
}