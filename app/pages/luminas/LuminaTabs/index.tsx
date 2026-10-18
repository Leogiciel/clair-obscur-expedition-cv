import TextureButton from '~/components/ui-kit/TextureButton';
import KeyHint from '~/components/ui-kit/KeyHint';

interface LuminaTabsProps<T extends string> {
  tabs: T[];
  current: T;
  onChange: (tab: T) => void;
}

// Measured on the game screenshot (design/luminas-screen.webp): four chevron tabs between the Q and E hints; the
// current one is lit, its label gold. Labels are re-centred on the plate: the button's own label leaves room for
// an icon the tabs do not have.
const LuminaTabs = <T extends string>({tabs, current, onChange}: LuminaTabsProps<T>) => (
  <div role="tablist" aria-label="Lumina categories" className="absolute left-[130px] top-[300px] flex items-center gap-[4px]">
    <KeyHint keyLabel="Q" className="[&_.KeyHint-key]:size-[36px] [&_.KeyHint-key]:text-[18px]"/>
    {tabs.map((tab) => (
      <TextureButton
        key={tab}
        width={260}
        className={`[&_.TextureButton-label]:left-[60px] [&_.TextureButton-label]:text-[30px] ${tab === current ? '[&_.TextureButton-label]:text-[var(--ui-gold-name)]' : 'opacity-55'}`}
        onClick={() => onChange(tab)}
        buttonProps={{role: 'tab', 'aria-selected': tab === current}}
      >
        {tab}
      </TextureButton>
    ))}
    <KeyHint keyLabel="E" className="[&_.KeyHint-key]:size-[36px] [&_.KeyHint-key]:text-[18px]"/>
  </div>
);

export default LuminaTabs;
