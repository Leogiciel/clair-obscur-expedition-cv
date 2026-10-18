import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router';

import KeyHint from '~/components/ui-kit/KeyHint';
import SelectFx from '~/components/ui-kit/SelectFx';
import TextureMainPicto from '~/components/ui-kit/TextureMainPicto';
import TextureMainSkill from '~/components/ui-kit/TextureMainSkill';
import TextureMainWeapon from '~/components/ui-kit/TextureMainWeapon';

import CompanyLogo from '../common/CompanyLogo';
import Glyph from '../common/Glyph';
import IconButton from '../common/IconButton';
import LinkedInMark from '../common/LinkedInMark';
import Luminas from '../common/Luminas';
import SectionTitle from '../common/SectionTitle';
import type { StageContext } from '../common/StageLayout';
import TechIcon from '../common/TechIcon';
import { EXPERIENCES, LINKEDIN_URL, levelOf, pictoById, skillById } from '../common/data';
import useLoadout from '../common/store/useLoadout';
import useArrowNav from '../common/useArrowNav';

// Picto slots measured on the video: all three share the unselected slot's box (x 108, 522 wide). The first one
// looked wider in the capture only because it was selected (grown 1.1).
const PICTO_SLOTS = [
  { x: 108, y: 1010, width: 522 },
  { x: 108, y: 1121, width: 522 },
  { x: 108, y: 1233, width: 522 }
];

const SKILL_ORIGIN = { x: 836.5, y: 1106 };
const SKILL_STEP = { x: 413.5, y: 82.5 };

const Home = () => {
  const { from } = useOutletContext<StageContext>();
  const [active, setActive] = useState<string | null>(null);
  const experienceRef = useRef<HTMLAnchorElement>(null);
  const pictoRef = useRef<HTMLAnchorElement>(null);
  const skillRef = useRef<HTMLAnchorElement>(null);
  const loadout = useLoadout();
  useArrowNav('[data-nav]');
  const current = EXPERIENCES.find((e) => e.id === loadout.experience) ?? EXPERIENCES[0];
  const pictos = loadout.pictos.map((p) => (p ? pictoById(p) : null));
  const skills = loadout.skills.map((s) => (s ? skillById(s) : null));

  // Back from a list screen lands on the slot that opened it, selected, as in the game.
  useEffect(() => {
    if (from === '/experience') experienceRef.current?.focus({ preventScroll: true });
    if (from === '/pictos') pictoRef.current?.focus({ preventScroll: true });
    if (from === '/skills') skillRef.current?.focus({ preventScroll: true });
  }, [from]);

  // Mouse hover and keyboard focus share one state so the effect follows focus.
  const activeProps = (id: string) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive((a) => (a === id ? null : a)),
    onFocus: () => setActive(id),
    onBlur: () => setActive((a) => (a === id ? null : a))
  });
  const itemClass = (id: string) => `Screen-item ${active === id ? 'Screen-item--active' : ''}`;

  return (
    <>
      <SectionTitle x={163} y={760}>
        Experience
      </SectionTitle>
      <Link
        ref={experienceRef}
        data-nav
        to="/experience"
        className={itemClass('experience')}
        style={
          {
            left: 118,
            top: 816,
            width: 522,
            height: 130,
            '--slide': '0px',
            '--sel-scale': 1.1
          } as React.CSSProperties
        }
        aria-label={`Experience: ${current.title}, ${current.company}`}
        {...activeProps('experience')}
      >
        <div className="Screen-slide">
          <TextureMainWeapon icon={<CompanyLogo experience={current} />} level={levelOf(current)}>
            {current.title}
          </TextureMainWeapon>
        </div>
        <SelectFx kind="weapon" active={active === 'experience'} grow={1.1} />
      </Link>

      <SectionTitle x={163} y={956}>
        Pictos
      </SectionTitle>
      <ul aria-label="Pictos">
        {PICTO_SLOTS.map((slot, i) => {
          const picto = pictos[i];
          const id = `picto-${i}`;
          return (
            <li key={id} className="contents">
              <Link
                ref={i === 0 ? pictoRef : undefined}
                data-nav
                to="/pictos"
                className={itemClass(id)}
                style={
                  {
                    left: slot.x,
                    top: slot.y,
                    width: slot.width,
                    height: 113,
                    '--slide': '0px',
                    '--sel-scale': 1.1
                  } as React.CSSProperties
                }
                aria-label={picto ? `Pictos: ${picto.name}` : 'Pictos: empty slot'}
                {...activeProps(id)}
              >
                <div className="Screen-slide">
                  {picto ? (
                    <TextureMainPicto
                      width={slot.width}
                      icon={<Glyph element={picto.element} />}
                      level={picto.level}
                    >
                      {picto.name}
                    </TextureMainPicto>
                  ) : (
                    <TextureMainPicto variant="empty" width={slot.width} />
                  )}
                </div>
                <SelectFx kind="picto" active={active === id} fit={{ width: slot.width, height: 113 }} />
              </Link>
            </li>
          );
        })}
      </ul>

      <SectionTitle x={856} y={1048}>
        Skills
      </SectionTitle>
      <ul aria-label="Skills">
        {skills.map((skill, i) => {
          const id = `skill-${i}`;
          // The active Skill goes under its neighbours (zIndex 0) so its smear slides under the left
          // neighbour's level badge instead of covering it, as in the game.
          return (
            <li key={id} className="contents">
              <Link
                ref={i === 0 ? skillRef : undefined}
                data-nav
                to="/skills"
                className={itemClass(id)}
                style={
                  {
                    left: SKILL_ORIGIN.x + (i % 2) * SKILL_STEP.x,
                    top: SKILL_ORIGIN.y + Math.floor(i / 2) * SKILL_STEP.y,
                    width: 406,
                    height: 80,
                    zIndex: active === id ? 0 : 1,
                    '--slide': '0px',
                    '--sel-scale': 1.1
                  } as React.CSSProperties
                }
                aria-label={skill ? `Skills: ${skill.name}` : 'Skills: empty slot'}
                {...activeProps(id)}
              >
                <div className="Screen-slide">
                  {skill ? (
                    <TextureMainSkill icon={<TechIcon id={skill.id} />} level={skill.level}>
                      {skill.name}
                    </TextureMainSkill>
                  ) : (
                    <TextureMainSkill empty />
                  )}
                </div>
                <SelectFx kind="skill" active={active === id} />
              </Link>
            </li>
          );
        })}
      </ul>

      <IconButton
        icon={<LinkedInMark />}
        className="absolute left-[1915px] top-[786px]"
        width={380}
        onClick={() => window.open(LINKEDIN_URL, '_blank', 'noopener')}
      >
        LinkedIn
      </IconButton>
      <Luminas />

      <div className="Screen-hints absolute left-[1965px] top-[1299px]">
        <KeyHint keyLabel="A" tone="a" label="Select" />
      </div>
    </>
  );
};

export default Home;
