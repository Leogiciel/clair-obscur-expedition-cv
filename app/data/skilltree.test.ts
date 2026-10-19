import { describe, expect, it } from 'vitest';

import { DEFAULT_PICTOS, PICTOS } from './pictos';
import { DEFAULT_SKILLS, SKILLS, SKILL_SLOTS, skillById } from './skills';
import { TREE, nodePositions, nodeYears, treeLinks } from './skilltree';
import { TECH } from './tech';

const COLS = 6;
const ROWS = 5;

describe('the skill tree', () => {
  it('places every node in its own cell of the 6 × 5 grid', () => {
    const cells = TREE.map((n) => `${n.col},${n.row}`);
    expect(new Set(cells).size).toBe(TREE.length);
    for (const n of TREE) {
      expect(n.col).toBeGreaterThanOrEqual(0);
      expect(n.col).toBeLessThan(COLS);
      expect(n.row).toBeGreaterThanOrEqual(0);
      expect(n.row).toBeLessThan(ROWS);
    }
  });

  it('names only known technologies', () => {
    for (const n of TREE) for (const t of n.techs) expect(TECH).toHaveProperty(t);
  });

  it('counts no years for a locked node, and some for every other one', () => {
    for (const n of TREE.filter((n) => n.locked)) expect(nodeYears(n)).toBe(0);
    for (const n of TREE.filter((n) => !n.locked)) expect(nodePositions(n)).not.toHaveLength(0);
  });

  it('links orthogonal neighbours only, each pair once', () => {
    const links = treeLinks();
    for (const [a, b] of links) expect(Math.abs(a.col - b.col) + Math.abs(a.row - b.row)).toBe(1);
    expect(new Set(links.map(([a, b]) => `${a.id}-${b.id}`)).size).toBe(links.length);
  });
});

describe('the skills', () => {
  it('count plain SQL from the relational databases the positions used', () => {
    const sql = skillById('sql');
    for (const db of ['postgres', 'mysql'] as const)
      expect(sql.level).toBeGreaterThanOrEqual(skillById(db).level);
  });

  it('default to the most practised ones, in the CV order on ties', () => {
    expect(DEFAULT_SKILLS).toHaveLength(SKILL_SLOTS);
    const levels = DEFAULT_SKILLS.map((id) => skillById(id).level);
    expect(levels).toEqual([...levels].sort((a, b) => b - a));
    const lowest = Math.min(...levels);
    for (const s of SKILLS.filter((s) => !DEFAULT_SKILLS.includes(s.id)))
      expect(s.level).toBeLessThanOrEqual(lowest);
  });
});

describe('the default loadout', () => {
  it('equips Pictos that exist, each once', () => {
    const ids = PICTOS.map((p) => p.id);
    for (const id of DEFAULT_PICTOS) expect(ids).toContain(id);
    expect(new Set(DEFAULT_PICTOS).size).toBe(DEFAULT_PICTOS.length);
  });
});
