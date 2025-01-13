/**
 * Classe de erro customizada para
 * parâmetros inválidos.
 *
 * @author Dev Gui
 */
class InvalidParameterError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidParameterError";
  }
}

module.exports = {
  InvalidParameterError,
};
