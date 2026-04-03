export default function robots() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bdsaaszone.site';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
