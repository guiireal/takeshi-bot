/**
 * Classe de erro customizada para
 * erros críticos.
 *
 * @author Dev Gui
 */
export default class DangerError extends Error {
  constructor(message) {
    super(message);
    this.name = "DangerError";
  }
}
