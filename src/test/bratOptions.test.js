import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InvalidParameterError } from "../errors/index.js";
import { parseBratArgs } from "../utils/bratOptions.js";

const parse = (...args) => parseBratArgs(args, "/", "brat");

describe("parseBratArgs", () => {
  it("retorna só o texto quando não há opções", () => {
    assert.deepEqual(parse("Nem judas"), { text: "Nem judas", options: {} });
  });

  it("aceita fundo, alinhamento e cor do texto em português", () => {
    assert.deepEqual(parse("Oi", "Verde", "Centro", "Branco"), {
      text: "Oi",
      options: { background: "green", align: "center", text_color: "white" },
    });
  });

  it("aceita opções em inglês, fora de ordem e pulando opções", () => {
    assert.deepEqual(parse("Oi", "right", "black", "white").options, {
      align: "right",
      background: "black",
      text_color: "white",
    });
    assert.deepEqual(parse("Oi", "direita").options, { align: "right" });
    assert.deepEqual(parse("Oi", "amarela").options, { background: "yellow" });
  });

  it("explica o uso quando o usuário erra", () => {
    const cases = [
      [[], /informar o texto/],
      [["Oi", "roxo"], /"roxo" não é uma cor ou alinhamento válido/],
      [["Oi", "centro", "esquerda"], /mais de um alinhamento/],
      [["Oi", "verde", "azul"], /só pode ser preto ou branco/],
      [["Oi", "verde", "preto", "branco"], /cores demais/],
    ];

    for (const [args, message] of cases) {
      assert.throws(
        () => parse(...args),
        (error) =>
          error instanceof InvalidParameterError &&
          message.test(error.message) &&
          error.message.includes("/brat texto / cor do fundo / alinhamento / cor do texto"),
      );
    }
  });
});
