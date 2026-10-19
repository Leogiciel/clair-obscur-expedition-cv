import { publicUrl } from '~/publicUrl';

export type TexturePlateVariant = 'normal' | 'selected' | 'hover';

// Measured by scripts/ui-kit/extract-borders.py (px, 1x). left/right: fixed slice parts.
// icon/portrait: center and half-diagonal of the hollow diamonds.
export const TEXTURES: Record<
  TexturePlateVariant,
  {
    src: string;
    width: number;
    height: number;
    left: number;
    right: number;
    icon: [number, number, number];
    portrait?: [number, number, number];
    // Icon diamond left edge and top rule: textures have different margins (smear, portrait), so rows
    // align on this anchor.
    anchor: [number, number];
    // Distance from the chevron tip to the texture's right edge (portrait and frays included).
    tail: number;
  }
> = {
  normal: {
    src: publicUrl('ui/tex/plate-normal.webp'),
    width: 337,
    height: 66,
    left: 60,
    right: 37,
    icon: [30, 32, 17],
    anchor: [9, 4],
    tail: 10
  },
  selected: {
    src: publicUrl('ui/tex/plate-selected.webp'),
    width: 374,
    height: 75,
    left: 62,
    right: 67,
    icon: [32, 41, 17],
    portrait: [340, 42, 22],
    anchor: [6, 12],
    tail: 54
  },
  hover: {
    src: publicUrl('ui/tex/plate-hover.webp'),
    width: 424,
    height: 72,
    left: 94,
    right: 62,
    icon: [62, 37, 18],
    portrait: [393, 37, 22],
    anchor: [37, 10],
    tail: 55
  }
};

// `length` runs from the icon diamond's left edge to the chevron tip, so the row keeps its geometry
// in every state.
export const plateBox = (variant: TexturePlateVariant, length: number) => {
  const t = TEXTURES[variant];
  return { left: -t.anchor[0], top: -t.anchor[1], width: length + t.anchor[0] + t.tail, height: t.height };
};
