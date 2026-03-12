import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { TableContainerComponent, TableBuilder, FieldType, MetaData, TableBuilderModule, VirtualScrollViewportDirective } from '../../../../projects/angular-utilities/src/public-api';
import { map, Observable, of } from "rxjs";
import { MatCell, MatCellDef } from "@angular/material/table";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

const metaHelper = (fields: { key: string; displayName: string; fieldType: FieldType }[]) => fields;

@Component({
  selector: 'table-builder-oodle-example',
  templateUrl: './table-builder-oodle-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./table-builder-oodle-example.component.css'],
  imports: [TableBuilderModule, MatCell, MatMenuTrigger, CurrencyPipe, MatIcon, MatMenu, CommonModule, MatButtonToggleModule,
    MatCellDef, VirtualScrollViewportDirective
  ]
})
export default class ChargebackComponent implements OnInit {

  isLinesView = false;
  @ViewChild(TableContainerComponent) tableContainer: TableContainerComponent | undefined;
  tableBuilder!: TableBuilder;
  tableBuilderWithLines!: TableBuilder;
  chargebacks$!: Observable<Chargeback[]>;
  meta$: Observable<MetaData[]> | undefined;
  metaWithLines$: Observable<MetaData[]> | undefined;
  statuses: string[];
  vendorIdForPopup = 12345;

  constructor() {
    this.statuses = Object.values(ChargebackStatus);
  }

  ngOnInit() {
    this.chargebacks$ = this.populateChargebacks();
    this.meta$ = this.getMeta();
    this.metaWithLines$ = this.getMetaWithLines();
    const flattenedChargebacks$ = this.mapChargebacksToLines();


    this.tableBuilder = new TableBuilder(this.chargebacks$, this.meta$);
    this.tableBuilderWithLines = new TableBuilder(flattenedChargebacks$, this.metaWithLines$);
  }


  private populateChargebacks(): Observable<Chargeback[]> {
    const multipleChargebacks: Chargeback[] = [];
    for(let i = 0; i < 12; i++) {
      multipleChargebacks.push(...anonymizedData);
    }
    return of(multipleChargebacks);
  }

  private mapChargebacksToLines() {
    return this.chargebacks$.pipe(
      map(chargebacks => chargebacks.flatMap(chargeback => chargeback.chargebackLines.map(line => ({
        ...chargeback,
        ...line,
        id: chargeback.id,
        lineId: line.id,
        totalLineAmount: line.amount * line.quantity,
        parentChargeback: chargeback
      }))))
    );
  }

  toggleTableWithLines(value: boolean) {
    this.isLinesView = value;
  }

  getTotalAmount(element: Chargeback): number {
    return element.chargebackLines.reduce((total, line) => total + (line.amount * line.quantity || 0), 0);
  }

  getDepartmentOptions(): Observable<Option[]> {
    return of([
      { id: 'HR', label: 'Human Resources' },
      { id: 'IT', label: 'Information Technology' },
      { id: 'FIN', label: 'Finance' }
    ]);
  }


  getMeta(): Observable<MetaData[]> {
    return of(metaHelper([
      { key: 'vendorId', displayName: 'Vendor Id', fieldType: FieldType.Hidden },
      { key: 'vendorName', displayName: 'Vendor Name', fieldType: this.vendorIdForPopup ? FieldType.Hidden : FieldType.String },
      { key: 'createdOn', displayName: 'Created On', fieldType: FieldType.Date },
      { key: 'createdBy', displayName: 'Id', fieldType: FieldType.Hidden },
      { key: 'createdByName', displayName: 'Created By', fieldType: FieldType.String },
      { key: 'currentStatusValue', displayName: 'Status', fieldType: FieldType.String },
      { key: 'departmentName', displayName: 'Department', fieldType: FieldType.String },
      { key: 'notes', displayName: 'Notes', fieldType: FieldType.String }
    ]));
  }

