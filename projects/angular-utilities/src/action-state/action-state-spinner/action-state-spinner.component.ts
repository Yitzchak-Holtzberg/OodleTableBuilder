import { Component, OnInit, input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActionStatus, serverStatusTypes } from '../ngrx';
import { delayOn } from '../../rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'lib-action-state-spinner',
    templateUrl: './action-state-spinner.component.html',
    styleUrls: ['./action-state-spinner.component.css'],
    imports: [MatProgressSpinner, AsyncPipe]
})
export class ActionStateSpinnerComponent implements OnInit {

  readonly status$ = input.required<Observable<ActionStatus>>();
  serverActionStatus$!: Observable<ActionStatus>;
  serverStatusTypes = serverStatusTypes;

  ngOnInit() {
    this.serverActionStatus$ = this.status$().pipe(
      delayOn( a => a.status === serverStatusTypes.inProgress , 500)
    );
  }
}
