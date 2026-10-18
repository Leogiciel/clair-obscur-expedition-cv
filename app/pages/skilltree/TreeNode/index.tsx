import type { TreeNode as Node } from '../../common/data';
import NodeIcon from '../NodeIcon';
import './style.scss';

interface TreeNodeProps {
  node: Node;
  x: number;
  y: number;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}

// The game's tree diamond: a dark tile with a thin, ragged white rim (painted look, SVG filter #tree-paint);
// learned skills show their art (here the tech logo), locked ones a white padlock.
const TreeNode = ({ node, x, y, active, onHover, onLeave }: TreeNodeProps) => (
  <button
    type="button"
    data-tree
    className={`TreeNode ${node.locked ? 'TreeNode--locked' : ''} ${active ? 'TreeNode--active' : ''}`}
    style={{ left: x, top: y }}
    aria-label={`${node.name}${node.locked ? ', locked' : ''}`}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    onFocus={onHover}
    onBlur={onLeave}
  >
    <svg className="TreeNode-diamond" viewBox="0 0 130 130" aria-hidden>
      <path d="M65 8 L122 65 L65 122 L8 65 Z" className="TreeNode-fill" />
      <path d="M65 8 L122 65 L65 122 L8 65 Z" className="TreeNode-rim" filter="url(#tree-paint)" />
    </svg>
    <span className="TreeNode-content">
      {node.locked ? (
        <svg viewBox="0 0 24 24" width="40%" height="40%" aria-hidden>
          <path d="M7.5 11 V8 a4.5 4.5 0 0 1 9 0 V11" fill="none" stroke="#f2f0ea" strokeWidth="2.2" />
          <rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="#f2f0ea" />
          <circle cx="12" cy="15" r="1.5" fill="#1c1c1b" />
          <path d="M12 15 V18" stroke="#1c1c1b" strokeWidth="1.2" />
        </svg>
      ) : (
        <NodeIcon icon={node.icon} />
      )}
    </span>
  </button>
);

export default TreeNode;
