import type { ImageMetadata } from 'astro';
import baltyk from '../assets/properties/baltyk.jpg';
import cypel from '../assets/properties/cypel.jpg';
import klif from '../assets/properties/klif.jpg';
import pawilon from '../assets/properties/pawilon.jpg';
import pinie from '../assets/properties/pinie.jpg';
import skaly from '../assets/properties/skaly.jpg';
import tatry from '../assets/properties/tatry.jpg';
import toskania from '../assets/properties/toskania.jpg';

type Localized = { pl: string; en: string };

export type Placement = 'wide' | 'left' | 'right' | 'more';

export type Property = {
  id: string;
  image: ImageMetadata;
  preview: string;
  placement: Placement;
  focus: string;
  name: Localized;
  location: Localized;
  alt: Localized;
  transactionPrice: number | null;
};

export const properties: Property[] = [
  {
    id: 'cypel',
    image: cypel,
    preview: '/video/cypel.mp4',
    placement: 'wide',
    focus: '50% 50%',
    name: { pl: 'Rezydencja na cyplu', en: 'Headland residence' },
    location: { pl: 'Minorka, Hiszpania', en: 'Menorca, Spain' },
    alt: {
      pl: 'Jasna, kanciasta rezydencja na skalistym cyplu otoczonym morzem, z długim basenem i geometrycznymi ogrodami o zmierzchu',
      en: 'A pale, angular residence on a rocky headland surrounded by the sea, with a long pool and geometric gardens at dusk',
    },
    transactionPrice: null,
  },
  {
    id: 'toskania',
    image: toskania,
    preview: '/video/toskania.mp4',
    placement: 'left',
    focus: '50% 45%',
    name: { pl: 'Posiadłość wśród cyprysów', en: 'Cypress estate' },
    location: { pl: "Val d'Orcia, Włochy", en: "Val d'Orcia, Italy" },
    alt: {
      pl: 'Kamienna posiadłość na wzgórzu wśród alej cyprysów i gajów oliwnych w złotym świetle, z basenem i kolistym podjazdem',
      en: 'A stone estate on a hilltop among cypress avenues and olive groves in golden light, with a pool and a circular driveway',
    },
    transactionPrice: null,
  },
  {
    id: 'tatry',
    image: tatry,
    preview: '/video/tatry.mp4',
    placement: 'right',
    focus: '40% 50%',
    name: { pl: 'Sanktuarium pod Tatrami', en: 'Tatra sanctuary' },
    location: { pl: 'Podhale, Polska', en: 'Podhale, Poland' },
    alt: {
      pl: 'Górska rezydencja z drewna i kamienia z parującym basenem na tle ośnieżonych szczytów o zmierzchu',
      en: 'A mountain residence of timber and stone with a steaming pool against snowy peaks at dusk',
    },
    transactionPrice: null,
  },
  {
    id: 'pinie',
    image: pinie,
    preview: '/video/pinie.mp4',
    placement: 'wide',
    focus: '50% 55%',
    name: { pl: 'Rezydencja w sosnach pinii', en: 'Stone pine residence' },
    location: { pl: 'Ramatuelle, Francja', en: 'Ramatuelle, France' },
    alt: {
      pl: 'Ciemna, przeszklona rezydencja wśród sosen pinii, z basenem i rozległym trawnikiem o zmierzchu',
      en: 'A dark, glazed residence among stone pines, with a pool and a wide lawn at dusk',
    },
    transactionPrice: null,
  },
  {
    id: 'klif',
    image: klif,
    preview: '/video/klif.mp4',
    placement: 'more',
    focus: '35% 55%',
    name: { pl: 'Rezydencja na klifie', en: 'Clifftop residence' },
    location: { pl: 'Algarve, Portugalia', en: 'Algarve, Portugal' },
    alt: {
      pl: 'Trzykondygnacyjna willa z jasnego kamienia i drewnianych lameli na skalistym klifie, z długim basenem bez krawędzi nad morzem o zachodzie słońca',
      en: 'A three-storey villa of pale stone and timber louvres on a rocky cliff, with a long infinity pool above the sea at sunset',
    },
    transactionPrice: null,
  },
  {
    id: 'baltyk',
    image: baltyk,
    preview: '/video/baltyk.mp4',
    placement: 'more',
    focus: '40% 60%',
    name: { pl: 'Rezydencja nad Bałtykiem', en: 'Baltic coast residence' },
    location: { pl: 'Pomorze Zachodnie, Polska', en: 'West Pomerania, Poland' },
    alt: {
      pl: 'Rezydencja z trawertynu i szkła na zalesionym klifie o zmierzchu, z basenem bez krawędzi, rozległym tarasem i paleniskiem otoczonym kanapami',
      en: 'A travertine and glass residence on a forested cliff at dusk, with an infinity pool, a wide terrace and a fire pit surrounded by sofas',
    },
    transactionPrice: 18500000,
  },
  {
    id: 'pawilon',
    image: pawilon,
    preview: '/video/pawilon.mp4',
    placement: 'more',
    focus: '50% 50%',
    name: { pl: 'Pawilon z trawertynu', en: 'Travertine pavilion' },
    location: { pl: 'Beskid Śląski, Polska', en: 'Silesian Beskids, Poland' },
    alt: {
      pl: 'Pawilon z trawertynu o zmierzchu, z basenem przed przeszkloną ścianą salonu, w otoczeniu lasu',
      en: 'A travertine pavilion at dusk, with a pool in front of the glazed living room wall, surrounded by forest',
    },
    transactionPrice: null,
  },
  {
    id: 'skaly',
    image: skaly,
    preview: '/video/skaly.mp4',
    placement: 'more',
    focus: '45% 50%',
    name: { pl: 'Dom wśród czerwonych skał', en: 'Red rock house' },
    location: { pl: 'Andaluzja, Hiszpania', en: 'Andalusia, Spain' },
    alt: {
      pl: 'Dom ze stali kortenowskiej wśród czerwonych skał, z basenem odbijającym różowe niebo i rozświetlonym wnętrzem',
      en: 'A weathering steel house among red rocks, with a pool reflecting the pink sky and a lit interior',
    },
    transactionPrice: null,
  },
];
