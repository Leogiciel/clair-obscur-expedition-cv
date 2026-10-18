import IconButton from '../../common/IconButton';

// The picto sigil in the game's Edit Pictos button: a cyan crest.
const PictoSigil = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <path d="M22 1 L38 22 L22 45 L6 22 Z M6 22 H38 M15 22 V40 M22 22 V45 M29 22 V40 M10 31 H34" transform="translate(0 -1) scale(1 0.92)" fill="none" stroke="#3fd3cf" strokeWidth="2.4" strokeLinejoin="round"/>
  </svg>
);

// Placed as in the game screenshot (design/luminas-screen.webp), C opens it.
const EditPictos = ({onOpen}: {onOpen: () => void}) => (
  <IconButton icon={<PictoSigil/>} keyLabel="C" className="absolute left-[1866px] top-[786px]" onClick={onOpen}>
    Edit Pictos
  </IconButton>
);

export default EditPictos;
