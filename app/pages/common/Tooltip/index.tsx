import TextureCard from '~/components/ui-kit/TextureCard';

import './style.scss';

// Hovered-item tooltip: the card texture is translucent, so an opaque backing hides what is under it, as in the game.
// The card grows with its content so every tooltip keeps the same margins; its last text block stays in the flow.
const Tooltip = ({
  left,
  top,
  bottom,
  width,
  children
}: {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  children: React.ReactNode;
}) => (
  <div className="Tooltip pointer-events-none absolute" style={{ left, top, bottom, width }}>
    <div className="absolute inset-[20px_34px_8px_30px] bg-[var(--stage-bg)]" aria-hidden />
    <TextureCard className="Tooltip-card">
      <div role="status">{children}</div>
    </TextureCard>
  </div>
);

export default Tooltip;
