import {
  siDjango, siGooglegemini, siGraphql, siJavascript, siJest, siMeteor, siMongodb, siMysql, siNextdotjs, siNodedotjs,
  siPostgresql, siPython, siReact, siRedux, siRemix, siRust, siSass, siShopify, siSvelte, siTauri, siTestinglibrary,
  siTrpc, siTypescript, type SimpleIcon,
} from 'simple-icons';

export interface Tech {
  name: string;
  // Brand mark from Simple Icons (CC0), or a file for marks Simple Icons dropped (Iconify `logos`, CC0, lightened for
  // the dark slots); techs with neither show their initials.
  icon?: SimpleIcon;
  src?: string;
}

export const TECH = {
  react: {name: 'React', icon: siReact},
  typescript: {name: 'TypeScript', icon: siTypescript},
  javascript: {name: 'JavaScript', icon: siJavascript},
  graphql: {name: 'GraphQL', icon: siGraphql},
  reactnative: {name: 'React Native', icon: siReact},
  remix: {name: 'Remix', icon: siRemix},
  svelte: {name: 'Svelte', icon: siSvelte},
  nextjs: {name: 'Next.js', icon: siNextdotjs},
  node: {name: 'Node.js', icon: siNodedotjs},
  python: {name: 'Python', icon: siPython},
  django: {name: 'Django', icon: siDjango},
  rust: {name: 'Rust', icon: siRust},
  sql: {name: 'SQL'},
  mysql: {name: 'MySQL', icon: siMysql},
  oracle: {name: 'Oracle'},
  mongodb: {name: 'MongoDB', icon: siMongodb},
  postgres: {name: 'PostgreSQL', icon: siPostgresql},
  redux: {name: 'Redux', icon: siRedux},
  meteor: {name: 'Meteor', icon: siMeteor},
  scss: {name: 'SCSS', icon: siSass},
  cssinjs: {name: 'CSS-in-JS'},
  jest: {name: 'Jest', icon: siJest},
  testinglibrary: {name: 'Testing Library', icon: siTestinglibrary},
  rest: {name: 'REST API'},
  trpc: {name: 'tRPC', icon: siTrpc},
  tauri: {name: 'Tauri', icon: siTauri},
  shopify: {name: 'Shopify', icon: siShopify},
  aws: {name: 'AWS', src: '/ui/logos/aws.svg'},
  openai: {name: 'OpenAI', src: '/ui/logos/openai.svg'},
  gemini: {name: 'Gemini', icon: siGooglegemini},
  groq: {name: 'Groq'},
  web3auth: {name: 'Web3Auth'},
} satisfies Record<string, Tech>;

export type TechId = keyof typeof TECH;
