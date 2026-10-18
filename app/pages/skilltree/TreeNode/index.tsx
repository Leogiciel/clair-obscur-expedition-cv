import type {TreeNode as Node} from '../../common/data';
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

// The game's tree diamond: learned skills show their art (here the tech logo) on dark, locked ones a padlock on white.
const TreeNode = ({node, x, y, active, onHover, onLeave}: TreeNodeProps) => (
  <button
    type="button"
    data-tree
    className={`TreeNode ${node.locked ? 'TreeNode--locked' : ''} ${active ? 'TreeNode--active' : ''}`}
    style={{left: x, top: y}}
    aria-label={`${node.name}${node.locked ? ', locked' : ''}`}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    onFocus={onHover}
    onBlur={onLeave}
  >
    <span className="TreeNode-diamond">
      <span className="TreeNode-content">
        {node.locked ? (
          <svg viewBox="0 0 24 24" width="46%" height="46%" aria-hidden>
            <path d="M7 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke="#111" strokeWidth="2.4"/>
            <rect x="5" y="11" width="14" height="10" rx="1.5" fill="#111"/>
            <circle cx="12" cy="15.5" r="1.6" fill="#f2f0ea"/>
          </svg>
        ) : (
          <NodeIcon icon={node.icon}/>
        )}
      </span>
    </span>
  </button>
);

export default TreeNode;
