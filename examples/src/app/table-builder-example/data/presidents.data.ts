import { FieldType, MetaData } from '../../../../../projects/angular-utilities/src/public-api';

export interface PresidentEvent {
  id: number;
  eventYear: number;
  policyArea: string;
  eventName: string;
  description: string;
}

export interface PresidentRecord {
  id: number;
  presidentName: string;
  party: string;
  birthplace: string;
  termStart: string;
  termEnd?: string;
  vicePresident: string;
  priorOffice: string;
  notes: string;
  events: PresidentEvent[];
}

/** Summary view: one row per presidency. The descriptive "Historical Context"
 *  column intentionally has NO width so it flexes to fill leftover space. */
export const presidentSummaryMeta: MetaData[] = [
  { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '64px' },
  { key: 'presidentName', displayName: 'President', fieldType: FieldType.String, width: '190px' },
  { key: 'party', displayName: 'Party', fieldType: FieldType.String, width: '180px' },
  { key: 'birthplace', displayName: 'Birthplace', fieldType: FieldType.String, width: '210px' },
  { key: 'termStart', displayName: 'Took Office', fieldType: FieldType.Date, width: '128px', additional: { dateFormat: 'mediumDate' } },
  { key: 'termEnd', displayName: 'Left Office', fieldType: FieldType.Date, width: '128px', additional: { dateFormat: 'mediumDate' } },
  { key: 'vicePresident', displayName: 'Vice President', fieldType: FieldType.String, width: '220px' },
  { key: 'priorOffice', displayName: 'Prior Office', fieldType: FieldType.String, width: '240px' },
  { key: 'notes', displayName: 'Historical Context', fieldType: FieldType.String },
];

/** Lines view: one row per (president, event). "Description" has no width. */
export const presidentLinesMeta: MetaData[] = [
  { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '64px' },
  { key: 'presidentName', displayName: 'President', fieldType: FieldType.String, width: '190px' },
  { key: 'party', displayName: 'Party', fieldType: FieldType.String, width: '180px' },
  { key: 'termStart', displayName: 'Took Office', fieldType: FieldType.Date, width: '128px', additional: { dateFormat: 'mediumDate' } },
  { key: 'eventYear', displayName: 'Year', fieldType: FieldType.Number, width: '88px' },
  { key: 'policyArea', displayName: 'Area', fieldType: FieldType.String, width: '170px' },
  { key: 'eventName', displayName: 'Event', fieldType: FieldType.String, width: '260px' },
  { key: 'description', displayName: 'Description', fieldType: FieldType.String },
];

