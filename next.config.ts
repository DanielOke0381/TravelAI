import type { NextConfig } from "next";
import createWithIntl from 'next-intl/plugin';

// This function from next-intl will wrap your Next.js configuration.
const withIntl = createWithIntl('./i18n.ts');

const nextConfig: NextConfig = {
  /* your existing config options here */
};

// Export the wrapped configuration
export default withIntl(nextConfig);
