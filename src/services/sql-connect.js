/*
 * Cria uma conexão com banco de dados SQLite usando o wrapper better-sqlite3-termux,
 * que resolve problemas de compilação em ambientes Android (Termux).
 *
 * A conexão implementa a interface WaSqliteDriver esperada pelo Zapo,
 * convertendo automaticamente entre Buffer e Uint8Array para compatibilidade binária,
 * e utilizando o modo WAL para melhor desempenho e concorrência.
 *
 * @author: Sz — https://raikken.com.br
 *
 * — Por favor, só mexa se saber o que está fazendo!
 */

import fs from "node:fs";
import path from "node:path";
import Database from "@irithell-js/better-sqlite3-termux";

function bindParams(params) {
  if (!params || params.length === 0) return [];
  return Array.from(params).map((value) =>
    value instanceof Uint8Array && !Buffer.isBuffer(value)
      ? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
      : value,
  );
}

function unwrapValue(value) {
  if (Buffer.isBuffer(value)) {
    return new Uint8Array(value);
  }
  return value;
}

function unwrapRow(row) {
  if (!row) return row;

  const result = {};
  for (const key of Object.keys(row)) {
    result[key] = unwrapValue(row[key]);
  }
  return result;
}

export async function createSql(databasePath) {
  const absolutePath = path.resolve(databasePath);

  fs.mkdirSync(path.dirname(absolutePath), {
    recursive: true,
  });

  const db = new Database(absolutePath);
  db.pragma("journal_mode = WAL");

  let closed = false;

  function ensureOpen() {
    if (closed) {
      throw new Error("sqlite connection is closed");
    }
  }

  const connection = {
    driver: "better-sqlite3",

    exec(sql) {
      ensureOpen();
      db.exec(sql);
    },

    run(sql, params) {
      ensureOpen();
      const stmt = db.prepare(sql);
      return stmt.run(...bindParams(params));
    },

    get(sql, params) {
      ensureOpen();
      const stmt = db.prepare(sql);
      const row = stmt.get(...bindParams(params));
      return row === undefined ? null : unwrapRow(row);
    },

    all(sql, params) {
      ensureOpen();
      const stmt = db.prepare(sql);
      return stmt.all(...bindParams(params)).map(unwrapRow);
    },

    async runInTransaction(callback) {
      ensureOpen();

      const transaction = db.transaction(() => {
        const result = callback(connection);

        if (result && typeof result.then === "function") {
          throw new Error(
            "sqlite transaction callback must be synchronous",
          );
        }

        return result;
      });

      return transaction();
    },

    flush() {
    },

    close() {
      if (closed) {
        return;
      }

      closed = true;
      db.close();
    },
  };

  return connection;
}