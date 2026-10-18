import Label from '../../common/Label';
import Num from '../../common/Num';
import CardTitle from '../../common/CardTitle';
import Tooltip from '../../common/Tooltip';
import {nodePositions, nodeYears, type TreeNode} from '../../common/data';
import NodeIcon from '../NodeIcon';

// Under the stats column, as in the game: icon and name, the years badge, then where the skill was used.
const NodeTooltip = ({node}: {node: TreeNode}) => {
  const positions = nodePositions(node).map((e) => e.company);
  const text = node.locked
    ? 'Locked: not used in a position yet.'
    : [node.note, positions.length ? `Used at ${positions.join(', ')}.` : ''].filter(Boolean).join(' ');
  return (
    <Tooltip left={1840} top={850} width={560} height={230}>
      <div className="absolute left-[4px] top-[1px] w-[470px]">
        <span className="absolute left-[2px] top-[-4px] grid size-[48px] place-items-center"><NodeIcon icon={node.icon}/></span>
        <CardTitle size={34} className="absolute left-[56px] top-[2px] whitespace-nowrap" style={{letterSpacing: '0.03em'}}>{node.name}</CardTitle>
        {!node.locked && (
          <span className="absolute left-[400px] top-[-8px] flex w-[60px] flex-col items-center"><Label size={20}>Years</Label><Num size={36}>{nodeYears(node)}</Num></span>
        )}
        <Label as="p" size={24} className="absolute left-[2px] top-[60px] w-[460px]" style={{lineHeight: 1.2}}>{text}</Label>
      </div>
    </Tooltip>
  );
};

export default NodeTooltip;
