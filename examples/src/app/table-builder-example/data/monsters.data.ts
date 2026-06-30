import { FieldType, MetaData } from '../../../../../projects/angular-utilities/src/public-api';

export interface MonsterAppearance {
  id: number;
  filmTitle: string;
  filmYear: number;
  role: string;
  notes: string;
}

export interface MonsterRecord {
  id: number;
  monsterName: string;
  originFilm: string;
  creatureType: string;
  firstAppearance: string;
  weakness: string;
  lore: string;
  appearances: MonsterAppearance[];
}

/** Summary view: one row per monster. "Lore" has no width so it fills the row. */
export const monsterSummaryMeta: MetaData[] = [
  { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '64px' },
  { key: 'monsterName', displayName: 'Monster', fieldType: FieldType.String, width: '210px' },
  { key: 'originFilm', displayName: 'Origin Film', fieldType: FieldType.String, width: '240px' },
  { key: 'creatureType', displayName: 'Creature Type', fieldType: FieldType.String, width: '190px' },
  { key: 'firstAppearance', displayName: 'First Seen', fieldType: FieldType.Date, width: '120px', additional: { dateFormat: 'y' } },
  { key: 'weakness', displayName: 'Weakness', fieldType: FieldType.String, width: '230px' },
  { key: 'lore', displayName: 'Lore', fieldType: FieldType.String },
];

/** Lines view: one row per screen appearance. "Notes" has no width. */
export const monsterLinesMeta: MetaData[] = [
  { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '64px' },
  { key: 'monsterName', displayName: 'Monster', fieldType: FieldType.String, width: '210px' },
  { key: 'creatureType', displayName: 'Creature Type', fieldType: FieldType.String, width: '190px' },
  { key: 'filmTitle', displayName: 'Film', fieldType: FieldType.String, width: '280px' },
  { key: 'filmYear', displayName: 'Year', fieldType: FieldType.Number, width: '88px' },
  { key: 'role', displayName: 'Role', fieldType: FieldType.String, width: '160px' },
  { key: 'notes', displayName: 'Notes', fieldType: FieldType.String },
];

