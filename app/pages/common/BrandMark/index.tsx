import { useLayoutEffect, useRef, useState } from 'react';

// Marks darker than this (relative luminance) would vanish on the dark slots, so they use the UI text colour.
const DARK = 0.2;
const LIGHT = '#e8e2d0';
const MUTED = '#8a8780';

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

interface BrandMarkProps {
  // 24 × 24 path (Simple Icons) and its brand colour, or a short text when there is no mark.
  path?: string;
  hex?: string;
  text?: string;
  title: string;
  muted?: boolean;
  // Hidden from assistive tech, when the name is written next to the mark anyway.
  decorative?: boolean;
}

// Simple Icons marks are not all centred in their 24 × 24 box: once mounted, the view box is fitted to the drawn
// shape (a square around its centre), so every logo sits in the middle of its slot.
const BrandMark = ({
  path,
  hex = 'e8e2d0',
  text,
  title,
  muted = false,
  decorative = false
}: BrandMarkProps) => {
  const shape = useRef<SVGPathElement>(null);
  const [viewBox, setViewBox] = useState('0 0 24 24');
  useLayoutEffect(() => {
    if (!shape.current) return;
    const b = shape.current.getBBox();
    const side = Math.max(b.width, b.height);
    setViewBox(`${b.x + b.width / 2 - side / 2} ${b.y + b.height / 2 - side / 2} ${side} ${side}`);
  }, [path]);
  const fill = muted ? MUTED : luminance(hex) < DARK ? LIGHT : `#${hex}`;
  return (
    <svg
      viewBox={path ? viewBox : '0 0 24 24'}
      width="55%"
      height="55%"
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title })}
      opacity={muted ? 0.8 : 1}
    >
      {path ? (
        <path ref={shape} d={path} fill={fill} />
      ) : (
        <text
          x="12"
          y="12"
          dy="0.35em"
          textAnchor="middle"
          fontSize={!text || text.length <= 2 ? 11 : text.length > 3 ? 7 : 9}
          fontFamily="var(--font-label)"
          fontWeight="600"
          fill={muted ? MUTED : LIGHT}
        >
          {text}
        </text>
      )}
    </svg>
  );
};

export default BrandMark;
