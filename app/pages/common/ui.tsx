import TexturePortraits, {TexturePortraitsKey} from '~/components/ui-kit/TexturePortraits';
import type {Element} from '../home/data';

const ELEMENT_COLOR: Record<Element, string> = {
  neutral: '#cfcfcf',
  green: 'var(--el-green)',
  red: 'var(--el-red)',
  cyan: 'var(--el-cyan)',
};

export const Glyph = ({element}: {element: Element}) => (
  <svg viewBox="0 0 20 20" width="60%" height="60%" aria-hidden>
    <path d="M10 2l3 4h-2v3h4v-2l4 3-4 3v-2h-4v3h2l-3 4-3-4h2v-3H5v2l-4-3 4-3v2h4V6H7z" fill={ELEMENT_COLOR[element]}/>
  </svg>
);

export const Num = ({children, size}: {children: React.ReactNode; size: number}) => (
  <span className="Screen-num" style={{fontSize: size}}>{children}</span>
);

export const Label = ({children, size}: {children: React.ReactNode; size: number}) => (
  <span className="Screen-label" style={{fontSize: size}}>{children}</span>
);

export const Grade = ({children}: {children: React.ReactNode}) => <span className="Screen-grade">{children}</span>;

export const SectionTitle = ({children, x, y}: {children: string; x: number; y: number}) => (
  <h2 className="Screen-title absolute" style={{left: x, top: y}}>
    <span>{children.charAt(0)}</span>
    {children.slice(1)}
  </h2>
);

// TODO: placeholder portrait until the generated character exists.
const PortraitStub = () => (
  <span className="block size-full" style={{background: 'radial-gradient(ellipse 30% 36% at 50% 40%, #8a6a52 0%, #5a4434 60%, transparent 100%), radial-gradient(ellipse 60% 40% at 50% 100%, #3c3b38 0%, transparent 100%), #111'}}/>
);

const Flag = () => (
  <svg viewBox="0 0 17 17" width="100%" height="100%" aria-hidden>
    <line x1="1" y1="0" x2="1" y2="17" stroke="var(--ui-gold)" strokeWidth="1"/>
    <path d="M1.6 0.8c5 1.6 8.5-1.6 15 0.8-1.6 2.4-1.6 4.8 0 7.2-6.5-2.4-10 0.8-15-0.8z" fill="var(--ui-gold-name)"/>
  </svg>
);

export const PartyBar = () => (
  <>
    <TexturePortraitsKey side="left" className="absolute left-[118px] top-[105px]">LB</TexturePortraitsKey>
    <TexturePortraits className="absolute left-[188px] top-[70px]" portrait={<PortraitStub/>} flag={<Flag/>}/>
    <TexturePortraits variant="active" className="absolute left-[320px] top-[54px]" portrait={<PortraitStub/>} flag={<Flag/>}/>
    <TexturePortraitsKey side="right" className="absolute left-[558px] top-[105px]">RB</TexturePortraitsKey>
  </>
);
