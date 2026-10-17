import './style.scss';

interface KeyHintProps {
  keyLabel: string;
  label?: string;
  shape?: 'round' | 'pill';
  tone?: 'default' | 'x' | 'b' | 'y' | 'a';
  className?: string;
}

const KeyHint = ({keyLabel, label, shape = 'round', tone = 'default', className = ''}: KeyHintProps) => {
  return (
    <span className={`KeyHint ${className}`}>
      <kbd className={`KeyHint-key KeyHint-key--${shape} KeyHint-key--${tone}`}>{keyLabel}</kbd>
      {label && <span className="KeyHint-label">{label}</span>}
    </span>
  );
};

export default KeyHint;
