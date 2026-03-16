import { Component, OnInit } from '@angular/core';
import { TableStore } from '../../classes/table-store';

@Component({
    selector: 'group-by-list',
    templateUrl: './group-by-list.component.html',
    styleUrls: ['./group-by-list.component.css'],
    standalone: false
})
export class GroupByListComponent implements OnInit {

  constructor(public tableStore: TableStore) { }

  ngOnInit(): void {
  }

}
