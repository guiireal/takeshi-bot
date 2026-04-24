/**
 * @author RafaelQuadros1
 */
import axios from "axios";
import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

const TRENDSTOOLS_BASE_URL = "https://trendstools.net/json/twitter";

const COUNTRY_MAP = {
  brasil: "brazil",
  brazil: "brazil",
  br: "brazil",
  mundial: "worldwide",
  mundo: "worldwide",
  worldwide: "worldwide",
  global: "worldwide",
  argentina: "argentina",
  ar: "argentina",
  mexico: "mexico",
  méxico: "mexico",
  mx: "mexico",
  eua: "united-states",
  usa: "united-states",
  "estados-unidos": "united-states",
  "estados unidos": "united-states",
  us: "united-states",
  portugal: "portugal",
  pt: "portugal",
  espanha: "spain",
  spain: "spain",
  es: "spain",
  colombia: "colombia",
  co: "colombia",
  chile: "chile",
  cl: "chile",
  peru: "peru",
  pe: "peru",
  venezuela: "venezuela",
  ve: "venezuela",
  canada: "canada",
  ca: "canada",
  reino_unido: "united-kingdom",
  "reino unido": "united-kingdom",
  "united-kingdom": "united-kingdom",
  uk: "united-kingdom",
  franca: "france",
  frança: "france",
  france: "france",
  fr: "france",
  alemanha: "germany",
  germany: "germany",
  de: "germany",
  italia: "italy",
  itália: "italy",
  italy: "italy",
  it: "italy",
  japao: "japan",
  japão: "japan",
  japan: "japan",
  jp: "japan",
  coreia: "korea",
  korea: "korea",
  kr: "korea",
  india: "india",
  índia: "india",
  in: "india",
  australia: "australia",
  au: "australia",
};

function normalizeCountry(input) {
  const lower = input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return COUNTRY_MAP[lower] || null;
}

function toTitleCase(str) {
  return str
    .split(/[-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default {
  name: "twt",
  description: "Busca os trending topics (assuntos do momento) no X.com",
  commands: ["twt", "trending", "trends", "trendingtwitter"],
  usage: `${PREFIX}twt <país> (ex: ${PREFIX}twt brasil ou ${PREFIX}twt worldwide)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    sendReply,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    const countryInput = args[0] ? args[0].trim() : "worldwide";
    const countryCode = normalizeCountry(countryInput);

    if (!countryCode) {
      throw new InvalidParameterError(
        `País *"${countryInput}"* não encontrado!\n\nExemplos válidos: brasil, worldwide, argentina, mexico, eua, portugal, espanha, chile, colombia, peru`
      );
    }

    await sendWaitReact();

    try {
      const { data } = await axios.get(
        `${TRENDSTOOLS_BASE_URL}/${countryCode}`,
        { timeout: 15000 }
      );

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new WarningError(
          "Não foi possível obter os trending topics no momento. Tente novamente mais tarde."
        );
      }

      const countryLabel = toTitleCase(countryCode);

      const lines = data
        .slice(0, 10)
        .map((item) => {
          const name = item.name || item.trend || item.keyword || null;

          if (!name || typeof name !== "string") {
            return null;
          }
          const volume =
            item.tweet_volume ||
            item.tweetVolume ||
            item.mentions ||
            item.volume ||
            null;

          const volumeText = volume
            ? ` - ${Number(volume).toLocaleString("pt-BR")} menções`
            : "";

          const tag = name.startsWith("#") ? name : `#${name}`;
          return `${tag}${volumeText}`;
        })
        .filter(Boolean)
        .join("\n");

      await sendSuccessReact();

      await sendReply(`🔥 *Assuntos do Momento — ${countryLabel}*\n\n${lines}`);
    } catch (error) {
      if (
        error instanceof WarningError ||
        error instanceof InvalidParameterError
      ) {
        throw error;
      }

      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(
        "Erro ao buscar trending topics. Tente novamente mais tarde."
      );
    }
  },
};