  getMetaWithLines(): Observable<MetaData[]> {
    return of(metaHelper([
      { key: 'vendorId', displayName: 'Vendor Id', fieldType: FieldType.Hidden },
      { key: 'vendorName', displayName: 'Vendor Name', fieldType: this.vendorIdForPopup ? FieldType.Hidden : FieldType.String },
      { key: 'createdByName', displayName: 'Created By', fieldType: FieldType.String },
      { key: 'createdOn', displayName: 'Created On', fieldType: FieldType.Date },
      { key: 'totalAmount', displayName: 'Total Amount', fieldType: FieldType.Number },
      { key: 'currentStatusValue', displayName: 'Status', fieldType: FieldType.String },
      { key: 'departmentName', displayName: 'Department', fieldType: FieldType.String },
      { key: 'chargebackTypeDescription', displayName: 'Chargeback Type', fieldType: FieldType.String },
      { key: 'totalLineAmount', displayName: 'Total Line Amount', fieldType: FieldType.Currency },
      { key: 'amount', displayName: 'Amount', fieldType: FieldType.Currency },
      { key: 'quantity', displayName: 'Quantity', fieldType: FieldType.Number }
    ]));
  }
}

class Option<T = string> {
  id?: T;
  label?: string;
}

export enum ChargebackStatus {
  WaitingForApproval = "waiting for approval",
  SentToVendor = "sent to vendor",
  Approved = "approved",
  Rejected = "rejected",
  SentToNetSuite = "sent to NetSuite"
}

export class ChargebackLine {
  public id: number = 0;
  public chargebackTypeDescription: string;
  public amount: number;
  public quantity: number;

  constructor(chargebackLine: Partial<ChargebackLine> = {}) {
    this.id = chargebackLine.id || 0;
    this.chargebackTypeDescription = chargebackLine.chargebackTypeDescription || "";
    this.amount = chargebackLine.amount || 0;
    this.quantity = chargebackLine.quantity || 0;
  }
}

export class Chargeback {
  id?: number;
  vendorId?: number;
  vendorName?: string;
  createdOn: string = "";
  createdBy?: string;
  createdByName?: string;
  lastModified: string = "";
  lastModifiedById?: string;
  isDeleted?: boolean;
  notes?: string;
  subsidiaryId?: number;
  currentStatusValue?: string;
  approvedBy?: string;
  departmentId?: number;
  departmentName?: string;
  chargebackLines: ChargebackLine[] = [];
  poId?: number;
  poNumber?: string;
  lastSent?: string = "";
  timesSent?: number;
  lastSentTo?: string;
  totalAmount?: number = 0;

  constructor(chargeback: Partial<Chargeback> = {}) {
    Object.assign(this, chargeback);
  }
}


