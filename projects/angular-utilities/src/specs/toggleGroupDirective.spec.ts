import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatSlideToggle, MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSlideToggleGroupDirective } from "../utilities/directives/mat-toggle-group-directive";
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { By } from "@angular/platform-browser";
import { count, firstValueFrom, lastValueFrom, skip, Subject, takeUntil } from "rxjs";

abstract class ToggleTestComponent {

}


@Component({
    template: `
  <ng-container opMatSlideToggleGroup >
    <mat-slide-toggle name='toggle1' > Slide me! </mat-slide-toggle>
  </ng-container>
  `,
    standalone: false
}) export class SingleToggleTestComponent extends ToggleTestComponent {

}

@Component({
    template: `
  <ng-container opMatSlideToggleGroup [allowMultiple]='true' >
    <mat-slide-toggle name='toggle1'  > Slide me! </mat-slide-toggle>
    <mat-slide-toggle name='toggle2' > Slide me! </mat-slide-toggle>
  </ng-container>
  `,
    standalone: false
}) export class MultiToggleWithMultipleTestComponent extends ToggleTestComponent {

}

@Component({
    template: `
  <ng-container opMatSlideToggleGroup  >
    <mat-slide-toggle name='toggle1'  > Slide me! </mat-slide-toggle>
    <mat-slide-toggle name='toggle2' > Slide me! </mat-slide-toggle>
  </ng-container>
  `,
    standalone: false
}) export class MultiToggleTestComponent extends ToggleTestComponent {

}


let fixture: ComponentFixture<ToggleTestComponent>;
let loader: HarnessLoader;
let toggleHarnesses: MatSlideToggleHarness [];
let toggleGroupDirective: MatSlideToggleGroupDirective;

let toggles: DebugElement[];


const setupTest = (type) => async (): Promise<void> => {

  TestBed.configureTestingModule({
      imports: [MatSlideToggleModule],
      declarations: [
        type,
        MatSlideToggleGroupDirective,
    ],
    providers: [  ]
    });
    fixture = TestBed.createComponent(type);
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    toggleHarnesses = await loader.getAllHarnesses(MatSlideToggleHarness);
    toggles = fixture.debugElement.queryAll(By.directive(MatSlideToggle));
    toggleGroupDirective =  toggles[0].injector.get(MatSlideToggleGroupDirective);


};


async function toggleAndReturnValues(index: number)   {
  const firstVal = firstValueFrom(toggleGroupDirective.valueEmitter.pipe(skip(1)));
  await toggleHarnesses[index].toggle();
  return await firstVal;
}

describe("opMatSlideToggleGroup", () => {
  describe("Single Toggle", () => {
    beforeEach(waitForAsync(setupTest(SingleToggleTestComponent)));

    it('should create', async () => {
      expect(toggleGroupDirective).toBeDefined();
    })

    it('starts with an initial value', async  () => {
      const firstVal = firstValueFrom(toggleGroupDirective.valueEmitter);
      const val = await firstVal;
      expect(val).toEqual({'toggle1': false});
    });

    it('when toggling on should emit the latest value as true', async  () => {
      const val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true});
    });

    it('can toggle on and then off', async  () => {

      const val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true});
      const val2 =  await toggleAndReturnValues(0);
      expect(val2).toEqual({'toggle1': false});
    });
  });

  describe("Multi Toggle", () => {
    beforeEach(waitForAsync(setupTest(MultiToggleWithMultipleTestComponent)));

    it('starts with an initial value', async  () => {
      const firstVal = firstValueFrom(toggleGroupDirective.valueEmitter);
      const val = await firstVal;
      expect(val).toEqual({'toggle1': false,'toggle2': false});
    });

    it('can toggle first toggle', async  () => {
      const val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});
    });

    it('can toggle second toggle', async  () => {
      const val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': true});
    });

    it('can toggle both toggles', async  () => {
      const val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});

      const val2 = await toggleAndReturnValues(1);
      console.log(val2);
      expect(val2).toEqual({'toggle1': true,'toggle2': true});
    });

    it('can toggle both toggles multiple times', async  () => {
      let val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});

      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': true,'toggle2': true});

      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': true,'toggle2': false});

      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': true,'toggle2': true});

      val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': false,'toggle2': true});
      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': false});
    });

  });

  describe("Multi Toggle Only One Allowed", () => {
    beforeEach(waitForAsync(setupTest(MultiToggleTestComponent)));

    it('starts with an initial value', async  () => {
      const firstVal = firstValueFrom(toggleGroupDirective.valueEmitter);
      const val = await firstVal;
      expect(val).toEqual({'toggle1': false,'toggle2': false});
    });

    it('can toggle first toggle', async  () => {
      const val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});
    });

    it('can toggle second toggle', async  () => {
      const val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': true});
    });

    it('when toggle both toggles only the last one remains set', async  () => {
      const val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});

      const val2 = await toggleAndReturnValues(1);
      console.log(val2);
      expect(val2).toEqual({'toggle1': false,'toggle2': true});

      var toggle1Value = await toggleHarnesses[0].isChecked();

      expect(toggle1Value).toBeFalse();
    });

    it('can toggle both toggles multiple times and only the last one will be set', async  () => {
      let val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});

      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': true});

      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': false});

      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': true});

      val = await toggleAndReturnValues(0);
      expect(val).toEqual({'toggle1': true,'toggle2': false});
      val = await toggleAndReturnValues(1);
      expect(val).toEqual({'toggle1': false,'toggle2': true});
    });

    it('can toggle 2nd toggle doesnt emit an extra time', async  () => {
      const end = new Subject();
      const total = lastValueFrom( toggleGroupDirective.valueEmitter.pipe(
        takeUntil(end),
        count( (a,i) => true ),
      ));

      await toggleHarnesses[0].toggle();
      await toggleHarnesses[1].toggle();

      end.next(null);
      const result = await total;

      expect(result).toEqual(3);
    });

  });

});
