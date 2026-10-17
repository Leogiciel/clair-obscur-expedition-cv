import Label from '../../common/Label';
import Num from '../../common/Num';
import Grade from '../../common/Grade';
import type {Role} from '../../common/data';

const RoleStats = ({role}: {role: Role}) => (
  <>
    <span className="flex flex-col items-center gap-1"><Label size={27}>Years</Label><Num size={62}>{role.years}</Num></span>
    <span className="flex flex-col items-center gap-1"><Label size={27}>Team</Label><Num size={62}>{role.team}</Num></span>
    <span className="flex flex-col items-center gap-1"><Label size={22}>Leadership</Label><Grade>{role.leadership}</Grade></span>
    <span className="flex flex-col items-center gap-1"><Label size={22}>Delivery</Label><Grade>{role.delivery}</Grade></span>
  </>
);

export default RoleStats;
