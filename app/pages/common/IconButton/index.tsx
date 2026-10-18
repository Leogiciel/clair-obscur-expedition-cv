import KeyHint from '~/components/ui-kit/KeyHint';
import TextureButton from '~/components/ui-kit/TextureButton';

import DiamondIcon from '../DiamondIcon';
import './style.scss';

interface IconButtonProps {
  icon: React.ReactNode;
  keyLabel?: string;
  // Smaller label, for two buttons sharing a row.
  compact?: boolean;
  width?: number;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}

// The game's Edit Pictos button (design/luminas-screen.webp): optional keyboard key on the left, icon in a gold
// diamond on the plate's left tip, white label right after it and the gold dot at the chevron.
const IconButton = ({
  icon,
  keyLabel,
  compact = false,
  width = 420,
  className = '',
  onClick,
  children
}: IconButtonProps) => (
  <div className={`IconButton${compact ? ' IconButton--compact' : ''} ${className}`}>
    {keyLabel && (
      <button type="button" className="IconButton-key" onClick={onClick} tabIndex={-1} aria-hidden>
        <KeyHint keyLabel={keyLabel} shape="square" />
      </button>
    )}
    <TextureButton
      width={width}
      icon={<DiamondIcon>{icon}</DiamondIcon>}
      marked
      onClick={onClick}
      className="IconButton-button"
      buttonProps={{ 'data-nav': true }}
    >
      {children}
    </TextureButton>
  </div>
);

export default IconButton;
