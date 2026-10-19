// The character's clips, by screen: one idle loop each and the camera moves between them.
import experienceToOverview from '~/assets/character/experience-overview.mp4';
import experienceClip from '~/assets/character/experience.mp4';
import framing from '~/assets/character/framing.json';
import luminasToOverview from '~/assets/character/luminas-overview.mp4';
import luminasToPictos from '~/assets/character/luminas-pictos.mp4';
import luminasClip from '~/assets/character/luminas.mp4';
import overviewToExperience from '~/assets/character/overview-experience.mp4';
import overviewToLuminas from '~/assets/character/overview-luminas.mp4';
import overviewToPictos from '~/assets/character/overview-pictos.mp4';
import overviewToSkills from '~/assets/character/overview-skills.mp4';
import overviewClip from '~/assets/character/overview.mp4';
import pictosToLuminas from '~/assets/character/pictos-luminas.mp4';
import pictosToOverview from '~/assets/character/pictos-overview.mp4';
import pictosClip from '~/assets/character/pictos.mp4';
import skillsToOverview from '~/assets/character/skills-overview.mp4';
import skillsToSkilltree from '~/assets/character/skills-skilltree.mp4';
import skillsClip from '~/assets/character/skills.mp4';
import skilltreeToSkills from '~/assets/character/skilltree-skills.mp4';
import skilltreeClip from '~/assets/character/skilltree.mp4';

export type Shot = keyof typeof framing;

// framing.json places each loop on the stage (also read by scripts/character/canvas.py). Game framings: overview
// head ≈ 29 % of the stage height with the face at 48 %; weapon head ≈ 22 % with the face at 61 %, kept right of the
// experience card; pictos head ≈ 31 % in profile, nose at 58 %; skills (arms crossed, face kept in frame unlike the
// game) head ≈ 27 % with the face at 56 %, above the slots.
export const LOOPS: Record<Shot, string> = {
  overview: overviewClip,
  experience: experienceClip,
  pictos: pictosClip,
  skills: skillsClip,
  luminas: luminasClip,
  skilltree: skilltreeClip
};

// Camera moves rendered on 16:9 canvases covering the stage width (2510 × 1412), ending on the next loop's first frame.
export const TRANSITIONS: Partial<Record<`${Shot}-${Shot}`, string>> = {
  'overview-experience': overviewToExperience,
  'experience-overview': experienceToOverview,
  'overview-pictos': overviewToPictos,
  'pictos-overview': pictosToOverview,
  'overview-skills': overviewToSkills,
  'skills-overview': skillsToOverview,
  'overview-luminas': overviewToLuminas,
  'luminas-overview': luminasToOverview,
  'luminas-pictos': luminasToPictos,
  // The generated return turned through the back of the head: it is the outward move played backwards.
  'pictos-luminas': pictosToLuminas,
  'skills-skilltree': skillsToSkilltree,
  'skilltree-skills': skilltreeToSkills
};

export const SHOTS = Object.keys(framing) as Shot[];
export const MOVE_KEYS = Object.keys(TRANSITIONS);

// The phone variant of each clip (scripts/character/encode_mobile.py): 1280 px on the long side, half the decoder
// memory and a third of the download, for screens too small to show the full resolution.
const MOBILE = import.meta.glob<string>('../../../assets/character/mobile/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default'
});
export const mobile = (name: string) => MOBILE[`../../../assets/character/mobile/${name}.mp4`];
export { framing };
