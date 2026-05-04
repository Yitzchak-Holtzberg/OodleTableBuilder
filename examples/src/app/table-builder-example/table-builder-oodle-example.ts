import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { TableContainerComponent, TableBuilder, FieldType, MetaData, TableBuilderModule, VirtualScrollViewportDirective } from '../../../../projects/angular-utilities/src/public-api';
import { map, Observable, of } from "rxjs";
import { MatCell, MatCellDef } from "@angular/material/table";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

const metaHelper = (fields: MetaData[]) => fields;

@Component({
  selector: 'table-builder-oodle-example',
  templateUrl: './table-builder-oodle-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./table-builder-oodle-example.component.css'],
  imports: [TableBuilderModule, MatCell, MatMenuTrigger, MatIcon, MatMenu, CommonModule, MatButtonToggleModule,
    MatCellDef, VirtualScrollViewportDirective
  ]
})
export default class ChargebackComponent implements OnInit {

  isLinesView = false;
  @ViewChild(TableContainerComponent) tableContainer: TableContainerComponent | undefined;
  tableBuilder!: TableBuilder;
  tableBuilderWithLines!: TableBuilder;
  presidents$!: Observable<PresidentRecord[]>;
  meta$: Observable<MetaData[]> | undefined;
  metaWithLines$: Observable<MetaData[]> | undefined;

  ngOnInit() {
    this.presidents$ = this.populatePresidents();
    this.meta$ = this.getMeta();
    this.metaWithLines$ = this.getMetaWithLines();
    const flattenedPresidents$ = this.mapPresidentsToEvents();

    this.tableBuilder = new TableBuilder(this.presidents$, this.meta$);
    this.tableBuilderWithLines = new TableBuilder(flattenedPresidents$, this.metaWithLines$);
  }

  private populatePresidents(): Observable<PresidentRecord[]> {
    const multiplePresidents: PresidentRecord[] = [];
    for(let i = 0; i < 12; i++) {
      multiplePresidents.push(...presidentData);
    }
    return of(multiplePresidents);
  }

  private mapPresidentsToEvents() {
    return this.presidents$.pipe(
      map(presidents => presidents.flatMap(president => president.events.map(event => ({
        ...president,
        ...event,
        id: president.id,
        eventId: event.id,
        parentPresident: president
      }))))
    );
  }

  toggleTableWithLines(value: boolean) {
    this.isLinesView = value;
  }

  getMeta(): Observable<MetaData[]> {
    return of(metaHelper([
      { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '72px' },
      { key: 'presidentName', displayName: 'President', fieldType: FieldType.String, width: '190px' },
      { key: 'party', displayName: 'Party', fieldType: FieldType.String, width: '170px' },
      { key: 'birthplace', displayName: 'Birthplace', fieldType: FieldType.String, width: '220px' },
      { key: 'termStart', displayName: 'Took Office', fieldType: FieldType.Date, width: '132px', additional: { dateFormat: 'mediumDate' } },
      { key: 'termEnd', displayName: 'Left Office', fieldType: FieldType.Date, width: '132px', additional: { dateFormat: 'mediumDate' } },
      { key: 'vicePresident', displayName: 'Vice President', fieldType: FieldType.String, width: '210px' },
      { key: 'priorOffice', displayName: 'Prior Office', fieldType: FieldType.String, width: '250px' },
      { key: 'notes', displayName: 'Historical Context', fieldType: FieldType.String, width: '360px' }
    ]));
  }

  getMetaWithLines(): Observable<MetaData[]> {
    return of(metaHelper([
      { key: 'id', displayName: 'No.', fieldType: FieldType.Number, width: '72px' },
      { key: 'presidentName', displayName: 'President', fieldType: FieldType.String, width: '190px' },
      { key: 'party', displayName: 'Party', fieldType: FieldType.String, width: '170px' },
      { key: 'termStart', displayName: 'Took Office', fieldType: FieldType.Date, width: '132px', additional: { dateFormat: 'mediumDate' } },
      { key: 'eventYear', displayName: 'Year', fieldType: FieldType.Number, width: '90px' },
      { key: 'policyArea', displayName: 'Area', fieldType: FieldType.String, width: '160px' },
      { key: 'eventName', displayName: 'Event', fieldType: FieldType.String, width: '260px' },
      { key: 'description', displayName: 'Description', fieldType: FieldType.String, width: '420px' }
    ]));
  }
}

export class PresidentEvent {
  public id: number = 0;
  public eventYear: number;
  public policyArea: string;
  public eventName: string;
  public description: string;

  constructor(event: Partial<PresidentEvent> = {}) {
    this.id = event.id || 0;
    this.eventYear = event.eventYear || 0;
    this.policyArea = event.policyArea || "";
    this.eventName = event.eventName || "";
    this.description = event.description || "";
  }
}

export class PresidentRecord {
  id?: number;
  presidentName?: string;
  party?: string;
  birthplace?: string;
  termStart?: string;
  termEnd?: string;
  vicePresident?: string;
  priorOffice?: string;
  notes?: string;
  events: PresidentEvent[] = [];

