import clientPromise from "@/lib/mongodb";

const toSlug = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? "";

export default async function sitemap() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bdsaaszone.site';
  
  // Base routes
  const routes = [
    '',
    '/for-sale',
    '/docs/badge',
  ].map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch all startups to include in sitemap
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const startups = await db.collection("startups").find({}, { projection: { name: 1, updatedAt: 1 } }).toArray();
    
    const startupRoutes = startups.map((startup) => ({
      url: `${APP_URL}/startups/${toSlug(startup.name)}`,
      lastModified: (startup.updatedAt || new Date()).toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...routes, ...startupRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return routes;
  }
}
