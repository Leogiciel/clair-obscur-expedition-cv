import Label from '../../common/Label';
import Num from '../../common/Num';

const LevelBlock = ({level}: {level: number}) => (
  <span className="flex flex-col items-center"><Label size={26}>Level</Label><Num size={56}>{level}</Num></span>
);

export default LevelBlock;
