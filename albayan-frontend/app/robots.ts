import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * robots.txt — يسمح بفهرسة المحتوى المفتوح (المبادئ والتجربة والاستكشاف)
 * ويمنع أرشفة المسارات الإدارية والخاصة بالطلاب.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/trial", "/explore", "/lessons/"],
      disallow: ["/admin/", "/learn/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
