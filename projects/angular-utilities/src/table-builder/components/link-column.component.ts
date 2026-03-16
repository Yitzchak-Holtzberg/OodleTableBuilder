import { Component, Input } from "@angular/core";
import { TableStore } from "../classes/table-store";
import { MetaData } from "../interfaces/report-def";
import { LetDirective } from "@ngrx/component";

import { RouterLink } from "@angular/router";
import { FunctionPipe } from "../../utilities/pipes/function.pipe";

@Component({
    selector: "tb-link-column",
    template: `
  <ng-container *ngrxLet="(link | func : (metaData)) as linkInfo">
    @if ($any(linkInfo).useRouterLink) {
      <a target="{{$any(linkInfo).target}}"
        [routerLink]=" [($any(linkInfo).link | func : element)]"
        [queryParams]="$any(linkInfo).routerLinkOptions.queryParams | func : element"
        [fragment]="$any(linkInfo).routerLinkOptions.fragment"
        [preserveFragment]="$any(linkInfo).routerLinkOptions.preserveFragment"
        [queryParamsHandling]="$any(linkInfo).routerLinkOptions.queryParamsHandling"
        >
        {{transform | func : element}}
      </a>
    } @else {
      <a target="{{$any(linkInfo).target}}"
        href="{{($any(linkInfo).link | func : element)}}">
        {{transform | func : element}}
      </a>
    }
  </ng-container>
  `,
    imports: [LetDirective, RouterLink, FunctionPipe]
})export class LinkColumnComponent {
  @Input() metaData!: MetaData;
  @Input() element!: any;
  @Input() transform = (a:any)=>a;
  constructor(protected store: TableStore) {  }
  link =  (metaData : MetaData) => this.store.getLinkMap(metaData);

}