import {useState} from 'react';
import TitleRule from '~/components/ui-kit/TitleRule';
import KeyHint from '~/components/ui-kit/KeyHint';
import Damask from '~/components/ui-kit/Damask';
import TextureCard from '~/components/ui-kit/TextureCard';
import TextureEmpty from '~/components/ui-kit/TextureEmpty';
import TexturePortraits from '~/components/ui-kit/TexturePortraits';
import TexturePortraitsKey from '~/components/ui-kit/TexturePortraits/TexturePortraitsKey';
import TextureLuminas from '~/components/ui-kit/TextureLuminas';
import TextureLuminasRow from '~/components/ui-kit/TextureLuminas/TextureLuminasRow';
import TextureDiamondCard from '~/components/ui-kit/TextureDiamondCard';
import DiamondCardDivider from '~/components/ui-kit/TextureDiamondCard/DiamondCardDivider';
import TextureStatsTop from '~/components/ui-kit/TextureStatsTop';
import TextureStatsBar from '~/components/ui-kit/TextureStatsTop/TextureStatsBar';
import TextureTitleSort from '~/components/ui-kit/TextureTitleSort';
import TextureWeaponRows from '~/components/ui-kit/TextureWeaponRows';

import Glyph from './Glyph';
import Num from './Num';
import Label from './Label';
import PortraitStub from '../common/PortraitStub';
import TexRow from './TexRow';
import Section, {type Mode} from './Section';

// Dev-only UI kit bench: each recreation sits under its reference (design/ref/, cropped from the 2510px
// capture) at the same pixel scale. Texts copy the capture for comparison only; never published.

