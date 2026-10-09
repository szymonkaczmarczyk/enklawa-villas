export const site = {
  name: 'Enklawa Villas',
  domain: 'enklawavillas.com',
  email: 'office@enklawavillas.com',
  phone: '+48 22 [[do uzupełnienia]]',
  year: 2026,
  company: {
    name: 'Enklawa Sp. z o.o.',
    address: '[[ulica i numer]], [[kod pocztowy]] [[miasto]]',
    krs: '[[numer KRS]]',
    nip: '[[NIP]]',
    regon: '[[REGON]]',
    capital: { pl: '5\u00a0000\u00a0000\u00a0PLN', en: 'PLN\u00a05,000,000' },
    insurance: '[[numer polisy OC pośrednika i nazwa ubezpieczyciela]]',
    hosting: '[[dostawca hostingu]]',
    mailbox: '[[dostawca poczty e-mail]]',
    logRetention: '[[okres przechowywania logów serwera]]',
  },
  legalUpdated: { pl: '6 października 2026 r.', en: '6 October 2026' },
} as const;

export const phoneHref = site.phone.includes('[[') ? null : `tel:${site.phone.replace(/[^\d+]/g, '')}`;
