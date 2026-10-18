import {EXPERIENCES, monthsAcross} from './experiences';

// The level is the owner's age; the XP bar fills over the year until the next birthday, as XP fills towards the next
// level. The red bar is Health, as in the game (its maximum is the Health combat stat).
const BIRTH = {year: 1991, month: 6, day: 27};

const birthday = (year: number) => new Date(year, BIRTH.month - 1, BIRTH.day);
const DAY = 24 * 60 * 60 * 1000;

const age = (now: Date) => {
  const had = now >= birthday(now.getFullYear());
  const last = birthday(now.getFullYear() - (had ? 0 : 1));
  const next = birthday(last.getFullYear() + 1);
  return {
    level: last.getFullYear() - BIRTH.year,
    days: Math.floor((now.getTime() - last.getTime()) / DAY),
    year: Math.round((next.getTime() - last.getTime()) / DAY),
  };
};

// Combat stats: Health and Attack Power keep the game's names where the match is obvious; the others are renamed to
// what they really are. `hint` is shown on hover.
const HEALTH = monthsAcross(EXPERIENCES);
const {level, days, year} = age(new Date());

export const CHARACTER = {
  name: 'Olivier Nguyen',
  level,
  xp: {value: days, max: year},
  health: {value: HEALTH, max: HEALTH},
  combat: [
    {label: 'Health', value: String(HEALTH), hint: 'Months of professional experience'},
    {label: 'Companies', value: String(EXPERIENCES.length), hint: 'Companies worked for'},
    {label: 'Attack Power', value: '200', hint: 'Paying customers of AwesomeApps'},
    {label: 'Teams Led', value: '3', hint: 'Front-end team at SAP, Coinhouse, Podspace'},
    {label: 'Devs Coached', value: '5', hint: 'Developers coached at Coinhouse'},
  ],
};

export const LINKEDIN_URL = 'https://www.linkedin.com/in/olivier-nguyen-98b642150/';
