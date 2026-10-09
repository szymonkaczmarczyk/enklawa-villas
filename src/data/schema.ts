import { dictionaries, residencePaths, routes, type Lang } from '../i18n';
import type { Property } from './properties';
import type { Residence } from './residences';
import { site } from './site';

export type SchemaNode = Record<string, unknown>;

const absolute = (path: string) => new URL(path, `https://${site.domain}`).href;
const agentId = absolute('/#agent');

const companyAddress = () => {
  const match = site.company.address.match(/^(.+),\s*(\d{2}-\d{3})\s+(.+)$/);
  if (!match || site.company.address.includes('[[')) return null;
  const [, streetAddress, postalCode, addressLocality] = match;
  return { '@type': 'PostalAddress', streetAddress, postalCode, addressLocality, addressCountry: 'PL' };
};

export const agentSchema = (lang: Lang): SchemaNode => {
  const address = companyAddress();
  return {
    '@type': 'RealEstateAgent',
    '@id': agentId,
    name: site.name,
    legalName: site.company.name,
    description: dictionaries[lang].meta.home.description,
    url: absolute(routes.home[lang]),
    logo: absolute('/icon-512.png'),
    image: absolute(`/og/${lang}.jpg`),
    email: site.email,
    ...(site.phoneConfirmed ? { telephone: site.phone } : {}),
    ...(address ? { address } : {}),
  };
};

export const websiteSchema = (lang: Lang): SchemaNode => ({
  '@type': 'WebSite',
  '@id': absolute('/#website'),
  name: site.name,
  url: absolute(routes.home[lang]),
  inLanguage: lang,
  publisher: { '@id': agentId },
});

export const residenceSchema = (lang: Lang, property: Property, residence: Residence, image: string): SchemaNode[] => {
  const t = dictionaries[lang];
  const url = absolute(residencePaths(property.id)[lang]);
  const name = property.name[lang];
  const location = property.location[lang];
  const separator = location.lastIndexOf(', ');
  const area = (value: number) => ({ '@type': 'QuantitativeValue', value, unitCode: 'MTK' });

  return [
    {
      '@type': 'RealEstateListing',
      '@id': url,
      url,
      name,
      description: residence.description[lang][0],
      inLanguage: lang,
      image: absolute(image),
      provider: { '@id': agentId },
      mainEntity: { '@id': `${url}#residence` },
    },
    {
      '@type': 'SingleFamilyResidence',
      '@id': `${url}#residence`,
      name,
      description: residence.description[lang].join(' '),
      image: absolute(image),
      address: {
        '@type': 'PostalAddress',
        addressRegion: location.slice(0, separator),
        addressCountry: location.slice(separator + 2),
      },
      floorSize: area(residence.area),
      additionalProperty: { '@type': 'PropertyValue', name: t.residence.plot, value: residence.plot, unitCode: 'MTK' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: absolute(routes.home[lang]) },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
  ];
};