  constructor(president: Partial<PresidentRecord> = {}) {
    Object.assign(this, president);
  }
}

const presidentData: PresidentRecord[] = [
  {
    id: 1,
    presidentName: "George Washington",
    party: "Unaffiliated",
    birthplace: "Westmoreland county, Virginia",
    termStart: "1789/04/30",
    termEnd: "1797/03/04",
    vicePresident: "John Adams",
    priorOffice: "Commander in Chief of the Continental Army",
    notes: "First U.S. president; established many executive precedents, including the two-term custom.",
    events: [
      { id: 1, eventYear: 1789, policyArea: "Government", eventName: "Judiciary Act of 1789", description: "Created the federal court system below the Supreme Court." },
      { id: 2, eventYear: 1793, policyArea: "Foreign Policy", eventName: "Neutrality Proclamation", description: "Declared U.S. neutrality in the conflict between France and Great Britain." }
    ]
  },
  {
    id: 2,
    presidentName: "John Adams",
    party: "Federalist",
    birthplace: "Braintree, Massachusetts",
    termStart: "1797/03/04",
    termEnd: "1801/03/04",
    vicePresident: "Thomas Jefferson",
    priorOffice: "Vice President of the United States",
    notes: "Second U.S. president; avoided full-scale war with France during the Quasi-War.",
    events: [
      { id: 3, eventYear: 1798, policyArea: "Foreign Policy", eventName: "Quasi-War with France", description: "Undeclared naval conflict between the United States and France." },
      { id: 4, eventYear: 1800, policyArea: "Diplomacy", eventName: "Convention of 1800", description: "Ended the Quasi-War and restored peaceful relations with France." }
    ]
  },
  {
    id: 3,
    presidentName: "Thomas Jefferson",
    party: "Democratic-Republican",
    birthplace: "Shadwell, Virginia",
    termStart: "1801/03/04",
    termEnd: "1809/03/04",
    vicePresident: "Aaron Burr; George Clinton",
    priorOffice: "Vice President of the United States",
    notes: "Third U.S. president; his administration acquired the Louisiana Territory.",
    events: [
      { id: 5, eventYear: 1803, policyArea: "Territory", eventName: "Louisiana Purchase", description: "The United States bought Louisiana from France, roughly doubling national territory." },
      { id: 6, eventYear: 1804, policyArea: "Exploration", eventName: "Lewis and Clark Expedition", description: "Expedition began to explore the Louisiana Purchase and routes to the Pacific." }
    ]
  },
  {
    id: 4,
    presidentName: "James Madison",
    party: "Democratic-Republican",
    birthplace: "Port Conway, Virginia",
    termStart: "1809/03/04",
    termEnd: "1817/03/04",
    vicePresident: "George Clinton; Elbridge Gerry; vacant",
    priorOffice: "U.S. Secretary of State",
    notes: "Fourth U.S. president; led the country during the War of 1812.",
    events: [
      { id: 7, eventYear: 1812, policyArea: "War", eventName: "War of 1812", description: "The United States declared war on Great Britain." },
      { id: 8, eventYear: 1814, policyArea: "Diplomacy", eventName: "Treaty of Ghent", description: "Peace treaty signed to end the War of 1812." }
    ]
  },
  {
    id: 5,
    presidentName: "James Monroe",
    party: "Democratic-Republican",
    birthplace: "Westmoreland county, Virginia",
    termStart: "1817/03/04",
    termEnd: "1825/03/04",
    vicePresident: "Daniel D. Tompkins",
    priorOffice: "U.S. Secretary of State",
    notes: "Fifth U.S. president; associated with the Era of Good Feelings and the Monroe Doctrine.",
    events: [
      { id: 9, eventYear: 1820, policyArea: "Domestic Policy", eventName: "Missouri Compromise", description: "Admitted Missouri as a slave state and Maine as a free state." },
      { id: 10, eventYear: 1823, policyArea: "Foreign Policy", eventName: "Monroe Doctrine", description: "Warned European powers against further colonization or intervention in the Americas." }
    ]
  },
  {
    id: 7,
    presidentName: "Andrew Jackson",
    party: "Democratic",
    birthplace: "Waxhaws region, South Carolina",
    termStart: "1829/03/04",
    termEnd: "1837/03/04",
    vicePresident: "John C. Calhoun; Martin Van Buren",
    priorOffice: "U.S. Senator from Tennessee",
    notes: "Seventh U.S. president; expanded presidential power and mass-party politics.",
    events: [
      { id: 11, eventYear: 1830, policyArea: "Domestic Policy", eventName: "Indian Removal Act", description: "Authorized relocation of Native peoples from lands east of the Mississippi." },
      { id: 12, eventYear: 1832, policyArea: "Economy", eventName: "Bank Veto", description: "Vetoed the bill to recharter the Second Bank of the United States." }
    ]
  },
  {
    id: 16,
    presidentName: "Abraham Lincoln",
    party: "Republican",
    birthplace: "Hodgenville, Kentucky",
    termStart: "1861/03/04",
    termEnd: "1865/04/15",
    vicePresident: "Hannibal Hamlin; Andrew Johnson",
    priorOffice: "U.S. Representative from Illinois",
    notes: "Sixteenth U.S. president; preserved the Union and issued the Emancipation Proclamation.",
    events: [
      { id: 13, eventYear: 1863, policyArea: "Civil Rights", eventName: "Emancipation Proclamation", description: "Declared enslaved people in Confederate-held areas to be free." },
      { id: 14, eventYear: 1863, policyArea: "War", eventName: "Gettysburg Address", description: "Speech reframed the Civil War around union, equality, and democratic government." }
    ]
  },
  {
    id: 26,
    presidentName: "Theodore Roosevelt",
    party: "Republican",
    birthplace: "New York, New York",
    termStart: "1901/09/14",
    termEnd: "1909/03/04",
    vicePresident: "Vacant; Charles W. Fairbanks",
    priorOffice: "Vice President of the United States",
    notes: "Twenty-sixth U.S. president; known for progressive reform, conservation, and assertive foreign policy.",
    events: [
      { id: 15, eventYear: 1902, policyArea: "Labor", eventName: "Coal Strike Arbitration", description: "Federal mediation helped resolve the anthracite coal strike." },
      { id: 16, eventYear: 1906, policyArea: "Consumer Protection", eventName: "Pure Food and Drug Act", description: "Prohibited adulterated or mislabeled food and drugs in interstate commerce." }
    ]
  },
  {
    id: 32,
    presidentName: "Franklin D. Roosevelt",
    party: "Democratic",
    birthplace: "Hyde Park, New York",
    termStart: "1933/03/04",
    termEnd: "1945/04/12",
    vicePresident: "John N. Garner; Henry A. Wallace; Harry S. Truman",
    priorOffice: "Governor of New York",
    notes: "Thirty-second U.S. president; led through the Great Depression and most of World War II.",
    events: [
      { id: 17, eventYear: 1935, policyArea: "Social Policy", eventName: "Social Security Act", description: "Created a federal old-age benefits system and unemployment insurance support." },
      { id: 18, eventYear: 1941, policyArea: "World War II", eventName: "Lend-Lease Act", description: "Authorized aid to Allied nations before U.S. entry into World War II." }
    ]
  },
  {
    id: 34,
    presidentName: "Dwight D. Eisenhower",
    party: "Republican",
    birthplace: "Denison, Texas",
    termStart: "1953/01/20",
    termEnd: "1961/01/20",
    vicePresident: "Richard Nixon",
    priorOffice: "Supreme Allied Commander Europe",
    notes: "Thirty-fourth U.S. president; oversaw Cold War policy and major infrastructure expansion.",
    events: [
      { id: 19, eventYear: 1956, policyArea: "Infrastructure", eventName: "Federal-Aid Highway Act", description: "Authorized the Interstate Highway System." },
      { id: 20, eventYear: 1957, policyArea: "Civil Rights", eventName: "Little Rock Integration", description: "Sent federal troops to enforce school desegregation in Little Rock, Arkansas." }
    ]
  },
  {
    id: 35,
    presidentName: "John F. Kennedy",
    party: "Democratic",
    birthplace: "Brookline, Massachusetts",
    termStart: "1961/01/20",
    termEnd: "1963/11/22",
    vicePresident: "Lyndon B. Johnson",
    priorOffice: "U.S. Senator from Massachusetts",
    notes: "Thirty-fifth U.S. president; set the Moon landing goal and faced the Cuban Missile Crisis.",
    events: [
      { id: 21, eventYear: 1961, policyArea: "Space", eventName: "Moon Landing Goal", description: "Asked Congress to commit to landing a person on the Moon before decade's end." },
      { id: 22, eventYear: 1962, policyArea: "Foreign Policy", eventName: "Cuban Missile Crisis", description: "Thirteen-day confrontation over Soviet nuclear missiles in Cuba." }
    ]
  },
  {
    id: 36,
    presidentName: "Lyndon B. Johnson",
    party: "Democratic",
    birthplace: "Gillespie county, Texas",
    termStart: "1963/11/22",
    termEnd: "1969/01/20",
    vicePresident: "Vacant; Hubert Humphrey",
    priorOffice: "Vice President of the United States",
    notes: "Thirty-sixth U.S. president; advanced landmark civil rights and Great Society legislation.",
    events: [
      { id: 23, eventYear: 1964, policyArea: "Civil Rights", eventName: "Civil Rights Act of 1964", description: "Outlawed major forms of discrimination and segregation." },
      { id: 24, eventYear: 1965, policyArea: "Health Policy", eventName: "Medicare and Medicaid", description: "Created federal health insurance programs for older and low-income Americans." }
    ]
  }
];
