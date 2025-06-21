import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// A list of all supported locales
export const locales = ['en', 'fr', 'ko'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a supported locale.
  // We use a simple `includes` check without any type casting.
  if (!locales.includes(locale)) {
    // The `notFound()` function will stop the execution and render a 404 page.
    // This is a crucial hint for TypeScript that if the code continues,
    // the `locale` variable must be one of the valid strings in the `locales` array.
    notFound();
  }
 
  return {
    locale,
    // Load the translation messages for the given (and now validated) locale
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
