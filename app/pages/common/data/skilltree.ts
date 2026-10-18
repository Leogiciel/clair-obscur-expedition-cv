import { EXPERIENCES, monthsAcross, yearsOf } from './experiences';
import type { TechId } from './tech';

export type NodeIcon = TechId | 'lead' | 'cto';

export interface TreeNode {
  id: string;
  name: string;
  // Grid cell, as in the game's tree: 6 columns, 5 rows, links between orthogonal neighbours.
  col: number;
  row: number;
  // Technologies the node covers, for its years and positions; the first one gives the logo.
  techs: TechId[];
  icon: NodeIcon;
  // Not used in a position yet.
  locked?: boolean;
  note?: string;
}

// Learning path from the CV: the two roots (JavaScript, React), front on the left, back and data on the right,
// mobile and desktop below, then leadership. Locked nodes are languages not used professionally yet.
export const TREE: TreeNode[] = [
  { id: 'svelte', name: 'Svelte', col: 0, row: 0, techs: ['svelte'], icon: 'svelte', locked: true },
  {
    id: 'javascript',
    name: 'JavaScript',
    col: 2,
    row: 0,
    techs: ['javascript', 'typescript', 'react'],
    icon: 'javascript'
  },
  { id: 'react', name: 'React', col: 3, row: 0, techs: ['react'], icon: 'react' },
  { id: 'go', name: 'Go', col: 5, row: 0, techs: ['go'], icon: 'go', locked: true },

  {
    id: 'styling',
    name: 'Styling',
    col: 0,
    row: 1,
    techs: ['scss', 'cssinjs'],
    icon: 'scss',
    note: 'SCSS and CSS-in-JS, design systems.'
  },
  { id: 'redux', name: 'Redux', col: 1, row: 1, techs: ['redux'], icon: 'redux' },
  { id: 'typescript', name: 'TypeScript', col: 2, row: 1, techs: ['typescript'], icon: 'typescript' },
  { id: 'node', name: 'Node.js', col: 3, row: 1, techs: ['node'], icon: 'node' },
  {
    id: 'sql',
    name: 'SQL',
    col: 4,
    row: 1,
    techs: ['postgres', 'mysql', 'oracle', 'sql'],
    icon: 'postgres',
    note: 'PostgreSQL, MySQL, Oracle.'
  },
  { id: 'python', name: 'Python', col: 5, row: 1, techs: ['python'], icon: 'python' },

  {
    id: 'tests',
    name: 'Tests',
    col: 0,
    row: 2,
    techs: ['jest', 'testinglibrary'],
    icon: 'jest',
    note: 'Jest and Testing Library, 80% coverage at Coinhouse.'
  },
  { id: 'graphql', name: 'GraphQL', col: 1, row: 2, techs: ['graphql'], icon: 'graphql' },
  { id: 'nextjs', name: 'Next.js', col: 2, row: 2, techs: ['nextjs'], icon: 'nextjs' },
  { id: 'trpc', name: 'tRPC', col: 3, row: 2, techs: ['trpc'], icon: 'trpc' },
  { id: 'mongodb', name: 'MongoDB', col: 4, row: 2, techs: ['mongodb'], icon: 'mongodb' },
  { id: 'django', name: 'Django', col: 5, row: 2, techs: ['django'], icon: 'django' },

  { id: 'remix', name: 'Remix', col: 1, row: 3, techs: ['remix'], icon: 'remix' },
  { id: 'reactnative', name: 'React Native', col: 2, row: 3, techs: ['reactnative'], icon: 'reactnative' },
  {
    id: 'tauri',
    name: 'Tauri',
    col: 3,
    row: 3,
    techs: ['tauri'],
    icon: 'tauri',
    note: 'Cross-platform desktop app at Podspace.'
  },
  { id: 'rust', name: 'Rust', col: 4, row: 3, techs: ['rust'], icon: 'rust' },
  { id: 'ruby', name: 'Ruby', col: 5, row: 3, techs: ['ruby'], icon: 'ruby', locked: true },

  {
    id: 'lead',
    name: 'Lead',
    col: 2,
    row: 4,
    techs: [],
    icon: 'lead',
    note: 'Led the SAP front-end team, coached 5 developers at Coinhouse.'
  },
  {
    id: 'cto',
    name: 'CTO / Founder',
    col: 3,
    row: 4,
    techs: [],
    icon: 'cto',
    note: 'CTO at Podspace, founder of AwesomeApps.'
  },
  {
    id: 'cloud',
    name: 'Cloud & AI',
    col: 4,
    row: 4,
    techs: ['aws', 'openai', 'gemini', 'groq'],
    icon: 'aws',
    note: 'AWS, OpenAI, Gemini and Groq at Podspace.'
  },
  { id: 'spring', name: 'Java Spring', col: 5, row: 4, techs: ['spring'], icon: 'spring', locked: true }
];

// Leadership nodes are counted from the positions that carry them.
const LEADERSHIP: Record<string, string[]> = { lead: ['sap', 'coinhouse'], cto: ['podspace', 'awesomeapps'] };

export const nodePositions = (n: TreeNode) =>
  EXPERIENCES.filter(
    (e) => (LEADERSHIP[n.id] ?? []).includes(e.id) || e.stack.some((t) => n.techs.includes(t))
  );

export const nodeYears = (n: TreeNode) => (n.locked ? 0 : yearsOf(monthsAcross(nodePositions(n))));

export const treeLinks = () =>
  TREE.flatMap((a) =>
    TREE.filter(
      (b) => (b.col === a.col + 1 && b.row === a.row) || (b.row === a.row + 1 && b.col === a.col)
    ).map((b) => [a, b] as const)
  );

export const careerYears = () => yearsOf(monthsAcross(EXPERIENCES));
