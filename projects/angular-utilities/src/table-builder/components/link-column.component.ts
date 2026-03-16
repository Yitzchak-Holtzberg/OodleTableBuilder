import { Component, Input } from "@angular/core";
import { TableStore } from "../classes/table-store";
import { MetaData } from "../interfaces/report-def";

@Component({
    selector: "tb-link-column",
    template: `
  <ng-container *ngrxLet="(link | func : (metaData)) as linkInfo">
    <a *ngIf="$any(linkInfo).useRouterLink; else hrefLink" target="{{$any(linkInfo).target}}"
      [routerLink]=" [($any(linkInfo).link | func : element)]"
      [queryParams]="$any(linkInfo).routerLinkOptions.queryParams | func : element"
      [fragment]="$any(linkInfo).routerLinkOptions.fragment"
      [preserveFragment]="$any(linkInfo).routerLinkOptions.preserveFragment"
      [queryParamsHandling]="$any(linkInfo).routerLinkOptions.queryParamsHandling"
    >
      {{transform | func : element}}
    </a>
    <ng-template #hrefLink>
      <a target="{{$any(linkInfo).target}}"
        href="{{($any(linkInfo).link | func : element)}}">
        {{transform | func : element}}
      </a>
    </ng-template>
  </ng-container>
  `,
    standalone: false
})export class LinkColumnComponent {
  @Input() metaData!: MetaData;
  @Input() element!: any;
  @Input() transform = (a:any)=>a;
  constructor(protected store: TableStore) {  }
  link =  (metaData : MetaData) => this.store.getLinkMap(metaData);

}