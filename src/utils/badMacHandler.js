/**
 * Utilitário para lidar com erros "Bad MAC" / de sessão Signal,
 * comuns em bots WhatsApp que mantêm sessão por longos períodos.
 *
 * Este módulo fornece funções para detectar, contar
 * e lidar graciosamente com esses erros.
 *
 * @author Dev Gui
 */
import { errorLog, warningLog } from "./logger.js";

class BadMacHandler {
  constructor() {
    this.errorCount = 0;
    this.maxRetries = 5;
    this.resetInterval = 300000;
    this.lastReset = Date.now();
  }

  isBadMacError(error) {
    const errorMessage = error?.message || error?.toString() || "";
    return (
      errorMessage.includes("Bad MAC") ||
      errorMessage.includes("MAC verification failed") ||
      errorMessage.includes("decryption failed")
    );
  }

  isSessionError(error) {
    const errorMessage = error?.message || error?.toString() || "";
    return (
      errorMessage.includes("Session") ||
      errorMessage.includes("signal protocol") ||
      errorMessage.includes("decrypt") ||
      this.isBadMacError(error)
    );
  }

  incrementErrorCount() {
    this.errorCount++;
    errorLog(`Bad MAC error count: ${this.errorCount}/${this.maxRetries}`);

    const now = Date.now();
    if (now - this.lastReset > this.resetInterval) {
      this.resetErrorCount();
    }
  }

  resetErrorCount() {
    const previousCount = this.errorCount;
    this.errorCount = 0;
    this.lastReset = Date.now();

    if (previousCount > 0) {
      warningLog(
        `Reset do contador de Bad MAC errors. Contador anterior: ${previousCount}`
      );
    }
  }

  hasReachedLimit() {
    return this.errorCount >= this.maxRetries;
  }

  handleError(error, context = "unknown") {
    if (!this.isBadMacError(error)) {
      return false;
    }

    errorLog(`Bad MAC error detectado em ${context}: ${error.message}`);
    this.incrementErrorCount();

    if (this.hasReachedLimit()) {
      warningLog(
        `Limite de Bad MAC errors atingido (${this.maxRetries}). Considere reiniciar o bot.`
      );
      return true;
    }

    warningLog(
      `Ignorando Bad MAC error e continuando operação... (${this.errorCount}/${this.maxRetries})`
    );
    return true;
  }

  createSafeWrapper(fn, context) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        if (this.handleError(error, context)) {
          return null;
        }
        throw error;
      }
    };
  }

  getStats() {
    return {
      errorCount: this.errorCount,
      maxRetries: this.maxRetries,
      lastReset: new Date(this.lastReset).toISOString(),
      timeUntilReset: Math.max(
        0,
        this.resetInterval - (Date.now() - this.lastReset)
      ),
    };
  }
}

const badMacHandler = new BadMacHandler();

export { BadMacHandler, badMacHandler };
