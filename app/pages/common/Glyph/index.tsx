import type {Element} from '../data';

const ELEMENT_COLOR: Record<Element, string> = {
  neutral: '#cfcfcf',
  green: 'var(--el-green)',
  red: 'var(--el-red)',
  cyan: 'var(--el-cyan)',
};

const Glyph = ({element, muted = false}: {element: Element; muted?: boolean}) => (
  <svg viewBox="0 0 20 20" width="60%" height="60%" aria-hidden>
    <path d="M10 2l3 4h-2v3h4v-2l4 3-4 3v-2h-4v3h2l-3 4-3-4h2v-3H5v2l-4-3 4-3v2h4V6H7z" fill={muted ? '#8a8780' : ELEMENT_COLOR[element]} opacity={muted ? 0.75 : 1}/>
  </svg>
);

export default Glyph;
