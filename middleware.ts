import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n'; // Assuming i18n.ts is in your root directory

/**
 * This middleware is responsible for handling internationalization (i18n).
 * It uses 'next-intl' to detect the user's preferred locale and
 * rewrite the URL to include it (e.g., '/dashboard' becomes '/en/dashboard').
 */
export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
 
  // The default locale to use when no locale can be determined from the request
  defaultLocale: 'en'
});
 
export const config = {
  // The matcher configures which paths the middleware will run on.
  // This pattern excludes API routes, Next.js static files, and public files
  // so that they are not processed for localization.
  matcher: ['/((?!api|_next/static|.*\\..*).*)']
};
