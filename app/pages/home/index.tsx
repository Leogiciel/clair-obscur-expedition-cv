import {useEffect, useRef, useState} from 'react';
import {Link, useOutletContext} from 'react-router';
import TextureMainWeapon from '~/components/ui-kit/TextureMainWeapon';
import TextureMainPicto from '~/components/ui-kit/TextureMainPicto';
import TextureMainSkill from '~/components/ui-kit/TextureMainSkill';
import TextureButton from '~/components/ui-kit/TextureButton';
import KeyHint from '~/components/ui-kit/KeyHint';
import SelectFx from '~/components/ui-kit/SelectFx';
import type {StageContext} from '../common/StageLayout';
import Glyph from '../common/Glyph';
import SectionTitle from '../common/SectionTitle';
import Luminas from '../common/Luminas';
import {EQUIPPED, EQUIPPED_SKILLS, LINKEDIN_URL, ROLES} from '../common/data';

// Picto slot boxes measured on the video (the 2nd is shifted 10px left).
const PICTO_SLOTS = [
  {x: 118, y: 1010, width: 512},
  {x: 108, y: 1121, width: 522},
  {x: 82, y: 1233, width: 568},
];

const SKILL_ORIGIN = {x: 836.5, y: 1106};
const SKILL_STEP = {x: 413.5, y: 82.5};

const Home = () => {
  const {from} = useOutletContext<StageContext>();
  const [active, setActive] = useState<string | null>(null);
  const roleRef = useRef<HTMLAnchorElement>(null);
  const pictoRef = useRef<HTMLAnchorElement>(null);
  const skillRef = useRef<HTMLAnchorElement>(null);
  const role = ROLES[0];

  // Back from a list screen lands on the slot that opened it, selected, as in the game.
  useEffect(() => {
    if (from === '/role') roleRef.current?.focus({preventScroll: true});
    if (from === '/pictos') pictoRef.current?.focus({preventScroll: true});
    if (from === '/skills') skillRef.current?.focus({preventScroll: true});
  }, [from]);

  // Mouse hover and keyboard focus share one state so the effect follows focus.
  const activeProps = (id: string) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive((a) => (a === id ? null : a)),
    onFocus: () => setActive(id),
    onBlur: () => setActive((a) => (a === id ? null : a)),
  });
  const itemClass = (id: string) => `Screen-item ${active === id ? 'Screen-item--active' : ''}`;

  return (
    <>
      <SectionTitle x={163} y={760}>Role</SectionTitle>
      <Link ref={roleRef} to="/role" className={itemClass('role')} style={{left: 118, top: 816, width: 522, height: 130, '--slide': '0px', '--sel-scale': 1.1} as React.CSSProperties} aria-label={`Role: ${role.title}`} {...activeProps('role')}>
        <div className="Screen-slide">
          <TextureMainWeapon icon={<Glyph element="neutral"/>} level={role.level}>{role.title}</TextureMainWeapon>
        </div>
        <SelectFx kind="weapon" active={active === 'role'} grow={1.1}/>
      </Link>

      <SectionTitle x={163} y={956}>Pictos</SectionTitle>
      <ul aria-label="Pictos">
        {PICTO_SLOTS.map((slot, i) => {
          const picto = EQUIPPED[i];
          const id = `picto-${i}`;
          return (
            <li key={id} className="contents">
              <Link
                ref={i === 0 ? pictoRef : undefined}
                to="/pictos"
                className={itemClass(id)}
                style={{left: slot.x, top: slot.y, width: slot.width, height: 113, '--slide': '0px', '--sel-scale': 1.1} as React.CSSProperties}
                aria-label={picto ? `Pictos: ${picto.name}` : 'Pictos: empty slot'}
                {...activeProps(id)}
              >
                <div className="Screen-slide">
                  {picto ? (
                    <TextureMainPicto width={slot.width} icon={<Glyph element={picto.element}/>} level={picto.level}>{picto.name}</TextureMainPicto>
                  ) : (
                    <TextureMainPicto variant="empty" width={slot.width}/>
                  )}
                </div>
                <SelectFx kind="picto" active={active === id}/>
              </Link>
            </li>
          );
        })}
      </ul>

      <SectionTitle x={856} y={1048}>Skills</SectionTitle>
      <ul aria-label="Skills">
        {EQUIPPED_SKILLS.map((skill, i) => {
          const id = `skill-${skill.id}`;
          // The active Skill goes under its neighbours (zIndex 0) so its smear slides under the left
          // neighbour's level badge instead of covering it, as in the game.
          return (
            <li key={id} className="contents">
              <Link
                ref={i === 0 ? skillRef : undefined}
                to="/skills"
                className={itemClass(id)}
                style={{left: SKILL_ORIGIN.x + (i % 2) * SKILL_STEP.x, top: SKILL_ORIGIN.y + Math.floor(i / 2) * SKILL_STEP.y, width: 406, height: 80, zIndex: active === id ? 0 : 1, '--slide': '0px', '--sel-scale': 1.1} as React.CSSProperties}
                aria-label={`Skills: ${skill.name}`}
                {...activeProps(id)}
              >
                <div className="Screen-slide">
                  <TextureMainSkill icon={<Glyph element={skill.element}/>} level={skill.level}>{skill.name}</TextureMainSkill>
                </div>
                <SelectFx kind="skill" active={active === id}/>
              </Link>
            </li>
          );
        })}
      </ul>

      <TextureButton className="absolute left-[1915px] top-[786px]" marked onClick={() => window.open(LINKEDIN_URL, '_blank', 'noopener')}>
        LinkedIn
      </TextureButton>
      <Luminas/>

      <div className="Screen-hints absolute left-[1965px] top-[1299px]">
        <KeyHint keyLabel="A" tone="a" label="Select"/>
      </div>
    </>
  );
};

export default Home;
