import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createActionGroup, createFeature, createReducer, emptyProps, on, props, Store } from '@ngrx/store';
import { map } from 'rxjs';
import { AsyncPipe, NgFor } from "@angular/common";
import { Component } from "@angular/core";
import { createActionableSelector } from '../../../../projects/angular-utilities/src/ngrx';
import { notNull } from '../../../../projects/angular-utilities/src/rxjs';
interface Example { message: string };
const exampleActions = createActionGroup({
  source: 'Example',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ examples: Example[] }>(),
  }
})
export const exampleFeature = createFeature({
  name: 'example',
  reducer: createReducer(
    undefined as unknown as Example[],
    on(exampleActions.loadSuccess, (state, { examples }) =>{
      console.log({examples});
      return examples}),
  )
})

@Injectable()
export class ExampleEffects{
  effects$ = createEffect((actions$ = inject(Actions)) => actions$.pipe(
    ofType(exampleActions.load),
    map(() => exampleActions.loadSuccess({examples: [{message: 'HI'}, {message: 'BY'}] }))
  ))
}


const selectExamplesActionable = createActionableSelector(
  () => exampleFeature.selectExampleState,
  () => exampleActions.load()
)

@Component({
    template: `
    <ul>
      <li *ngFor="let example of examples$ | async">
        {{ example.message }}
      </li>
    </ul>
  `,
    imports: [AsyncPipe, NgFor]
})
export default class ExamplesComponent {
  examples$ = inject(Store).select(selectExamplesActionable()).pipe(notNull());
}