export const monsterData: MonsterRecord[] = [
  {
    id: 1, monsterName: 'Count Dracula', originFilm: 'Dracula (1931)', creatureType: 'Vampire',
    firstAppearance: '1931/02/12', weakness: 'Sunlight, a stake through the heart, garlic',
    lore: 'The aristocratic Transylvanian vampire who feeds on blood and commands the night.',
    appearances: [
      { id: 1, filmTitle: 'Dracula', filmYear: 1931, role: 'Antagonist', notes: 'Bela Lugosi\'s definitive portrayal set the template for the screen vampire.' },
      { id: 2, filmTitle: 'Bram Stoker\'s Dracula', filmYear: 1992, role: 'Antagonist', notes: 'Lavish Coppola retelling that returns to the novel\'s romance and dread.' },
    ],
  },
  {
    id: 2, monsterName: "Frankenstein's Monster", originFilm: 'Frankenstein (1931)', creatureType: 'Reanimated corpse',
    firstAppearance: '1931/11/21', weakness: 'Fire',
    lore: 'A creature assembled from corpses and shocked to life by an obsessed scientist.',
    appearances: [
      { id: 3, filmTitle: 'Frankenstein', filmYear: 1931, role: 'Antagonist', notes: 'Boris Karloff\'s flat-topped, bolt-necked creature became an icon.' },
      { id: 4, filmTitle: 'Bride of Frankenstein', filmYear: 1935, role: 'Tragic figure', notes: 'A rare sequel widely held to surpass the original.' },
    ],
  },
  {
    id: 3, monsterName: 'Imhotep (The Mummy)', originFilm: 'The Mummy (1932)', creatureType: 'Undead priest',
    firstAppearance: '1932/12/22', weakness: 'The Scroll of Thoth; fire',
    lore: 'An ancient Egyptian priest cursed to undeath, seeking to revive his lost love.',
    appearances: [
      { id: 5, filmTitle: 'The Mummy', filmYear: 1932, role: 'Antagonist', notes: 'Karloff again, this time as the desiccated, slow-moving Imhotep.' },
      { id: 6, filmTitle: 'The Mummy', filmYear: 1999, role: 'Antagonist', notes: 'Action-adventure reboot reimagining the curse on a blockbuster scale.' },
    ],
  },
  {
    id: 4, monsterName: 'The Wolf Man', originFilm: 'The Wolf Man (1941)', creatureType: 'Werewolf',
    firstAppearance: '1941/12/12', weakness: 'Silver',
    lore: 'Larry Talbot, bitten by a werewolf, transforms under the full moon against his will.',
    appearances: [
      { id: 7, filmTitle: 'The Wolf Man', filmYear: 1941, role: 'Tragic antagonist', notes: 'Lon Chaney Jr. defined the cursed, sympathetic werewolf.' },
    ],
  },
  {
    id: 5, monsterName: 'Gill-man', originFilm: 'Creature from the Black Lagoon (1954)', creatureType: 'Amphibious humanoid',
    firstAppearance: '1954/02/12', weakness: 'Rotenone; being out of water',
    lore: 'A prehistoric amphibious creature lurking in an Amazonian lagoon.',
    appearances: [
      { id: 8, filmTitle: 'Creature from the Black Lagoon', filmYear: 1954, role: 'Antagonist', notes: 'Originally shown in 3-D; the last classic Universal Monster.' },
    ],
  },
  {
    id: 6, monsterName: 'Godzilla', originFilm: 'Godzilla (1954)', creatureType: 'Kaiju',
    firstAppearance: '1954/11/03', weakness: 'The Oxygen Destroyer',
    lore: 'A colossal irradiated reptile awakened by nuclear testing, leveling cities.',
    appearances: [
      { id: 9, filmTitle: 'Godzilla', filmYear: 1954, role: 'Force of nature', notes: 'Ishiro Honda\'s original, a somber allegory for the atomic age.' },
      { id: 10, filmTitle: 'Shin Godzilla', filmYear: 2016, role: 'Force of nature', notes: 'A terrifying evolving reboot from Hideaki Anno.' },
    ],
  },
  {
    id: 7, monsterName: 'King Kong', originFilm: 'King Kong (1933)', creatureType: 'Giant ape',
    firstAppearance: '1933/03/02', weakness: 'Aircraft; great heights',
    lore: 'A giant ape taken from Skull Island, doomed atop the Empire State Building.',
    appearances: [
      { id: 11, filmTitle: 'King Kong', filmYear: 1933, role: 'Tragic antagonist', notes: 'Pioneering stop-motion brought the great ape to life.' },
      { id: 12, filmTitle: 'Kong: Skull Island', filmYear: 2017, role: 'Anti-hero', notes: 'Modern MonsterVerse entry reframing Kong as an island guardian.' },
    ],
  },
  {
    id: 8, monsterName: 'Norman Bates', originFilm: 'Psycho (1960)', creatureType: 'Human (psychological)',
    firstAppearance: '1960/06/16', weakness: 'His own fractured psyche',
    lore: 'A mild-mannered motel keeper who kills while assuming his dead mother\'s identity.',
    appearances: [
      { id: 13, filmTitle: 'Psycho', filmYear: 1960, role: 'Antagonist', notes: 'Anthony Perkins in Hitchcock\'s genre-defining shocker.' },
    ],
  },
  {
    id: 9, monsterName: 'The Xenomorph', originFilm: 'Alien (1979)', creatureType: 'Extraterrestrial parasitoid',
    firstAppearance: '1979/05/25', weakness: 'Vacuum and fire; its own acid blood is a hazard',
    lore: 'A parasitic alien with concentric jaws and acid for blood, the perfect organism.',
    appearances: [
      { id: 14, filmTitle: 'Alien', filmYear: 1979, role: 'Antagonist', notes: 'H. R. Giger\'s biomechanical design birthed a sci-fi horror legend.' },
      { id: 15, filmTitle: 'Aliens', filmYear: 1986, role: 'Swarm', notes: 'Cameron\'s sequel multiplied the threat into a war.' },
    ],
  },
  {
    id: 10, monsterName: 'Michael Myers', originFilm: 'Halloween (1978)', creatureType: 'Slasher (human)',
    firstAppearance: '1978/10/25', weakness: 'Seemingly none; relentless',
    lore: 'A silent, masked killer who stalks his hometown every Halloween night.',
    appearances: [
      { id: 16, filmTitle: 'Halloween', filmYear: 1978, role: 'Antagonist', notes: 'Carpenter\'s original popularized the slasher formula.' },
      { id: 17, filmTitle: 'Halloween', filmYear: 2018, role: 'Antagonist', notes: 'Direct sequel ignoring the sequels, reuniting Laurie and Michael.' },
    ],
  },
  {
    id: 11, monsterName: 'Leatherface', originFilm: 'The Texas Chain Saw Massacre (1974)', creatureType: 'Slasher (human)',
    firstAppearance: '1974/10/01', weakness: 'Outwitting; he is human',
    lore: 'A chainsaw-wielding killer wearing masks of human skin, part of a cannibal family.',
    appearances: [
      { id: 18, filmTitle: 'The Texas Chain Saw Massacre', filmYear: 1974, role: 'Antagonist', notes: 'Tobe Hooper\'s raw, grimy nightmare.' },
    ],
  },
  {
    id: 12, monsterName: 'Jason Voorhees', originFilm: 'Friday the 13th (1980)', creatureType: 'Undead slasher',
    firstAppearance: '1980/05/09', weakness: 'Repeatedly "killed" but always returns',
    lore: 'The drowned boy of Camp Crystal Lake, returned in a hockey mask to slaughter campers.',
    appearances: [
      { id: 19, filmTitle: 'Friday the 13th', filmYear: 1980, role: 'Final reveal', notes: 'Jason\'s mother is the killer; Jason debuts in the shock ending.' },
      { id: 20, filmTitle: 'Friday the 13th Part III', filmYear: 1982, role: 'Antagonist', notes: 'Jason dons the iconic hockey mask for the first time.' },
    ],
  },
  {
    id: 13, monsterName: 'Freddy Krueger', originFilm: 'A Nightmare on Elm Street (1984)', creatureType: 'Dream demon',
    firstAppearance: '1984/11/09', weakness: 'Being pulled into the waking world; loss of fear',
    lore: 'A burned child-killer who murders teenagers within their dreams with a bladed glove.',
    appearances: [
      { id: 21, filmTitle: 'A Nightmare on Elm Street', filmYear: 1984, role: 'Antagonist', notes: 'Wes Craven\'s original; Robert Englund\'s wisecracking villain.' },
      { id: 22, filmTitle: 'Freddy vs. Jason', filmYear: 2003, role: 'Antagonist', notes: 'Crossover pitting the two slasher icons against each other.' },
    ],
  },
  {
    id: 14, monsterName: 'Pinhead', originFilm: 'Hellraiser (1987)', creatureType: 'Cenobite',
    firstAppearance: '1987/09/11', weakness: 'Solving or destroying the Lament Configuration box',
    lore: 'Lead Cenobite of a hellish order, summoned by a puzzle box to deliver agony as ecstasy.',
    appearances: [
      { id: 23, filmTitle: 'Hellraiser', filmYear: 1987, role: 'Antagonist', notes: 'Clive Barker\'s directorial debut from his own novella.' },
    ],
  },
  {
    id: 15, monsterName: 'Chucky', originFilm: "Child's Play (1988)", creatureType: 'Possessed doll',
    firstAppearance: '1988/11/09', weakness: 'Destroying the doll body; the heart',
    lore: 'A serial killer\'s soul trapped in a "Good Guy" doll through voodoo.',
    appearances: [
      { id: 24, filmTitle: "Child's Play", filmYear: 1988, role: 'Antagonist', notes: 'Brad Dourif voices the murderous toy.' },
      { id: 25, filmTitle: "Bride of Chucky", filmYear: 1998, role: 'Antagonist', notes: 'Self-aware horror-comedy turn for the franchise.' },
    ],
  },
  {
    id: 16, monsterName: 'Pennywise', originFilm: 'It (1990)', creatureType: 'Cosmic shapeshifter',
    firstAppearance: '1990/11/18', weakness: 'Belief and unity; the Ritual of Chüd',
    lore: 'An ancient entity that feeds on children\'s fear, often appearing as a dancing clown.',
    appearances: [
      { id: 26, filmTitle: 'It', filmYear: 1990, role: 'Antagonist', notes: 'Tim Curry\'s clown terrified a generation in the TV miniseries.' },
      { id: 27, filmTitle: 'It', filmYear: 2017, role: 'Antagonist', notes: 'Bill Skarsgård\'s feature reboot became a horror box-office record.' },
    ],
  },
  {
    id: 17, monsterName: 'The Thing', originFilm: 'The Thing (1982)', creatureType: 'Parasitic shapeshifter',
    firstAppearance: '1982/06/25', weakness: 'Fire',
    lore: 'An alien organism that perfectly imitates any life it absorbs, spreading paranoia.',
    appearances: [
      { id: 28, filmTitle: 'The Thing', filmYear: 1982, role: 'Antagonist', notes: 'Carpenter\'s Antarctic classic with landmark practical effects.' },
    ],
  },
  {
    id: 18, monsterName: 'Pazuzu', originFilm: 'The Exorcist (1973)', creatureType: 'Demon',
    firstAppearance: '1973/12/26', weakness: 'Exorcism; faith',
    lore: 'An ancient demon that possesses a young girl, battled by two Catholic priests.',
    appearances: [
      { id: 29, filmTitle: 'The Exorcist', filmYear: 1973, role: 'Antagonist', notes: 'Friedkin\'s film redefined supernatural horror.' },
    ],
  },
  {
    id: 19, monsterName: 'Samara Morgan', originFilm: 'The Ring (2002)', creatureType: 'Vengeful ghost',
    firstAppearance: '2002/10/18', weakness: 'Copying and passing on the cursed tape',
    lore: 'The ghost of a wronged girl who kills seven days after a victim watches her cursed tape.',
    appearances: [
      { id: 30, filmTitle: 'The Ring', filmYear: 2002, role: 'Antagonist', notes: 'U.S. remake of Ringu that ignited the J-horror remake wave.' },
    ],
  },
  {
    id: 20, monsterName: 'Ghostface', originFilm: 'Scream (1996)', creatureType: 'Slasher (human)',
    firstAppearance: '1996/12/20', weakness: 'It is always a human under the mask',
    lore: 'A rotating masked identity adopted by killers who taunt victims by phone.',
    appearances: [
      { id: 31, filmTitle: 'Scream', filmYear: 1996, role: 'Antagonist', notes: 'Craven\'s meta-slasher revived and satirized the genre.' },
    ],
  },
  {
    id: 21, monsterName: 'Candyman', originFilm: 'Candyman (1992)', creatureType: 'Vengeful spirit',
    firstAppearance: '1992/10/16', weakness: 'Refusing to summon him; breaking the legend',
    lore: 'A hook-handed spirit summoned by saying his name five times before a mirror.',
    appearances: [
      { id: 32, filmTitle: 'Candyman', filmYear: 1992, role: 'Antagonist', notes: 'Tony Todd\'s mournful, tragic monster rooted in real injustice.' },
    ],
  },
  {
    id: 22, monsterName: 'The Babadook', originFilm: 'The Babadook (2014)', creatureType: 'Manifested grief',
    firstAppearance: '2014/05/22', weakness: 'Acknowledgment; it can be contained, not destroyed',
    lore: 'A storybook bogeyman embodying a grieving mother\'s suppressed grief and rage.',
    appearances: [
      { id: 33, filmTitle: 'The Babadook', filmYear: 2014, role: 'Antagonist', notes: 'Jennifer Kent\'s acclaimed debut, a metaphor for grief.' },
    ],
  },
  {
    id: 23, monsterName: 'The Predator', originFilm: 'Predator (1987)', creatureType: 'Extraterrestrial hunter',
    firstAppearance: '1987/06/12', weakness: 'Mud masks its heat vision; bound by its honor code',
    lore: 'A trophy-hunting alien with cloaking tech that stalks the deadliest prey.',
    appearances: [
      { id: 34, filmTitle: 'Predator', filmYear: 1987, role: 'Antagonist', notes: 'A jungle action-horror hybrid; the creature became a franchise.' },
      { id: 35, filmTitle: 'Prey', filmYear: 2022, role: 'Antagonist', notes: 'Praised prequel set among the Comanche in 1719.' },
    ],
  },
  {
    id: 24, monsterName: 'Hannibal Lecter', originFilm: 'The Silence of the Lambs (1991)', creatureType: 'Human (cannibal)',
    firstAppearance: '1991/02/14', weakness: 'Confinement; he is mortal',
    lore: 'A brilliant psychiatrist and cannibal who aids the FBI from behind bars.',
    appearances: [
      { id: 36, filmTitle: 'The Silence of the Lambs', filmYear: 1991, role: 'Antagonist/ally', notes: 'Anthony Hopkins won an Oscar for barely 16 minutes of screen time.' },
    ],
  },
  {
    id: 25, monsterName: 'Annabelle', originFilm: 'The Conjuring (2013)', creatureType: 'Possessed doll',
    firstAppearance: '2013/07/19', weakness: 'Containment in a blessed case',
    lore: 'A vintage doll used as a conduit by a malevolent demonic presence.',
    appearances: [
      { id: 37, filmTitle: 'The Conjuring', filmYear: 2013, role: 'Cold open threat', notes: 'Her cameo launched a sprawling shared universe.' },
      { id: 38, filmTitle: 'Annabelle', filmYear: 2014, role: 'Antagonist', notes: 'Spin-off detailing the doll\'s origins.' },
    ],
  },
  {
    id: 26, monsterName: 'Valak (The Nun)', originFilm: 'The Conjuring 2 (2016)', creatureType: 'Demon',
    firstAppearance: '2016/06/10', weakness: 'Sacred relics; faith',
    lore: 'A demon that takes the form of a ghastly nun to torment the faithful.',
    appearances: [
      { id: 39, filmTitle: 'The Conjuring 2', filmYear: 2016, role: 'Antagonist', notes: 'Introduced the figure that anchored its own spin-off films.' },
    ],
  },
  {
    id: 27, monsterName: 'Jigsaw (John Kramer)', originFilm: 'Saw (2004)', creatureType: 'Human (trap engineer)',
    firstAppearance: '2004/10/29', weakness: 'Terminal illness; he is human',
    lore: 'A dying engineer who forces victims through deadly "tests" to make them value life.',
    appearances: [
      { id: 40, filmTitle: 'Saw', filmYear: 2004, role: 'Antagonist', notes: 'Low-budget hit that spawned a long, trap-heavy franchise.' },
    ],
  },
  {
    id: 28, monsterName: 'Pumpkinhead', originFilm: 'Pumpkinhead (1988)', creatureType: 'Demon of vengeance',
    firstAppearance: '1988/10/14', weakness: 'The death of the one who summoned it',
    lore: 'A towering demon conjured by a grieving father to exact bloody revenge.',
    appearances: [
      { id: 41, filmTitle: 'Pumpkinhead', filmYear: 1988, role: 'Antagonist', notes: 'Effects legend Stan Winston\'s directorial debut.' },
    ],
  },
];

/** Flatten parents into one row per screen appearance for the lines view. */
export const flattenMonsterAppearances = (monsters: MonsterRecord[]) =>
  monsters.flatMap(m =>
    m.appearances.map(a => ({
      ...m,
      ...a,
      id: m.id,
      appearanceId: a.id,
      parentMonster: m,
    })),
  );
