import Label from '../../common/Label';
import Num from '../../common/Num';

const MonthsBlock = ({ months }: { months: number }) => (
  <span className="flex flex-col items-center">
    <Label size={26}>Months</Label>
    <Num size={56}>{months}</Num>
  </span>
);

export default MonthsBlock;
