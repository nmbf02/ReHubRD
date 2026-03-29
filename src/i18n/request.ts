import { getRequestConfig } from "next-intl/server";

/** Default UI locale: Spanish. Message keys in code stay English-oriented (nested JSON keys). */
export default getRequestConfig(async () => {
  const locale = "es";

  return {
    locale,
    messages: (await import("../../messages/es.json")).default,
  };
});
