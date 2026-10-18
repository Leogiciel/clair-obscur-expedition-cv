import TextureCard from '~/components/ui-kit/TextureCard';

// Hovered-item tooltip: the card texture is translucent, so an opaque backing hides what is under it, as in the game.
const Tooltip = ({
  left,
  top,
  width,
  height,
  children
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  children: React.ReactNode;
}) => (
  <div className="pointer-events-none absolute" style={{ left, top, width, height }}>
    <div className="absolute inset-[20px_34px_8px_30px] bg-[var(--stage-bg)]" aria-hidden />
    <TextureCard className="absolute inset-0">
      <div role="status">{children}</div>
    </TextureCard>
  </div>
);

export default Tooltip;
