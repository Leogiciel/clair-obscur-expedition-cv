import {siSap} from 'simple-icons';
import type {TechId} from './tech';

export type CompanyLogo = {src: string} | {icon: typeof siSap};

export interface Experience {
  id: string;
  title: string;
  company: string;
  logo: CompanyLogo;
  // YYYY-MM; no end for the current position.
  start: string;
  end?: string;
  highlights: string[];
  // The CV's stack line, then the technologies its bullets name.
  stack: TechId[];
  figure?: {value: string; label: string};
  freelance?: boolean;
}

// From the 2026 CV plus the BeeWyze freelance mission, most recent first (current positions, then by end date).
// AwesomeApps runs alongside the salaried positions.
const POSITIONS: Experience[] = [
  {
    id: 'podspace', title: 'CTO', company: 'Podspace', logo: {src: '/ui/logos/podspace.svg'}, start: '2025-11',
    figure: {value: '2,000+', label: 'Sessions'},
    highlights: [
      'Built and led end-to-end development of the Podspace platform: studio booking, AI video production, publishing pipeline and internal ops tools.',
      'Delivered 2,000+ podcast sessions and processed ~3,000 hours of audio and video for several thousand users.',
      'Designed a full TypeScript stack (React/Next.js, Node.js, tRPC, PostgreSQL) on Vercel, AWS and Cloudflare.',
      'Built an AI video pipeline: GPU processing, FFmpeg, ONNX face tracking, auto-clipping, subtitles, brand templates editor.',
      'Shipped a cross-platform desktop app (Tauri) and the automation suite: Stripe billing, scheduling, calendar sync, Terraform.',
    ],
    stack: ['react', 'typescript', 'node', 'postgres', 'aws', 'openai', 'gemini', 'groq', 'nextjs', 'trpc', 'tauri'],
  },
  {
    id: 'awesomeapps', title: 'Founder & Developer', company: 'AwesomeApps', logo: {src: '/ui/logos/awesomeapps.webp'}, start: '2019-09',
    figure: {value: '200', label: 'Customers'},
    highlights: [
      'E-commerce web applications for Shopify, from design to support: database and UI design, front/back architecture, REST API.',
      '200 paying customers.',
      'Developed and deployed a car rental management app in Remix and Node.js, serving 5 active clients.',
      'Building a nutrition web application with Next.js.',
    ],
    stack: ['react', 'typescript', 'graphql', 'rest', 'node', 'postgres', 'scss', 'shopify', 'remix', 'nextjs'],
  },
  {
    id: 'coinhouse', title: 'Lead Front-end', company: 'Coinhouse', logo: {src: '/ui/logos/coinhouse.png'}, start: '2022-02', end: '2025-08',
    figure: {value: '80%', label: 'Coverage'},
    highlights: [
      'Built new features: savings account, euro account, staking, SCA, Travel Rule, KYC refresh.',
      'Implemented the new design system and prepared the architecture for scale.',
      'Coached 5 developers.',
      'Unit and acceptance tests at 80% coverage on all new and refactored features.',
      'Detailed project documentation: onboarding and best practices.',
    ],
    stack: ['react', 'typescript', 'graphql', 'cssinjs', 'jest', 'testinglibrary'],
  },
  {
    id: 'beewyze', title: 'Founding Developer', company: 'BeeWyze', logo: {src: '/ui/logos/beewyze.webp'}, start: '2024-01', end: '2025-01',
    freelance: true,
    highlights: [
      'Founding front-end developer of BeeWyze, where artists raise donations for themselves and a cause, on stage and online.',
      'Built the web application with Remix and TypeScript.',
      'Integrated Web3Auth for sign-in.',
    ],
    stack: ['remix', 'typescript', 'web3auth'],
  },
  {
    id: 'sap', title: 'Front-end Developer', company: 'SAP (Recast.ai)', logo: {icon: siSap}, start: '2017-12', end: '2019-10',
    figure: {value: '16', label: 'React'},
    highlights: [
      'Created and improved platform tools: homepage redesign, chatbot optimisation, bots for messaging platforms, analytics.',
      'Refactored the architecture of several projects and migrated from React 15 to React 16.',
      'Managed the front-end team.',
      'Detailed project documentation and technical support for platform users.',
    ],
    stack: ['react', 'redux', 'javascript', 'jest', 'scss'],
  },
  {
    id: 'mobeye', title: 'Full Stack Developer', company: 'Mobeye', logo: {src: '/ui/logos/mobeye.webp'}, start: '2015-10', end: '2017-10',
    highlights: [
      'Redesigned the reporting and management tools.',
      'Built a mobile application with React Native.',
      'Improved the back-office tools.',
    ],
    stack: ['react', 'redux', 'meteor', 'reactnative', 'django', 'python', 'postgres', 'mongodb', 'scss'],
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parse = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return {y, m};
};
const label = (ym: string) => `${MONTHS[parse(ym).m - 1]} ${parse(ym).y}`;
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const index = (ym: string) => parse(ym).y * 12 + parse(ym).m - 1;

export const monthsOf = (e: Experience) => Math.max(1, index(e.end ?? today) - index(e.start));

// Months covered by several positions, counting overlaps (AwesomeApps ran alongside salaried jobs) once.
export const monthsAcross = (positions: Experience[]) => {
  const months = new Set<number>();
  for (const e of positions) {
    for (let m = index(e.start); m < index(e.end ?? today); m++) months.add(m);
  }
  return months.size;
};

// Levels read in whole years; a position under a year still counts as 1.
export const yearsOf = (months: number) => Math.max(1, Math.round(months / 12));

export const periodOf = (e: Experience) => `${label(e.start)} – ${e.end ? label(e.end) : 'today'}`;

export const levelOf = (e: Experience) => yearsOf(monthsOf(e));

export const yearsSince = (start: string) => yearsOf(index(today) - index(start));

// Under a year the duration reads in months, otherwise in years to the half.
export const durationOf = (e: Experience) => {
  const months = monthsOf(e);
  return months < 12 ? {value: String(months), label: 'Months'} : {value: String(Math.round(months / 6) / 2), label: 'Years'};
};

export const EXPERIENCES = POSITIONS;