const anonymizedData: Chargeback[] = [
  {
    id: 1,
    vendorId: 12345,
    poId: undefined,
    createdOn: "2024/09/13",
    createdBy: "user-123",
    lastModified: "2024/09/13",
    lastModifiedById: "user-123",
    notes: undefined,
    subsidiaryId: 13001,
    currentStatusValue: "waiting for approval",
    chargebackLines: [
      { id: 1, chargebackTypeDescription: "Broken Teapot", amount: 1000.00, quantity: 1 }
    ],
    departmentId: 1,
    vendorName: "ABC INDUSTRIAL CO.",
    poNumber: undefined,
    createdByName: "creator-123",
    approvedBy: undefined,
    departmentName: "QC",
    lastSent: undefined,
    lastSentTo: undefined,
    timesSent: 0
  },
  {
    id: 2,
    vendorId: 67890,
    poId: undefined,
    createdOn: "2024/09/13",
    createdBy: "user-123",
    lastModified: "2024/09/19",
    lastModifiedById: "user-123",
    notes: undefined,
    subsidiaryId: 13001,
    currentStatusValue: "sent to vendor",
    chargebackLines: [
      { id: 2, chargebackTypeDescription: "Loss", amount: 5000.00, quantity: 1 }
    ],
    departmentId: 1,
    vendorName: "XYZ TECH CO.",
    poNumber: undefined,
    createdByName: "creator-123",
    approvedBy: "creator-123",
    departmentName: "QC",
    lastSent: "2024/09/19",
    lastSentTo: "contact@xyztech.com",
    timesSent: 1
  },
  {
    id: 3,
    vendorId: 11223,
    poId: 9343,
    createdOn: "2024/09/12",
    createdBy: "user-456",
    lastModified: "2024/09/13",
    lastModifiedById: "user-456",
    notes: "Notes here.",
    subsidiaryId: 13001,
    currentStatusValue: "sent to vendor",
    chargebackLines: [
      { id: 3, chargebackTypeDescription: "Broken Teapot", amount: 1000.00, quantity: 1 }
    ],
    departmentId: 2,
    vendorName: "GADGETWORKS LTD.",
    poNumber: "3001049",
    createdByName: "creator-456",
    approvedBy: "creator-456",
    departmentName: "QC",
    lastSent: "2024/09/13",
    lastSentTo: "info@gadgetworks.com",
    timesSent: 2
  },
  {
    id: 4,
    vendorId: 44556,
    poId: undefined,
    createdOn: "2024/09/14",
    createdBy: "user-789",
    lastModified: "2024/09/15",
    lastModifiedById: "user-789",
    notes: undefined,
    subsidiaryId: 13001,
    currentStatusValue: "waiting for approval",
    chargebackLines: [
      { id: 4, chargebackTypeDescription: "Sadness", amount: 4555.00, quantity: 1 }
    ],
    departmentId: 3,
    vendorName: "ELECTROPARTS CO.",
    poNumber: undefined,
    createdByName: "creator-789",
    approvedBy: undefined,
    departmentName: "QUALITY",
    lastSent: undefined,
    lastSentTo: undefined,
    timesSent: 0
  },
  {
    id: 5,
    vendorId: 33445,
    poId: 9543,
    createdOn: "2024/09/16",
    createdBy: "user-101",
    lastModified: "2024/09/17",
    lastModifiedById: "user-101",
    notes: undefined,
    subsidiaryId: 13001,
    currentStatusValue: "Sent to NetSuite",
    chargebackLines: [
      { id: 5, chargebackTypeDescription: "Loss", amount: 5000.00, quantity: 1 }
    ],
    departmentId: 2,
    vendorName: "TOOLKING INC.",
    poNumber: "3001449",
    createdByName: "creator-101",
    approvedBy: "creator-101",
    departmentName: "QUALITY",
    lastSent: "2024/09/16",
    lastSentTo: "sales@toolking.com",
    timesSent: 1
  },
  {
    id: 6,
    vendorId: 77889,
    poId: 9574,
    createdOn: "2024/09/18",
    createdBy: "user-102",
    lastModified: "2024/09/19",
    lastModifiedById: "user-102",
    notes: "Inspection required",
    subsidiaryId: 13002,
    currentStatusValue: "waiting for vendor response",
    chargebackLines: [
      { id: 6, chargebackTypeDescription: "Damaged Goods", amount: 1200.00, quantity: 2 }
    ],
    departmentId: 1,
    vendorName: "FURNITECH LTD.",
    poNumber: "4002567",
    createdByName: "creator-102",
    approvedBy: "creator-102",
    departmentName: "QC",
    lastSent: "2024/09/18",
    lastSentTo: "service@furnitech.com",
    timesSent: 2
  },
  {
    id: 7,
    vendorId: 22901,
    poId: undefined,
    createdOn: "2024/09/20",
    createdBy: "user-103",
    lastModified: "2024/09/21",
    lastModifiedById: "user-103",
    notes: undefined,
    subsidiaryId: 13003,
    currentStatusValue: "in review",
    chargebackLines: [
      { id: 7, chargebackTypeDescription: "Manufacturing Fault", amount: 3200.00, quantity: 1 }
    ],
    departmentId: 2,
    vendorName: "MECHANIC PRO.",
    poNumber: undefined,
    createdByName: "creator-103",
    approvedBy: undefined,
    departmentName: "QC",
    lastSent: "2024/09/20",
    lastSentTo: "contact@mechanicpro.com",
    timesSent: 1
  },
  {
    id: 8,
    vendorId: 55678,
    poId: 9678,
    createdOn: "2024/09/22",
    createdBy: "user-104",
    lastModified: "2024/09/23",
    lastModifiedById: "user-104",
    notes: "Pending further inspection",
    subsidiaryId: 13004,
    currentStatusValue: "approved",
    chargebackLines: [
      { id: 8, chargebackTypeDescription: "Missing Parts", amount: 2500.00, quantity: 1 }
    ],
    departmentId: 3,
    vendorName: "BUILDTECH SUPPLIERS",
    poNumber: "4002765",
    createdByName: "creator-104",
    approvedBy: "creator-104",
    departmentName: "QUALITY",
    lastSent: "2024/09/22",
    lastSentTo: "support@buildtech.com",
    timesSent: 3
  },
  {
    id: 9,
    vendorId: 33478,
    poId: undefined,
    createdOn: "2024/09/24",
    createdBy: "user-105",
    lastModified: "2024/09/25",
    lastModifiedById: "user-105",
    notes: undefined,
    subsidiaryId: 13001,
    currentStatusValue: "waiting for approval",
    chargebackLines: [
      { id: 9, chargebackTypeDescription: "Quality Issue", amount: 4000.00, quantity: 1 }
    ],
    departmentId: 1,
    vendorName: "PROVISION SUPPLIES",
    poNumber: undefined,
    createdByName: "creator-105",
    approvedBy: undefined,
    departmentName: "QC",
    lastSent: undefined,
    lastSentTo: undefined,
    timesSent: 0
  },
  {
    id: 10,
    vendorId: 44567,
    poId: 9812,
    createdOn: "2024/09/26",
    createdBy: "user-106",
    lastModified: "2024/09/27",
    lastModifiedById: "user-106",
    notes: "Follow-up required",
    subsidiaryId: 13003,
    currentStatusValue: "rejected",
    chargebackLines: [
      { id: 10, chargebackTypeDescription: "Damage during Transit", amount: 2100.00, quantity: 1 }
    ],
    departmentId: 4,
    vendorName: "TRANSLOGISTICS INC.",
    poNumber: "4002983",
    createdByName: "creator-106",
    approvedBy: "creator-106",
    departmentName: "LOGISTICS",
    lastSent: "2024/09/26",
    lastSentTo: "claims@translogistics.com",
    timesSent: 1
  },
  {
    id: 11,
    vendorId: 55887,
    poId: 9900,
    createdOn: "2024/09/28",
    createdBy: "user-107",
    lastModified: "2024/09/29",
    lastModifiedById: "user-107",
    notes: "Resubmission required",
    subsidiaryId: 13005,
    currentStatusValue: "pending resubmission",
    chargebackLines: [
      { id: 11, chargebackTypeDescription: "Incorrect Specification", amount: 3300.00, quantity: 1 }
    ],
    departmentId: 1,
    vendorName: "FABTECH INDUSTRIES",
    poNumber: "4003129",
    createdByName: "creator-107",
    approvedBy: "creator-107",
    departmentName: "QC",
    lastSent: "2024/09/28",
    lastSentTo: "support@fabtech.com",
    timesSent: 2
  },
  {
    id: 12,
    vendorId: 11234,
    poId: 9932,
    createdOn: "2024/09/30",
    createdBy: "user-108",
    lastModified: "2024/10/01",
    lastModifiedById: "user-108",
    notes: "Additional details required",
    subsidiaryId: 13006,
    currentStatusValue: "under review",
    chargebackLines: [
      { id: 12, chargebackTypeDescription: "Warranty Issue", amount: 4600.00, quantity: 1 }
    ],
    departmentId: 3,
    vendorName: "RELIABLE COMPONENTS",
    poNumber: "4003345",
    createdByName: "creator-108",
    approvedBy: "creator-108",
    departmentName: "WARRANTY",
    lastSent: "2024/09/30",
    lastSentTo: "warranty@reliablecomp.com",
    timesSent: 4
  },

];
