const createNextIntlPlugin = require("next-intl/plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/dashboard/perfil",
        destination: "/dashboard/profile",
        permanent: true,
      },
      {
        source: "/dashboard/cuenta",
        destination: "/dashboard/account",
        permanent: true,
      },
      {
        source: "/dashboard/seguimiento",
        destination: "/dashboard/followup",
        permanent: true,
      },
      {
        source: "/dashboard/recursos",
        destination: "/dashboard/resources",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

module.exports = withNextIntl(nextConfig);
