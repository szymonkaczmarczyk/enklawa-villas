export const site = {
  name: 'Enklawa Villas',
  domain: 'enklawavillas.com',
  email: 'office@enklawavillas.com',
  phone: '+48 22 000 00 00',
  phoneConfirmed: false,
  year: 2026,
  company: {
    name: 'Enklawa Sp. z o.o.',
    address: '[[ulica i numer]], 00-000 [[miasto]]',
    krs: '0000000000',
    nip: '000-000-00-00',
    regon: '000000000',
    capital: { pl: '5\u00a0000\u00a0000\u00a0PLN', en: 'PLN\u00a05,000,000' },
    insurance: '[[numer polisy OC pośrednika i nazwa ubezpieczyciela]]',
    hosting: '[[dostawca hostingu]]',
    mailbox: '[[dostawca poczty e-mail]]',
    logRetention: '[[okres przechowywania logów serwera]]',
  },
  legalUpdated: { pl: '6 października 2026 r.', en: '6 October 2026' },
} as const;

export const phoneHref = site.phoneConfirmed ? `tel:${site.phone.replace(/[^\d+]/g, '')}` : null;