const DevKitPage = () => {
  const [mode, setMode] = useState<Mode>('stack');
  return (
    <main className="min-h-screen bg-[var(--ui-bg)] p-10 text-[var(--ui-text)]">
      <div className="mb-10 flex items-center gap-4">
        <h1 className="font-mono text-sm">Kit UI · banc d'essai</h1>
        {(['stack', 'overlay'] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`border px-3 py-1 font-mono text-xs ${mode === m ? 'border-white' : 'border-neutral-700 text-neutral-500'}`}>
            {m === 'stack' ? 'Référence / reconstruction' : 'Superposition 50 %'}
          </button>
        ))}
      </div>

      <Section title="Rangées Pictos (TexturePlate, textures extraites)" refSrc="rows.png" w={760} h={210} mode={mode}>
        <TexRow name="SOS Shell" level={3} color="#cfcfcf" x={3} y={5} w={329}/>
        <TexRow name="Burning Shots" level={1} color="var(--el-green)" variant="hover" x={328} y={0}/>
        <TexRow name="Cleansing Tint" level={1} color="#cfcfcf" x={3} y={75}/>
        <TexRow name="Critical Burn" level={1} color="var(--el-red)" variant="selected" x={368} y={66}/>
        <TexRow name="Dodger" level={1} color="var(--el-green)" variant="selected" x={0} y={136} w={371}/>
        <TexRow name="Empowering Attack" level={1} color="#cfcfcf" twoLines x={372} y={145}/>
      </Section>

      <Section title="Rangées d'arme (TextureWeaponRows)" refSrc="weapon-rows.png" w={480} h={170} mode={mode}>
        <Damask tile={112}/>
        <TextureWeaponRows variant="selected" className="absolute left-0 top-0" aside={<span className="flex flex-col items-center"><Label size={22}>Level</Label><Num size={40}>2</Num></span>}>
          <span style={{fontFamily: 'var(--font-label)', fontWeight: 500, fontSize: 34}}>Lanceram</span>
        </TextureWeaponRows>
        <TextureWeaponRows variant="normal" className="absolute left-[44px] top-[94px]" aside={<span className="flex flex-col items-center"><Label size={22}>Level</Label><Num size={40}>1</Num></span>}>
          <span style={{fontFamily: 'var(--font-label)', fontWeight: 500, fontSize: 34}}>Noahram</span>
        </TextureWeaponRows>
      </Section>

      <Section title="Titre de section + tri (TextureTitleSort)" refSrc="title-sort.png" w={840} h={90} mode={mode}>
        <TextureTitleSort
          title="Pictos"
          className="absolute left-[-116px] top-[3px]"
          sortKey={<KeyHint keyLabel="X" tone="x" className="[&_.KeyHint-key]:size-[40px] [&_.KeyHint-key]:text-[20px]"/>}
          sort="Level"
          aside={<KeyHint keyLabel="R" label="Descending" className="[&_.KeyHint-label]:text-[30px]"/>}
        />
      </Section>

      <Section title="Colonne stats (TextureStatsTop)" refSrc="stats-top.png" w={490} h={380} mode={mode}>
        <TextureStatsTop className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 pl-4 pr-[34px] pt-[9px]">
            <TitleRule title="Gustave" variant="name" as="h1" className="[&_.TitleRule-title]:text-[57px] [&_.TitleRule-row]:pl-[24px]"/>
          </div>
          <div className="absolute left-[9px] top-[87px] flex w-[60px] flex-col items-center">
            <Label size={23}>Level</Label>
            <Num size={64}>5</Num>
          </div>
          <TextureStatsBar variant="xp" value={715} maxValue={1500} className="absolute left-[74px] top-[125px]"/>
          <TextureStatsBar variant="plain" value={1} maxValue={232} className="absolute left-[22px] top-[181px]"/>
          <h3 className="absolute left-[16px] top-[220px]" style={{fontFamily: 'var(--font-primary)', fontVariant: 'small-caps', fontSize: 33, color: 'var(--ui-gold-name)', lineHeight: 1}}>
            <span style={{fontSize: '1.2em'}}>C</span>ombat <span style={{fontSize: '1.2em'}}>S</span>tats
          </h3>
          <div className="absolute left-[18px] top-[258px] grid grid-cols-[219px_218px] gap-x-[13px] gap-y-[3px]" style={{fontFamily: 'var(--font-label)', fontSize: 23}}>
            <div className="flex items-baseline justify-between"><span>Health</span><Num size={32}>232</Num></div>
            <div className="flex items-baseline justify-between"><span>Speed</span><Num size={32}>247</Num></div>
            <div className="flex items-baseline justify-between"><span>Attack Power</span><Num size={32}>121</Num></div>
            <div className="flex items-baseline justify-between"><span>Critical Rate</span><Num size={32}>14%</Num></div>
            <div className="flex items-baseline justify-between"><span>Defense</span><Num size={32}>3</Num></div>
          </div>
        </TextureStatsTop>
      </Section>

      <Section title="Losange + infobulle (TextureDiamondCard)" refSrc="diamond-card.png" w={620} h={210} mode={mode}>
        <TextureDiamondCard icon={<Glyph color="var(--el-red)"/>} className="absolute left-[5px] top-[5px]">
          <div className="absolute left-[2px] top-0" style={{fontFamily: 'var(--font-primary)', fontVariant: 'small-caps', fontSize: 36, letterSpacing: '0.03em', color: 'var(--ui-gold-name)', lineHeight: 1}}>
            <span style={{fontSize: '1.15em'}}>C</span>ritical <span style={{fontSize: '1.15em'}}>B</span>urn
          </div>
          <span className="absolute left-[18px] top-[43px] flex w-[100px] flex-col items-center gap-[10px]"><Label size={22}>Speed</Label><Num size={30}>8</Num></span>
          <span className="absolute left-[117px] top-[47px] flex w-[100px] flex-col items-center gap-[14px]"><Label size={15}>Critical Rate</Label><Num size={30}>6%</Num></span>
          <span className="absolute left-[337px] top-[43px] flex w-[100px] flex-col items-center"><Label size={22}>Level</Label><Num size={40}>1</Num></span>
          <DiamondCardDivider className="absolute left-[16px] top-[107px] w-[250px]"/>
          <p className="absolute left-[27px] top-[116px] w-[345px]" style={{fontFamily: 'var(--font-label)', fontSize: 26, lineHeight: 1.1}}>25% increased Critical Chance on Burning enemies.</p>
        </TextureDiamondCard>
      </Section>

      <Section title="Carte d'arme (TextureCard, texture extraite)" refSrc="card-weapon.png" w={510} h={210} mode={mode}>
        <TextureCard className="absolute left-[-50px] top-[16px] h-[216px] w-[560px]">
          <div className="absolute left-[14px] top-[-22px] h-[192px] w-[470px]">
          <div className="absolute left-[62px] top-[34px]" style={{fontFamily: 'var(--font-primary)', fontVariant: 'small-caps', fontSize: 39, color: 'var(--ui-gold-name)', lineHeight: 1}}>
            <span style={{fontSize: '1.2em'}}>L</span>anceram
          </div>
          <span className="absolute left-[424px] top-[-6px] flex flex-col items-center"><Label size={26}>Level</Label><Num size={58}>2</Num></span>
          <div className="absolute left-[8px] top-[84px] grid w-[450px] grid-cols-4 text-center">
            <span className="flex flex-col items-center gap-1"><Label size={27}>Power</Label><Num size={62}>82</Num></span>
            <span className="flex flex-col items-center gap-1"><Label size={27}>Element</Label><span className="mt-2 h-[56px] w-[2px] rotate-45 bg-[var(--ui-gold)]"/></span>
            <span className="flex flex-col items-center gap-1"><Label size={27}>Vitality</Label><span style={{fontFamily: 'var(--font-primary)', fontSize: 66, color: 'var(--ui-gold)', lineHeight: 0.9}}>C</span></span>
            <span className="flex flex-col items-center gap-1"><Label size={27}>Agility</Label><span style={{fontFamily: 'var(--font-primary)', fontSize: 66, color: 'var(--ui-gold)', lineHeight: 0.9}}>D</span></span>
          </div>
          </div>
        </TextureCard>
      </Section>

      <Section title="Luminas (TextureLuminas, textures extraites)" refSrc="luminas.png" w={490} h={240} mode={mode}>
              <TextureLuminas
                className="absolute left-0 top-0"
                title={
                  <span className="relative top-[-5px] pl-[52px]" style={{fontFamily: 'var(--font-primary)', fontVariant: 'small-caps', fontSize: 45, lineHeight: 1, color: 'var(--ui-gold-name)'}}>
                    <span style={{fontSize: '1.25em'}}>L</span>uminas
                  </span>
                }
                counter={<span style={{fontFamily: 'var(--font-number)', fontSize: 52, lineHeight: 1, letterSpacing: '0.08em', color: 'var(--el-cyan)'}}>0/5</span>}
                counterIcon={<span className="block h-[40px] w-[40px]" aria-hidden/>}
              >
                {[{n: 'Dodger', l: 1, c: 'var(--el-green)'}, {n: 'Critical Burn', l: 5, c: 'var(--el-red)'}].map((r, i) => (
                  <TextureLuminasRow key={r.n} marked={i === 1} icon={<Glyph color={r.c}/>} aside={<Num size={30}>{r.l}</Num>}>
                    <span style={{fontFamily: 'var(--font-label)', fontSize: 32, lineHeight: 1, color: i ? 'var(--el-cyan)' : 'var(--ui-text)'}}>{r.n}</span>
                  </TextureLuminasRow>
                ))}
              </TextureLuminas>
            </Section>

      <Section title="Barre d'équipe (TexturePortraits, textures extraites)" refSrc="portraits.png" w={510} h={140} mode={mode}>
        <TexturePortraitsKey side="left" className="absolute left-[8px] top-[45px]">LB</TexturePortraitsKey>
        <TexturePortraits
          className="absolute left-[78px] top-[10px]"
          portrait={<PortraitStub/>}
          flag={<svg viewBox="0 0 17 17" width="100%" height="100%" aria-hidden><line x1="1" y1="0" x2="1" y2="17" stroke="var(--ui-gold)" strokeWidth="1"/><path d="M1.6 0.8c5 1.6 8.5-1.6 15 0.8-1.6 2.4-1.6 4.8 0 7.2-6.5-2.4-10 0.8-15-0.8z" fill="var(--ui-gold-name)"/></svg>}
        />
        <TexturePortraits
          variant="active"
          className="absolute left-[210px] top-[-6px]"
          portrait={<PortraitStub/>}
          flag={<svg viewBox="0 0 17 17" width="100%" height="100%" aria-hidden><line x1="1" y1="0" x2="1" y2="17" stroke="var(--ui-gold)" strokeWidth="1"/><path d="M1.6 0.8c5 1.6 8.5-1.6 15 0.8-1.6 2.4-1.6 4.8 0 7.2-6.5-2.4-10 0.8-15-0.8z" fill="var(--ui-gold-name)"/></svg>}
        />
        <TexturePortraitsKey side="right" className="absolute left-[448px] top-[45px]">RB</TexturePortraitsKey>
      </Section>

      <Section title="Aides boutons (KeyHint)" refSrc="keyhints.png" w={620} h={60} mode={mode}>
        <div className="absolute left-[50px] top-[16px] flex items-center gap-8 [&_.KeyHint]:text-[22px]">
          <KeyHint keyLabel="Y" tone="y" label="Add to Favourites"/>
          <KeyHint keyLabel="A" tone="a" label="Equip Pictos"/>
          <KeyHint keyLabel="B" tone="b" label="Back"/>
        </div>
      </Section>

      <Section title="Slot vide (TextureEmpty)" refSrc="empty.png" w={200} h={200} mode={mode}>
        <TextureEmpty className="absolute left-[2px] top-[3px]"><span style={{fontSize: 30}}>Empty</span></TextureEmpty>
      </Section>

    </main>
  );
};

export default DevKitPage;
