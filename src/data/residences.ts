import type { ImageMetadata } from 'astro';

type Localized = { pl: string; en: string };

export type Residence = {
  film: string;
  area: number;
  plot: number;
  description: { pl: string[]; en: string[] };
  gallery: { image: ImageMetadata; alt: Localized }[];
};

const stills = import.meta.glob<{ default: ImageMetadata }>('../assets/residences/*.jpg', { eager: true });

const still = (id: string, number: number) => stills[`../assets/residences/${id}-${number}.jpg`].default;

const sizes: Record<string, { area: number; plot: number }> = {
  cypel: { area: 1150, plot: 9800 },
  toskania: { area: 1600, plot: 42000 },
  tatry: { area: 980, plot: 12500 },
  pinie: { area: 1350, plot: 18000 },
  klif: { area: 1050, plot: 6400 },
  baltyk: { area: 920, plot: 15000 },
  pawilon: { area: 840, plot: 8200 },
  skaly: { area: 880, plot: 21000 },
};

const residence = (id: string, description: Residence['description'], alts: Localized[]): Residence => ({
  film: `/video/residence-${id}.mp4`,
  ...sizes[id],
  description,
  gallery: alts.map((alt, index) => ({ image: still(id, index + 1), alt })),
});

export const residences: Record<string, Residence> = {
  cypel: residence(
    'cypel',
    {
      pl: [
        'Jasna, rzeźbiarska bryła na samym końcu skalistego cypla, z morzem po obu stronach.',
        'Tarasowe ogrody i długi basen ułożone na osi domu prowadzą wzrok wprost ku horyzontowi.',
      ],
      en: [
        'A pale, sculptural volume at the very tip of a rocky headland, with the sea on both sides.',
        'Terraced gardens and a long pool set on the axis of the house draw the eye straight to the horizon.',
      ],
    },
    [
      {
        pl: 'Widok z drona na jasną rezydencję na skalistym cyplu, z falami rozbijającymi się o skały na pierwszym planie',
        en: 'Drone view of the pale residence on a rocky headland, with waves breaking on the rocks in the foreground',
      },
      {
        pl: 'Rezydencja i basen otoczone tarasowymi ogrodami, w tle morze o zmierzchu',
        en: 'The residence and pool framed by terraced gardens, with the sea at dusk behind',
      },
      {
        pl: 'Bliższy widok na długi basen na osi domu, kamienne tarasy i nasadzenia',
        en: 'A closer view of the long pool on the axis of the house, stone terraces and planting',
      },
    ],
  ),
  toskania: residence(
    'toskania',
    {
      pl: [
        'Kamienna posiadłość na szczycie wzgórza, do której prowadzą aleje cyprysów i gaje oliwne.',
        'Tarasy na kilku poziomach otwierają się na basen i dolinę, a przed domem jest kolisty podjazd.',
      ],
      en: [
        'A stone estate on a hilltop, reached through cypress avenues and olive groves.',
        'Terraces on several levels open onto the pool and the valley, with a circular forecourt in front of the house.',
      ],
    },
    [
      {
        pl: 'Posiadłość na wzgórzu wśród cyprysów, z kolistym podjazdem i zaparkowanymi samochodami na pierwszym planie',
        en: 'The hilltop estate among cypresses, with a circular driveway and parked cars in the foreground',
      },
      {
        pl: 'Kamienna fasada z tarasami i basen przed domem w ciepłym świetle późnego popołudnia',
        en: 'The stone facade with terraces and the pool in front of the house in warm late-afternoon light',
      },
      {
        pl: 'Basen bez krawędzi i trawnik przed posiadłością, w tle tarasy z leżakami',
        en: 'The infinity pool and lawn in front of the estate, with terraces and loungers behind',
      },
    ],
  ),
  tatry: residence(
    'tatry',
    {
      pl: [
        'Dom z drewna, kamienia i szkła wpisany w zbocze, z widokiem na ośnieżone szczyty.',
        'Podgrzewany basen opływa taras łukiem i paruje w chłodnym powietrzu, tuż obok paleniska.',
      ],
      en: [
        'A house of timber, stone and glass set into the slope, facing snowy peaks.',
        'A heated pool curves around the terrace and steams in the cold air, right beside the fire pit.',
      ],
    },
    [
      {
        pl: 'Kamienna ściana i okrągły, parujący basen przed domem, w tle ośnieżone szczyty',
        en: 'A stone wall and a round, steaming pool in front of the house, with snowy peaks behind',
      },
      {
        pl: 'Zaokrąglona fasada z drewnianych lameli i łukowaty basen o zmierzchu',
        en: 'A curved facade of timber louvres and an arched pool at dusk',
      },
      {
        pl: 'Przeszklona część domu odbijająca góry, z ogniem w palenisku na tarasie',
        en: 'The glazed part of the house reflecting the mountains, with a fire burning on the terrace',
      },
    ],
  ),
  pinie: residence(
    'pinie',
    {
      pl: [
        'Ciemna, przeszklona rezydencja ukryta w lesie sosen pinii.',
        'Rozległy trawnik i basen leżą przed skrzydłami domu, a przeszklone galerie odsłaniają kolekcję samochodów.',
      ],
      en: [
        'A dark, glazed residence hidden in a forest of stone pines.',
        'A wide lawn and pool lie before the wings of the house, while glazed galleries reveal a car collection.',
      ],
    },
    [
      {
        pl: 'Rezydencja z ciemnego kamienia wśród sosen pinii, z krętym podjazdem i basenem',
        en: 'The dark stone residence among stone pines, with a winding drive and pool',
      },
      {
        pl: 'Front domu z basenem i leżakami, za szybami rozświetlone wnętrza',
        en: 'The front of the house with the pool and loungers, lit interiors behind the glass',
      },
      {
        pl: 'Bliższy widok na basen i przeszkloną galerię z samochodami',
        en: 'A closer view of the pool and the glazed gallery with cars',
      },
    ],
  ),
  klif: residence(
    'klif',
    {
      pl: [
        'Trzy kondygnacje z jasnego kamienia i drewnianych lameli zawieszone nad oceanem.',
        'Basen bez krawędzi biegnie wzdłuż całej fasady i kończy się tam, gdzie zaczyna się klif.',
      ],
      en: [
        'Three storeys of pale stone and timber louvres suspended above the ocean.',
        'An infinity pool runs along the whole facade and ends where the cliff begins.',
      ],
    },
    [
      {
        pl: 'Willa na klifie o zachodzie słońca, z basenem bez krawędzi nad oceanem',
        en: 'The clifftop villa at sunset, with an infinity pool above the ocean',
      },
      {
        pl: 'Taras z leżakami i basen wzdłuż fasady, podświetlone pasami światła',
        en: 'The terrace with loungers and the pool along the facade, lit by strips of light',
      },
      {
        pl: 'Przeszklone kondygnacje willi z bliska, z widokiem na morze',
        en: 'The glazed storeys of the villa up close, with a view of the sea',
      },
    ],
  ),
  baltyk: residence(
    'baltyk',
    {
      pl: [
        'Rezydencja z trawertynu i szkła na zalesionym klifie, nad mglistym wybrzeżem.',
        'Taras z zagłębionym paleniskiem przechodzi w basen bez krawędzi, który wizualnie łączy się z morzem.',
      ],
      en: [
        'A travertine and glass residence on a forested cliff above a misty coastline.',
        'A terrace with a sunken fire pit flows into an infinity pool that visually merges with the sea.',
      ],
    },
    [
      {
        pl: 'Zagłębione palenisko z kanapami na tarasie, za nim basen i przeszklony dom',
        en: 'A sunken fire pit with sofas on the terrace, the pool and glazed house behind',
      },
      {
        pl: 'Basen bez krawędzi wzdłuż domu, w tle zalesione wzgórza we mgle',
        en: 'The infinity pool along the house, with forested hills in the mist behind',
      },
      {
        pl: 'Narożnik basenu nad morzem o zachodzie słońca',
        en: 'The corner of the pool above the sea at sunset',
      },
    ],
  ),
  pawilon: residence(
    'pawilon',
    {
      pl: [
        'Pawilon z trawertynu, w którym wnętrze od lasu oddziela jedna tafla szkła.',
        'Salon z kominkiem otwiera się wprost na basen, a ściany z drewnianych lameli ocieplają wieczorne światło.',
      ],
      en: [
        'A travertine pavilion where a single pane of glass separates the interior from the forest.',
        'The living room with its fireplace opens straight onto the pool, while timber-slatted walls warm the evening light.',
      ],
    },
    [
      {
        pl: 'Pawilon z trawertynu o zmierzchu, z basenem przed przeszkloną ścianą',
        en: 'The travertine pavilion at dusk, with the pool in front of the glass wall',
      },
      {
        pl: 'Widok przez szklaną ścianę na salon z kanapą i kominkiem',
        en: 'A view through the glass wall into the living room with a sofa and fireplace',
      },
      {
        pl: 'Wnętrze salonu z narożną kanapą, ogniem w palenisku i schodami w tle',
        en: 'The living room with a corner sofa, a fire in the hearth and stairs behind',
      },
    ],
  ),
  skaly: residence(
    'skaly',
    {
      pl: [
        'Dom ze stali kortenowskiej i szkła wśród czerwonych skał, w kolorach otaczającego krajobrazu.',
        'Wąski basen prowadzi do rozświetlonej kuchni i salonu, a na dziedzińcu rosną oliwka i lawenda.',
      ],
      en: [
        'A weathering steel and glass house among red rocks, in the colours of the surrounding landscape.',
        'A narrow pool leads to the lit kitchen and living room, with an olive tree and lavender in the courtyard.',
      ],
    },
    [
      {
        pl: 'Basen odbijający różowe niebo, w tle rozświetlone wnętrze i czerwone skały',
        en: 'The pool reflecting the pink sky, with the lit interior and red rocks behind',
      },
      {
        pl: 'Wąski basen prowadzący do przeszklonej kuchni z kominkiem',
        en: 'The narrow pool leading to the glazed kitchen with a fireplace',
      },
      {
        pl: 'Dziedziniec z oliwką i lawendą przed kortenowym portalem',
        en: 'The courtyard with an olive tree and lavender in front of the weathering steel portal',
      },
    ],
  ),
};