export const presidentData: PresidentRecord[] = [
  {
    id: 1, presidentName: 'George Washington', party: 'Unaffiliated', birthplace: 'Westmoreland County, Virginia',
    termStart: '1789/04/30', termEnd: '1797/03/04', vicePresident: 'John Adams',
    priorOffice: 'Commander in Chief of the Continental Army',
    notes: 'First U.S. president; established many executive precedents, including the two-term custom.',
    events: [
      { id: 1, eventYear: 1789, policyArea: 'Government', eventName: 'Judiciary Act of 1789', description: 'Created the federal court system below the Supreme Court.' },
      { id: 2, eventYear: 1793, policyArea: 'Foreign Policy', eventName: 'Neutrality Proclamation', description: 'Declared U.S. neutrality in the war between France and Great Britain.' },
    ],
  },
  {
    id: 2, presidentName: 'John Adams', party: 'Federalist', birthplace: 'Braintree, Massachusetts',
    termStart: '1797/03/04', termEnd: '1801/03/04', vicePresident: 'Thomas Jefferson',
    priorOffice: 'Vice President of the United States',
    notes: 'Second U.S. president; avoided full-scale war with France during the Quasi-War.',
    events: [
      { id: 3, eventYear: 1798, policyArea: 'Civil Liberties', eventName: 'Alien and Sedition Acts', description: 'Controversial laws restricting immigrants and press criticism of the government.' },
      { id: 4, eventYear: 1800, policyArea: 'Diplomacy', eventName: 'Convention of 1800', description: 'Ended the Quasi-War and restored peaceful relations with France.' },
    ],
  },
  {
    id: 3, presidentName: 'Thomas Jefferson', party: 'Democratic-Republican', birthplace: 'Shadwell, Virginia',
    termStart: '1801/03/04', termEnd: '1809/03/04', vicePresident: 'Aaron Burr; George Clinton',
    priorOffice: 'Vice President of the United States',
    notes: 'Third U.S. president; his administration acquired the Louisiana Territory.',
    events: [
      { id: 5, eventYear: 1803, policyArea: 'Territory', eventName: 'Louisiana Purchase', description: 'Bought Louisiana from France, roughly doubling national territory.' },
      { id: 6, eventYear: 1804, policyArea: 'Exploration', eventName: 'Lewis and Clark Expedition', description: 'Expedition set out to explore the Louisiana Purchase and routes to the Pacific.' },
    ],
  },
  {
    id: 4, presidentName: 'James Madison', party: 'Democratic-Republican', birthplace: 'Port Conway, Virginia',
    termStart: '1809/03/04', termEnd: '1817/03/04', vicePresident: 'George Clinton; Elbridge Gerry',
    priorOffice: 'U.S. Secretary of State',
    notes: 'Fourth U.S. president; "Father of the Constitution"; led the country during the War of 1812.',
    events: [
      { id: 7, eventYear: 1812, policyArea: 'War', eventName: 'War of 1812', description: 'The United States declared war on Great Britain.' },
      { id: 8, eventYear: 1814, policyArea: 'Diplomacy', eventName: 'Treaty of Ghent', description: 'Peace treaty signed to end the War of 1812.' },
    ],
  },
  {
    id: 5, presidentName: 'James Monroe', party: 'Democratic-Republican', birthplace: 'Westmoreland County, Virginia',
    termStart: '1817/03/04', termEnd: '1825/03/04', vicePresident: 'Daniel D. Tompkins',
    priorOffice: 'U.S. Secretary of State',
    notes: 'Fifth U.S. president; associated with the Era of Good Feelings and the Monroe Doctrine.',
    events: [
      { id: 9, eventYear: 1820, policyArea: 'Domestic Policy', eventName: 'Missouri Compromise', description: 'Admitted Missouri as a slave state and Maine as a free state.' },
      { id: 10, eventYear: 1823, policyArea: 'Foreign Policy', eventName: 'Monroe Doctrine', description: 'Warned European powers against further colonization in the Americas.' },
    ],
  },
  {
    id: 6, presidentName: 'John Quincy Adams', party: 'Democratic-Republican', birthplace: 'Braintree, Massachusetts',
    termStart: '1825/03/04', termEnd: '1829/03/04', vicePresident: 'John C. Calhoun',
    priorOffice: 'U.S. Secretary of State',
    notes: 'Sixth U.S. president; champion of internal improvements and, later, an antislavery congressman.',
    events: [
      { id: 11, eventYear: 1828, policyArea: 'Economy', eventName: 'Tariff of Abominations', description: 'High protective tariff that inflamed sectional tensions with the South.' },
    ],
  },
  {
    id: 7, presidentName: 'Andrew Jackson', party: 'Democratic', birthplace: 'Waxhaws region, Carolinas',
    termStart: '1829/03/04', termEnd: '1837/03/04', vicePresident: 'John C. Calhoun; Martin Van Buren',
    priorOffice: 'U.S. Senator from Tennessee',
    notes: 'Seventh U.S. president; expanded presidential power and mass-party politics.',
    events: [
      { id: 12, eventYear: 1830, policyArea: 'Domestic Policy', eventName: 'Indian Removal Act', description: 'Authorized relocation of Native peoples from lands east of the Mississippi.' },
      { id: 13, eventYear: 1832, policyArea: 'Economy', eventName: 'Bank Veto', description: 'Vetoed the bill to recharter the Second Bank of the United States.' },
    ],
  },
  {
    id: 8, presidentName: 'Martin Van Buren', party: 'Democratic', birthplace: 'Kinderhook, New York',
    termStart: '1837/03/04', termEnd: '1841/03/04', vicePresident: 'Richard Mentor Johnson',
    priorOffice: 'Vice President of the United States',
    notes: 'Eighth U.S. president; his term was dominated by the economic Panic of 1837.',
    events: [
      { id: 14, eventYear: 1837, policyArea: 'Economy', eventName: 'Panic of 1837', description: 'A severe financial crisis triggered years of depression.' },
    ],
  },
  {
    id: 9, presidentName: 'William Henry Harrison', party: 'Whig', birthplace: 'Charles City County, Virginia',
    termStart: '1841/03/04', termEnd: '1841/04/04', vicePresident: 'John Tyler',
    priorOffice: 'U.S. Minister to Colombia',
    notes: 'Ninth U.S. president; died of illness after only 31 days, the shortest presidency.',
    events: [
      { id: 15, eventYear: 1841, policyArea: 'Government', eventName: 'Shortest Inaugural Tenure', description: 'Died one month into office, triggering the first presidential succession.' },
    ],
  },
  {
    id: 10, presidentName: 'John Tyler', party: 'Whig', birthplace: 'Charles City County, Virginia',
    termStart: '1841/04/04', termEnd: '1845/03/04', vicePresident: 'vacant',
    priorOffice: 'Vice President of the United States',
    notes: 'Tenth U.S. president; first VP elevated by a death, establishing the succession precedent.',
    events: [
      { id: 16, eventYear: 1845, policyArea: 'Territory', eventName: 'Annexation of Texas', description: 'Signed the resolution admitting Texas to the Union.' },
    ],
  },
  {
    id: 11, presidentName: 'James K. Polk', party: 'Democratic', birthplace: 'Pineville, North Carolina',
    termStart: '1845/03/04', termEnd: '1849/03/04', vicePresident: 'George M. Dallas',
    priorOffice: 'Speaker of the U.S. House of Representatives',
    notes: 'Eleventh U.S. president; oversaw vast territorial expansion to the Pacific.',
    events: [
      { id: 17, eventYear: 1846, policyArea: 'War', eventName: 'Mexican-American War', description: 'War with Mexico that led to major territorial gains in the West.' },
      { id: 18, eventYear: 1848, policyArea: 'Territory', eventName: 'Treaty of Guadalupe Hidalgo', description: 'Ceded California and the Southwest to the United States.' },
    ],
  },
  {
    id: 12, presidentName: 'Zachary Taylor', party: 'Whig', birthplace: 'Barboursville, Virginia',
    termStart: '1849/03/04', termEnd: '1850/07/09', vicePresident: 'Millard Fillmore',
    priorOffice: 'Major General, U.S. Army',
    notes: 'Twelfth U.S. president; a war hero who died after 16 months in office.',
    events: [
      { id: 19, eventYear: 1850, policyArea: 'Domestic Policy', eventName: 'Slavery in the Territories', description: 'Resisted expansion of slavery into newly won western lands.' },
    ],
  },
  {
    id: 13, presidentName: 'Millard Fillmore', party: 'Whig', birthplace: 'Summerhill, New York',
    termStart: '1850/07/09', termEnd: '1853/03/04', vicePresident: 'vacant',
    priorOffice: 'Vice President of the United States',
    notes: 'Thirteenth U.S. president; signed the Compromise of 1850, the last Whig president.',
    events: [
      { id: 20, eventYear: 1850, policyArea: 'Domestic Policy', eventName: 'Compromise of 1850', description: 'Series of bills easing tensions between free and slave states.' },
    ],
  },
  {
    id: 14, presidentName: 'Franklin Pierce', party: 'Democratic', birthplace: 'Hillsborough, New Hampshire',
    termStart: '1853/03/04', termEnd: '1857/03/04', vicePresident: 'William R. King',
    priorOffice: 'U.S. Senator from New Hampshire',
    notes: 'Fourteenth U.S. president; the Kansas-Nebraska Act reignited the slavery crisis.',
    events: [
      { id: 21, eventYear: 1854, policyArea: 'Domestic Policy', eventName: 'Kansas-Nebraska Act', description: 'Let new territories decide slavery by popular sovereignty, sparking "Bleeding Kansas".' },
    ],
  },
  {
    id: 15, presidentName: 'James Buchanan', party: 'Democratic', birthplace: 'Cove Gap, Pennsylvania',
    termStart: '1857/03/04', termEnd: '1861/03/04', vicePresident: 'John C. Breckinridge',
    priorOffice: 'U.S. Secretary of State',
    notes: 'Fifteenth U.S. president; the Union fractured toward civil war during his term.',
    events: [
      { id: 22, eventYear: 1857, policyArea: 'Civil Rights', eventName: 'Dred Scott Decision', description: 'Supreme Court ruled that enslaved people were not citizens.' },
    ],
  },
  {
    id: 16, presidentName: 'Abraham Lincoln', party: 'Republican', birthplace: 'Hodgenville, Kentucky',
    termStart: '1861/03/04', termEnd: '1865/04/15', vicePresident: 'Hannibal Hamlin; Andrew Johnson',
    priorOffice: 'U.S. Representative from Illinois',
    notes: 'Sixteenth U.S. president; preserved the Union and issued the Emancipation Proclamation.',
    events: [
      { id: 23, eventYear: 1863, policyArea: 'Civil Rights', eventName: 'Emancipation Proclamation', description: 'Declared enslaved people in Confederate-held areas to be free.' },
      { id: 24, eventYear: 1863, policyArea: 'War', eventName: 'Gettysburg Address', description: 'Speech reframing the Civil War around union and equality.' },
    ],
  },
  {
    id: 17, presidentName: 'Andrew Johnson', party: 'National Union', birthplace: 'Raleigh, North Carolina',
    termStart: '1865/04/15', termEnd: '1869/03/04', vicePresident: 'vacant',
    priorOffice: 'Vice President of the United States',
    notes: 'Seventeenth U.S. president; clashed with Congress over Reconstruction and was impeached.',
    events: [
      { id: 25, eventYear: 1868, policyArea: 'Government', eventName: 'Impeachment Trial', description: 'Acquitted by the Senate by a single vote.' },
    ],
  },
  {
    id: 18, presidentName: 'Ulysses S. Grant', party: 'Republican', birthplace: 'Point Pleasant, Ohio',
    termStart: '1869/03/04', termEnd: '1877/03/04', vicePresident: 'Schuyler Colfax; Henry Wilson',
    priorOffice: 'Commanding General of the U.S. Army',
    notes: 'Eighteenth U.S. president; enforced Reconstruction and civil rights amid scandals.',
    events: [
      { id: 26, eventYear: 1870, policyArea: 'Civil Rights', eventName: 'Fifteenth Amendment', description: 'Prohibited denying the vote based on race.' },
      { id: 27, eventYear: 1871, policyArea: 'Civil Rights', eventName: 'Enforcement Acts', description: 'Cracked down on the Ku Klux Klan in the South.' },
    ],
  },
  {
    id: 19, presidentName: 'Rutherford B. Hayes', party: 'Republican', birthplace: 'Delaware, Ohio',
    termStart: '1877/03/04', termEnd: '1881/03/04', vicePresident: 'William A. Wheeler',
    priorOffice: 'Governor of Ohio',
    notes: 'Nineteenth U.S. president; the disputed 1876 election ended Reconstruction.',
    events: [
      { id: 28, eventYear: 1877, policyArea: 'Domestic Policy', eventName: 'End of Reconstruction', description: 'Withdrew federal troops from the South under the Compromise of 1877.' },
    ],
  },
  {
    id: 20, presidentName: 'James A. Garfield', party: 'Republican', birthplace: 'Moreland Hills, Ohio',
    termStart: '1881/03/04', termEnd: '1881/09/19', vicePresident: 'Chester A. Arthur',
    priorOffice: 'U.S. Representative from Ohio',
    notes: 'Twentieth U.S. president; assassinated months into office, spurring civil-service reform.',
    events: [
      { id: 29, eventYear: 1881, policyArea: 'Government', eventName: 'Assassination', description: 'Shot by a disgruntled office-seeker, dying that September.' },
    ],
  },
  {
    id: 21, presidentName: 'Chester A. Arthur', party: 'Republican', birthplace: 'Fairfield, Vermont',
    termStart: '1881/09/19', termEnd: '1885/03/04', vicePresident: 'vacant',
    priorOffice: 'Vice President of the United States',
    notes: 'Twenty-first U.S. president; surprised critics by championing merit-based reform.',
    events: [
      { id: 30, eventYear: 1883, policyArea: 'Government', eventName: 'Pendleton Civil Service Act', description: 'Created a merit-based federal hiring system.' },
    ],
  },
  {
    id: 22, presidentName: 'Grover Cleveland', party: 'Democratic', birthplace: 'Caldwell, New Jersey',
    termStart: '1885/03/04', termEnd: '1889/03/04', vicePresident: 'Thomas A. Hendricks',
    priorOffice: 'Governor of New York',
    notes: 'Twenty-second U.S. president; first Democrat elected after the Civil War.',
    events: [
      { id: 31, eventYear: 1887, policyArea: 'Economy', eventName: 'Interstate Commerce Act', description: 'Created the first federal regulatory agency to oversee railroads.' },
    ],
  },
  {
    id: 23, presidentName: 'Benjamin Harrison', party: 'Republican', birthplace: 'North Bend, Ohio',
    termStart: '1889/03/04', termEnd: '1893/03/04', vicePresident: 'Levi P. Morton',
    priorOffice: 'U.S. Senator from Indiana',
    notes: 'Twenty-third U.S. president; grandson of William Henry Harrison.',
    events: [
      { id: 32, eventYear: 1890, policyArea: 'Economy', eventName: 'Sherman Antitrust Act', description: 'First federal law to limit monopolies and trusts.' },
    ],
  },
  {
    id: 24, presidentName: 'Grover Cleveland', party: 'Democratic', birthplace: 'Caldwell, New Jersey',
    termStart: '1893/03/04', termEnd: '1897/03/04', vicePresident: 'Adlai Stevenson I',
    priorOffice: 'President of the United States',
    notes: 'Twenty-fourth U.S. president; the only president to serve two non-consecutive terms.',
    events: [
      { id: 33, eventYear: 1893, policyArea: 'Economy', eventName: 'Panic of 1893', description: 'A severe depression marked his second term.' },
    ],
  },
  {
    id: 25, presidentName: 'William McKinley', party: 'Republican', birthplace: 'Niles, Ohio',
    termStart: '1897/03/04', termEnd: '1901/09/14', vicePresident: 'Garret Hobart; Theodore Roosevelt',
    priorOffice: 'Governor of Ohio',
    notes: 'Twenty-fifth U.S. president; led the nation into overseas empire; assassinated in 1901.',
    events: [
      { id: 34, eventYear: 1898, policyArea: 'War', eventName: 'Spanish-American War', description: 'Brief war that gave the U.S. Puerto Rico, Guam, and the Philippines.' },
    ],
  },
  {
    id: 26, presidentName: 'Theodore Roosevelt', party: 'Republican', birthplace: 'New York, New York',
    termStart: '1901/09/14', termEnd: '1909/03/04', vicePresident: 'vacant; Charles W. Fairbanks',
    priorOffice: 'Vice President of the United States',
    notes: 'Twenty-sixth U.S. president; known for progressive reform, conservation, and assertive foreign policy.',
    events: [
      { id: 35, eventYear: 1902, policyArea: 'Labor', eventName: 'Coal Strike Arbitration', description: 'Federal mediation resolved the anthracite coal strike.' },
      { id: 36, eventYear: 1906, policyArea: 'Consumer Protection', eventName: 'Pure Food and Drug Act', description: 'Prohibited adulterated or mislabeled food and drugs.' },
    ],
  },
  {
    id: 27, presidentName: 'William Howard Taft', party: 'Republican', birthplace: 'Cincinnati, Ohio',
    termStart: '1909/03/04', termEnd: '1913/03/04', vicePresident: 'James S. Sherman',
    priorOffice: 'U.S. Secretary of War',
    notes: 'Twenty-seventh U.S. president; later Chief Justice of the United States.',
    events: [
      { id: 37, eventYear: 1913, policyArea: 'Economy', eventName: 'Sixteenth Amendment', description: 'Ratified during his term, authorizing the federal income tax.' },
    ],
  },
  {
    id: 28, presidentName: 'Woodrow Wilson', party: 'Democratic', birthplace: 'Staunton, Virginia',
    termStart: '1913/03/04', termEnd: '1921/03/04', vicePresident: 'Thomas R. Marshall',
    priorOffice: 'Governor of New Jersey',
    notes: 'Twenty-eighth U.S. president; led the nation through World War I.',
    events: [
      { id: 38, eventYear: 1917, policyArea: 'War', eventName: 'U.S. Enters World War I', description: 'Asked Congress to declare war on Germany.' },
      { id: 39, eventYear: 1919, policyArea: 'Diplomacy', eventName: 'Treaty of Versailles', description: 'Championed the League of Nations, which the Senate rejected.' },
    ],
  },
  {
    id: 29, presidentName: 'Warren G. Harding', party: 'Republican', birthplace: 'Blooming Grove, Ohio',
    termStart: '1921/03/04', termEnd: '1923/08/02', vicePresident: 'Calvin Coolidge',
    priorOffice: 'U.S. Senator from Ohio',
    notes: 'Twenty-ninth U.S. president; promised a "return to normalcy"; died in office amid scandal.',
    events: [
      { id: 40, eventYear: 1923, policyArea: 'Government', eventName: 'Teapot Dome Scandal', description: 'Bribery scandal over federal oil reserves tarnished his legacy.' },
    ],
  },
  {
    id: 30, presidentName: 'Calvin Coolidge', party: 'Republican', birthplace: 'Plymouth Notch, Vermont',
    termStart: '1923/08/02', termEnd: '1929/03/04', vicePresident: 'vacant; Charles G. Dawes',
    priorOffice: 'Vice President of the United States',
    notes: 'Thirtieth U.S. president; "Silent Cal" presided over the Roaring Twenties boom.',
    events: [
      { id: 41, eventYear: 1924, policyArea: 'Civil Rights', eventName: 'Indian Citizenship Act', description: 'Granted U.S. citizenship to all Native Americans.' },
    ],
  },
  {
    id: 31, presidentName: 'Herbert Hoover', party: 'Republican', birthplace: 'West Branch, Iowa',
    termStart: '1929/03/04', termEnd: '1933/03/04', vicePresident: 'Charles Curtis',
    priorOffice: 'U.S. Secretary of Commerce',
    notes: 'Thirty-first U.S. president; his term was consumed by the onset of the Great Depression.',
    events: [
      { id: 42, eventYear: 1929, policyArea: 'Economy', eventName: 'Wall Street Crash', description: 'The 1929 stock-market collapse ushered in the Great Depression.' },
    ],
  },
  {
    id: 32, presidentName: 'Franklin D. Roosevelt', party: 'Democratic', birthplace: 'Hyde Park, New York',
    termStart: '1933/03/04', termEnd: '1945/04/12', vicePresident: 'John N. Garner; Henry A. Wallace; Harry S. Truman',
    priorOffice: 'Governor of New York',
    notes: 'Thirty-second U.S. president; led through the Great Depression and most of World War II.',
    events: [
      { id: 43, eventYear: 1935, policyArea: 'Social Policy', eventName: 'Social Security Act', description: 'Created a federal old-age benefits and unemployment system.' },
      { id: 44, eventYear: 1941, policyArea: 'World War II', eventName: 'Lend-Lease Act', description: 'Authorized aid to Allied nations before U.S. entry into the war.' },
    ],
  },
  {
    id: 33, presidentName: 'Harry S. Truman', party: 'Democratic', birthplace: 'Lamar, Missouri',
    termStart: '1945/04/12', termEnd: '1953/01/20', vicePresident: 'vacant; Alben W. Barkley',
    priorOffice: 'Vice President of the United States',
    notes: 'Thirty-third U.S. president; ended World War II and shaped the early Cold War.',
    events: [
      { id: 45, eventYear: 1945, policyArea: 'World War II', eventName: 'Atomic Bombings', description: 'Authorized the use of atomic weapons against Japan.' },
      { id: 46, eventYear: 1948, policyArea: 'Foreign Policy', eventName: 'Marshall Plan', description: 'Massive U.S. aid program to rebuild Western Europe.' },
    ],
  },
  {
    id: 34, presidentName: 'Dwight D. Eisenhower', party: 'Republican', birthplace: 'Denison, Texas',
    termStart: '1953/01/20', termEnd: '1961/01/20', vicePresident: 'Richard Nixon',
    priorOffice: 'Supreme Allied Commander Europe',
    notes: 'Thirty-fourth U.S. president; oversaw Cold War policy and major infrastructure expansion.',
    events: [
      { id: 47, eventYear: 1956, policyArea: 'Infrastructure', eventName: 'Federal-Aid Highway Act', description: 'Authorized the Interstate Highway System.' },
      { id: 48, eventYear: 1957, policyArea: 'Civil Rights', eventName: 'Little Rock Integration', description: 'Sent federal troops to enforce school desegregation in Arkansas.' },
    ],
  },
  {
    id: 35, presidentName: 'John F. Kennedy', party: 'Democratic', birthplace: 'Brookline, Massachusetts',
    termStart: '1961/01/20', termEnd: '1963/11/22', vicePresident: 'Lyndon B. Johnson',
    priorOffice: 'U.S. Senator from Massachusetts',
    notes: 'Thirty-fifth U.S. president; set the Moon-landing goal and faced the Cuban Missile Crisis.',
    events: [
      { id: 49, eventYear: 1961, policyArea: 'Space', eventName: 'Moon Landing Goal', description: 'Committed the nation to landing a person on the Moon by decade\'s end.' },
      { id: 50, eventYear: 1962, policyArea: 'Foreign Policy', eventName: 'Cuban Missile Crisis', description: 'Thirteen-day confrontation over Soviet missiles in Cuba.' },
    ],
  },
  {
    id: 36, presidentName: 'Lyndon B. Johnson', party: 'Democratic', birthplace: 'Stonewall, Texas',
    termStart: '1963/11/22', termEnd: '1969/01/20', vicePresident: 'vacant; Hubert Humphrey',
    priorOffice: 'Vice President of the United States',
    notes: 'Thirty-sixth U.S. president; advanced landmark civil rights and Great Society legislation.',
    events: [
      { id: 51, eventYear: 1964, policyArea: 'Civil Rights', eventName: 'Civil Rights Act of 1964', description: 'Outlawed major forms of discrimination and segregation.' },
      { id: 52, eventYear: 1965, policyArea: 'Health Policy', eventName: 'Medicare and Medicaid', description: 'Created federal health insurance for older and low-income Americans.' },
    ],
  },
  {
    id: 37, presidentName: 'Richard Nixon', party: 'Republican', birthplace: 'Yorba Linda, California',
    termStart: '1969/01/20', termEnd: '1974/08/09', vicePresident: 'Spiro Agnew; Gerald Ford',
    priorOffice: 'Vice President of the United States',
    notes: 'Thirty-seventh U.S. president; opened relations with China but resigned over Watergate.',
    events: [
      { id: 53, eventYear: 1972, policyArea: 'Foreign Policy', eventName: 'Opening to China', description: 'Historic visit reestablishing U.S. relations with the PRC.' },
      { id: 54, eventYear: 1974, policyArea: 'Government', eventName: 'Watergate Resignation', description: 'Resigned the presidency amid the Watergate scandal.' },
    ],
  },
  {
    id: 38, presidentName: 'Gerald Ford', party: 'Republican', birthplace: 'Omaha, Nebraska',
    termStart: '1974/08/09', termEnd: '1977/01/20', vicePresident: 'vacant; Nelson Rockefeller',
    priorOffice: 'Vice President of the United States',
    notes: 'Thirty-eighth U.S. president; the only president never elected as president or VP.',
    events: [
      { id: 55, eventYear: 1974, policyArea: 'Government', eventName: 'Pardon of Nixon', description: 'Issued a full pardon to Richard Nixon, a controversial decision.' },
    ],
  },
  {
    id: 39, presidentName: 'Jimmy Carter', party: 'Democratic', birthplace: 'Plains, Georgia',
    termStart: '1977/01/20', termEnd: '1981/01/20', vicePresident: 'Walter Mondale',
    priorOffice: 'Governor of Georgia',
    notes: 'Thirty-ninth U.S. president; brokered Mideast peace but was beset by the hostage crisis.',
    events: [
      { id: 56, eventYear: 1978, policyArea: 'Diplomacy', eventName: 'Camp David Accords', description: 'Brokered a historic peace framework between Egypt and Israel.' },
      { id: 57, eventYear: 1979, policyArea: 'Foreign Policy', eventName: 'Iran Hostage Crisis', description: 'Americans held captive in Tehran for 444 days.' },
    ],
  },
  {
    id: 40, presidentName: 'Ronald Reagan', party: 'Republican', birthplace: 'Tampico, Illinois',
    termStart: '1981/01/20', termEnd: '1989/01/20', vicePresident: 'George H. W. Bush',
    priorOffice: 'Governor of California',
    notes: 'Fortieth U.S. president; reshaped conservatism and presided over the Cold War\'s thaw.',
    events: [
      { id: 58, eventYear: 1981, policyArea: 'Economy', eventName: 'Reaganomics', description: 'Sweeping tax cuts and deregulation reshaped fiscal policy.' },
      { id: 59, eventYear: 1987, policyArea: 'Foreign Policy', eventName: 'INF Treaty', description: 'Signed a landmark missile-reduction treaty with the Soviet Union.' },
    ],
  },
  {
    id: 41, presidentName: 'George H. W. Bush', party: 'Republican', birthplace: 'Milton, Massachusetts',
    termStart: '1989/01/20', termEnd: '1993/01/20', vicePresident: 'Dan Quayle',
    priorOffice: 'Vice President of the United States',
    notes: 'Forty-first U.S. president; led a coalition in the Gulf War as the Cold War ended.',
    events: [
      { id: 60, eventYear: 1991, policyArea: 'War', eventName: 'Gulf War', description: 'Led a coalition that expelled Iraq from Kuwait.' },
    ],
  },
  {
    id: 42, presidentName: 'Bill Clinton', party: 'Democratic', birthplace: 'Hope, Arkansas',
    termStart: '1993/01/20', termEnd: '2001/01/20', vicePresident: 'Al Gore',
    priorOffice: 'Governor of Arkansas',
    notes: 'Forty-second U.S. president; presided over a long economic boom; impeached and acquitted.',
    events: [
      { id: 61, eventYear: 1994, policyArea: 'Trade', eventName: 'NAFTA Takes Effect', description: 'North American Free Trade Agreement opened continental markets.' },
      { id: 62, eventYear: 1998, policyArea: 'Government', eventName: 'Impeachment', description: 'Impeached by the House and acquitted by the Senate.' },
    ],
  },
  {
    id: 43, presidentName: 'George W. Bush', party: 'Republican', birthplace: 'New Haven, Connecticut',
    termStart: '2001/01/20', termEnd: '2009/01/20', vicePresident: 'Dick Cheney',
    priorOffice: 'Governor of Texas',
    notes: 'Forty-third U.S. president; his terms were defined by 9/11 and the War on Terror.',
    events: [
      { id: 63, eventYear: 2001, policyArea: 'Security', eventName: 'September 11 Response', description: 'Launched the War on Terror after the 9/11 attacks.' },
      { id: 64, eventYear: 2003, policyArea: 'War', eventName: 'Iraq War', description: 'Ordered the invasion of Iraq to topple Saddam Hussein.' },
    ],
  },
  {
    id: 44, presidentName: 'Barack Obama', party: 'Democratic', birthplace: 'Honolulu, Hawaii',
    termStart: '2009/01/20', termEnd: '2017/01/20', vicePresident: 'Joe Biden',
    priorOffice: 'U.S. Senator from Illinois',
    notes: 'Forty-fourth U.S. president; first African American president; enacted health-care reform.',
    events: [
      { id: 65, eventYear: 2010, policyArea: 'Health Policy', eventName: 'Affordable Care Act', description: 'Landmark law expanding health-insurance coverage.' },
      { id: 66, eventYear: 2011, policyArea: 'Security', eventName: 'Bin Laden Raid', description: 'Ordered the operation that killed Osama bin Laden.' },
    ],
  },
  {
    id: 45, presidentName: 'Donald Trump', party: 'Republican', birthplace: 'Queens, New York City',
    termStart: '2017/01/20', termEnd: '2021/01/20', vicePresident: 'Mike Pence',
    priorOffice: 'Businessman and television personality',
    notes: 'Forty-fifth U.S. president; a disruptive outsider; the first president impeached twice.',
    events: [
      { id: 67, eventYear: 2017, policyArea: 'Economy', eventName: 'Tax Cuts and Jobs Act', description: 'Major overhaul cutting corporate and individual tax rates.' },
      { id: 68, eventYear: 2020, policyArea: 'Health Policy', eventName: 'COVID-19 Pandemic', description: 'Oversaw the federal response and Operation Warp Speed vaccine push.' },
    ],
  },
  {
    id: 46, presidentName: 'Joe Biden', party: 'Democratic', birthplace: 'Scranton, Pennsylvania',
    termStart: '2021/01/20', termEnd: '2025/01/20', vicePresident: 'Kamala Harris',
    priorOffice: 'Vice President of the United States',
    notes: 'Forty-sixth U.S. president; oldest person to assume the office; passed major spending laws.',
    events: [
      { id: 69, eventYear: 2021, policyArea: 'Infrastructure', eventName: 'Infrastructure Law', description: 'Trillion-dollar investment in roads, bridges, and broadband.' },
      { id: 70, eventYear: 2022, policyArea: 'Climate', eventName: 'Inflation Reduction Act', description: 'Largest U.S. investment in clean energy and climate to date.' },
    ],
  },
  {
    id: 47, presidentName: 'Donald Trump', party: 'Republican', birthplace: 'Queens, New York City',
    termStart: '2025/01/20', vicePresident: 'JD Vance',
    priorOffice: 'President of the United States',
    notes: 'Forty-seventh U.S. president; the first to win non-consecutive terms since Grover Cleveland.',
    events: [
      { id: 71, eventYear: 2025, policyArea: 'Government', eventName: 'Second Inauguration', description: 'Returned to office after a four-year gap, echoing Cleveland\'s 1893 return.' },
    ],
  },
];

/** Flatten parents into one row per event for the lines view. */
export const flattenPresidentEvents = (presidents: PresidentRecord[]) =>
  presidents.flatMap(p =>
    p.events.map(e => ({
      ...p,
      ...e,
      id: p.id,
      eventId: e.id,
      parentPresident: p,
    })),
  );
