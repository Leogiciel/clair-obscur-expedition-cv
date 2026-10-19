import { publicUrl } from '~/publicUrl';

// Measured by scripts/ui-kit/extract/title-sort.py (px, 1x).
// Slab: light smear + badge (fixed) | body (stretched) | fringes + bevelled tip (fixed).
// key: center and radius of the hollow badge.
export const SLAB = {
  src: publicUrl('ui/tex/title-sort-slab.webp'),
  width: 396,
  height: 66,
  left: 105,
  right: 76,
  key: [68, 32, 25],
  labelLeft: 105,
  labelRight: 50,
  center: 31
};
