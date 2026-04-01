import { getRequestConfig } from "next-intl/server";

/** Default UI locale: Spanish. Message keys in code stay English-oriented (nested JSON keys). */
export default getRequestConfig(async () => {
  const locale = "es";
  const base = (await import("../../messages/es.json")).default;
  const scenarios = (await import("../../messages/data-scenarios.json")).default;

  return {
    locale,
    messages: {
      ...base,
      data: {
        scenarios,
      },
    },
  };
});
