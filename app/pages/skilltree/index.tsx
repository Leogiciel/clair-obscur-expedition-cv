import { useHotkeys } from '@tanstack/react-hotkeys';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import KeyHint from '~/components/ui-kit/KeyHint';
import { TREE, careerYears, treeLinks } from '~/data';

import useArrowNav from '../common/useArrowNav';
import NodeTooltip from './NodeTooltip';
import SkillPoints from './SkillPoints';
import TreeNode from './TreeNode';

// Measured on the game screenshot (design/skill-tree-screen.png) and scaled to the stage: columns 179px apart from
// x 517, rows 145px apart from y 655.
const GRID = { x: 517, y: 655, dx: 179, dy: 145 };
const at = (col: number, row: number) => ({ x: GRID.x + col * GRID.dx, y: GRID.y + row * GRID.dy });

const SkillTreePage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const shown = TREE.find((n) => n.id === hovered) ?? null;
  useArrowNav('[data-tree]');
  useHotkeys([
    { hotkey: 'Escape', callback: () => navigate('/skills') },
    { hotkey: 'B', callback: () => navigate('/skills') }
  ]);

  return (
    <>
      <svg className="absolute size-0" aria-hidden>
        <filter id="tree-paint" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="9" result="patches" />
          <feColorMatrix
            in="patches"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.4 -0.5"
            result="mask"
          />
          <feComposite in="rough" in2="mask" operator="in" result="worn" />
          <feGaussianBlur in="worn" stdDeviation="0.5" />
        </filter>
      </svg>
      <svg className="pointer-events-none absolute left-0 top-0" width={2510} height={1380} aria-hidden>
        {treeLinks().map(([a, b]) => {
          const p = at(a.col, a.row);
          const q = at(b.col, b.row);
          const lit = !a.locked && !b.locked;
          return (
            <line
              key={`${a.id}-${b.id}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={lit ? '#d9d5cb' : '#6d6a63'}
              strokeWidth={lit ? 3 : 2}
              opacity={lit ? 0.85 : 0.6}
            />
          );
        })}
      </svg>

      <ul aria-label="Skill tree">
        {TREE.map((node) => {
          const p = at(node.col, node.row);
          return (
            <li key={node.id}>
              <TreeNode
                node={node}
                x={p.x}
                y={p.y}
                active={hovered === node.id}
                onHover={() => setHovered(node.id)}
                onLeave={() => setHovered((h) => (h === node.id ? null : h))}
              />
            </li>
          );
        })}
      </ul>

      <SkillPoints years={careerYears()} />
      {shown && <NodeTooltip node={shown} />}

      <div className="Screen-hints absolute left-[1965px] top-[1293px]">
        <button type="button" className="contents" onClick={() => navigate('/skills')}>
          <KeyHint keyLabel="B" tone="b" label="Back" />
        </button>
      </div>
    </>
  );
};

export default SkillTreePage;
