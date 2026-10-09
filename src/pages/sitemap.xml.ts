import type { APIRoute } from 'astro';
import { properties } from '../data/properties';
import { residencePaths, routes, type Lang, type LocalizedPaths } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const absolute = (path: string) => new URL(path, site).href;
  const pages: LocalizedPaths[] = [...Object.values(routes), ...properties.map((property) => residencePaths(property.id))];
  const entries = pages.flatMap((route) => {
    const variants = Object.entries(route) as [Lang, string][];
    const alternates = [
      ...variants.map(([code, path]) => `<xhtml:link rel="alternate" hreflang="${code}" href="${absolute(path)}"/>`),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(route.pl)}"/>`,
    ].join('');
    return variants.map(([, path]) => `<url><loc>${absolute(path)}</loc>${alternates}</url>`);
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
