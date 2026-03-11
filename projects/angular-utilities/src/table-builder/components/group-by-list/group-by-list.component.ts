import { Component, OnInit, inject } from '@angular/core';
import { TableStore } from '../../classes/table-store';
import { LetDirective } from '@ngrx/component';
import { MatChipSet, MatChip, MatChipRemove } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { SpaceCasePipe } from '../../../utilities/pipes/space-case.pipes';

@Component({
    selector: 'group-by-list',
    templateUrl: './group-by-list.component.html',
    styleUrls: ['./group-by-list.component.css'],
    imports: [LetDirective, MatChipSet, MatIcon, MatChip, MatChipRemove, SpaceCasePipe]
})
export class GroupByListComponent implements OnInit {
  tableStore = inject(TableStore);


  ngOnInit(): void {
  }

}
