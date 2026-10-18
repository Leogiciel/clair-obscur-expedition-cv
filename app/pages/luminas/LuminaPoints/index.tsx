import Label from '../../common/Label';
import Num from '../../common/Num';
import LuminaGlyph from '../LuminaGlyph';
import './style.scss';

// The game's "Available Lumina Points" plaque (design/luminas-screen.webp at 1360, 1090): brushed band and cyan
// rules extracted by scripts/ui-kit/extract/lumina-points.py, the label and the remaining points on top.
const LuminaPoints = ({ available }: { available: number }) => (
  <div className="LuminaPoints" role="status" aria-label={`${available} Lumina points available`}>
    <Label size={24} className="LuminaPoints-label">
      Available Lumina Points
    </Label>
    <div className="LuminaPoints-value">
      <Num size={60} style={{ color: 'var(--lumina-cyan)' }}>
        {available}
      </Num>
      <LuminaGlyph size={50} />
    </div>
  </div>
);

export default LuminaPoints;
