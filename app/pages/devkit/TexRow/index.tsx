import TexturePlate, { type TexturePlateVariant } from '~/components/ui-kit/TexturePlate';

import Portrait from '../../common/Portrait';
import Glyph from '../Glyph';
import Label from '../Label';
import Num from '../Num';

const TexRow = ({
  name,
  level,
  color,
  variant = 'normal',
  twoLines,
  x,
  y,
  w
}: {
  name: string;
  level: number;
  color: string;
  variant?: TexturePlateVariant;
  twoLines?: boolean;
  x: number;
  y: number;
  w?: number;
}) => (
  <TexturePlate
    variant={variant}
    width={w}
    className="absolute"
    style={{ left: x, top: y }}
    icon={<Glyph color={color} />}
    portrait={<Portrait />}
    aside={
      <span className="flex w-[44px] flex-col items-center">
        <Label size={19}>Level</Label>
        <Num size={36}>{level}</Num>
      </span>
    }
  >
    <span
      className="block"
      style={{
        fontFamily: 'var(--font-label)',
        fontWeight: 500,
        fontSize: twoLines ? 23 : 26,
        lineHeight: 1.05,
        maxWidth: twoLines ? 150 : undefined
      }}
    >
      {name}
    </span>
  </TexturePlate>
);

export default TexRow;
