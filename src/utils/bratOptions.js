/**
 * Interpreta as opções dos comandos brat e bratvid:
 * texto / cor do fundo / alinhamento / cor do texto.
 *
 * As opções são reconhecidas pelo valor, então a ordem
 * é livre e dá pra pular as que não quiser:
 * o alinhamento é único, a 1ª cor é o fundo e a 2ª é o texto.
 *
 * @author Dev Gui
 */
import { InvalidParameterError } from "../errors/index.js";
import { removeAccentsAndSpecialCharacters } from "./index.js";

const BACKGROUNDS = {
  green: ["green", "verde"],
  blue: ["blue", "azul"],
  red: ["red", "vermelho", "vermelha"],
  orange: ["orange", "laranja"],
  yellow: ["yellow", "amarelo", "amarela"],
  pink: ["pink", "rosa"],
  cyan: ["cyan", "ciano"],
  white: ["white", "branco", "branca"],
  black: ["black", "preto", "preta"],
};

const ALIGNMENTS = {
  left: ["left", "esquerda"],
  center: ["center", "centro"],
  right: ["right", "direita"],
};

const TEXT_COLORS = ["white", "black"];

function findKey(map, value) {
  return Object.keys(map).find((key) => map[key].includes(value));
}

export function bratUsage(prefix, command) {
  return `Use: *${prefix}${command} texto / cor do fundo / alinhamento / cor do texto*

As opções depois do texto são opcionais e podem vir em qualquer ordem.

🎨 *Cor do fundo:* verde, azul, vermelho, laranja, amarelo, rosa, ciano, branco ou preto (também em inglês: green, blue, red, orange, yellow, pink, cyan, white, black)
↔️ *Alinhamento:* esquerda, centro ou direita (left, center, right)
✏️ *Cor do texto:* preto ou branco (black, white)

A 1ª cor informada é a do fundo e a 2ª é a do texto.

Exemplos:
${prefix}${command} Nem judas mentiu tanto assim
${prefix}${command} Nem judas mentiu tanto assim / verde / centro
${prefix}${command} Nem judas mentiu tanto assim / preto / direita / branco`;
}

/**
 * @param {string[]} args argumentos já separados por "/", "|" ou "\".
 * @param {string} prefix
 * @param {string} command
 * @returns {{ text: string, options: { background?: string, align?: string, text_color?: string } }}
 */
export function parseBratArgs(args, prefix, command) {
  const [text, ...optionArgs] = args;
  const usage = bratUsage(prefix, command);

  if (!text) {
    throw new InvalidParameterError(
      `Você precisa informar o texto da figurinha.\n\n${usage}`,
    );
  }

  const options = {};

  for (const optionArg of optionArgs) {
    const value = removeAccentsAndSpecialCharacters(optionArg.toLowerCase());
    const align = findKey(ALIGNMENTS, value);
    const color = findKey(BACKGROUNDS, value);

    if (align) {
      if (options.align) {
        throw new InvalidParameterError(
          `Você informou mais de um alinhamento.\n\n${usage}`,
        );
      }

      options.align = align;
      continue;
    }

    if (!color) {
      throw new InvalidParameterError(
        `"${optionArg}" não é uma cor ou alinhamento válido.\n\n${usage}`,
      );
    }

    if (!options.background) {
      options.background = color;
      continue;
    }

    if (options.text_color) {
      throw new InvalidParameterError(
        `Você informou cores demais. Use no máximo uma cor de fundo e uma cor de texto.\n\n${usage}`,
      );
    }

    if (!TEXT_COLORS.includes(color)) {
      throw new InvalidParameterError(
        `A cor do texto só pode ser preto ou branco.\n\n${usage}`,
      );
    }

    options.text_color = color;
  }

  return { text, options };
}
