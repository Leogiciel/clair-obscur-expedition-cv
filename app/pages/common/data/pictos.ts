import {yearsSince} from './experiences';

export type Element = 'neutral' | 'green' | 'red' | 'cyan';
export type LuminaCategory = 'Offensive' | 'Defensive' | 'Support';

export interface Picto {
  id: string;
  name: string;
  // Years of practice, from the CV dates.
  level: number;
  element: Element;
  // Lumina tab, as in the game's Luminas screen.
  category: LuminaCategory;
  stats: [{label: string; value: string}, {label: string; value: string}];
  description: string;
}

// Qualities and interests drawn from the 2026 CV. Levels count years: leadership since the SAP front-end team,
// entrepreneurship since AwesomeApps, delivery since the first position, quality since the SAP handbooks; the
// interests give their own durations.
export const PICTOS: Picto[] = [
  {id: 'leadership', name: 'Leadership', level: yearsSince('2017-12'), element: 'red', category: 'Support',
    stats: [{label: 'Coached', value: '5'}, {label: 'Teams led', value: '3'}],
    description: 'Coached 5 developers at Coinhouse, led the SAP front-end team, CTO at Podspace.'},
  {id: 'entrepreneurship', name: 'Entrepreneurship', level: yearsSince('2019-09'), element: 'green', category: 'Offensive',
    stats: [{label: 'Customers', value: '200'}, {label: 'Products', value: '3'}],
    description: 'Founded AwesomeApps: Shopify apps with 200 paying customers, then car rental and nutrition apps.'},
  {id: 'delivery', name: 'Delivery', level: yearsSince('2015-10'), element: 'cyan', category: 'Offensive',
    stats: [{label: 'Sessions', value: '2,000+'}, {label: 'Hours', value: '3,000'}],
    description: 'Shipped Podspace end to end: 2,000+ sessions and ~3,000 hours of video processed.'},
  {id: 'quality', name: 'Quality', level: yearsSince('2017-12'), element: 'neutral', category: 'Defensive',
    stats: [{label: 'Coverage', value: '80%'}, {label: 'Handbooks', value: '2'}],
    description: 'Tests at 80% coverage on all new code; onboarding and best-practice docs at Coinhouse and SAP.'},
  {id: 'music', name: 'Music', level: 22, element: 'cyan', category: 'Support',
    stats: [{label: 'Piano', value: '22y'}, {label: 'Guitar', value: '13y'}],
    description: 'Self-taught: piano for 22 years, guitar 13, violin 8, drums 1.'},
  {id: 'sports', name: 'Sports', level: 10, element: 'green', category: 'Defensive',
    stats: [{label: 'Baseball', value: '10y'}, {label: 'Dance', value: '7y'}],
    description: 'Baseball for 10 years, dance 7, martial arts 5.'},
];

export const PICTO_SLOTS = 3;
export const DEFAULT_PICTOS = ['leadership', 'entrepreneurship', 'delivery'];

export const pictoById = (id: string) => PICTOS.find((p) => p.id === id)!;
