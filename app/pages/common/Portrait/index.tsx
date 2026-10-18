import { publicUrl } from '~/publicUrl';

// Head-and-shoulders bust of the character, framed like the game's party portraits and cropped from the overview
// still (scripts/character); fills the frame it is placed in.
const Portrait = () => (
  <img src={publicUrl('ui/portrait.webp')} alt="" className="block size-full object-cover" aria-hidden />
);

export default Portrait;
