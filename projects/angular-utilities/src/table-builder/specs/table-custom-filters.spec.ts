// import { HarnessLoader } from "@angular/cdk/testing";
// import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
// import { Component, DebugElement, Type } from "@angular/core";
// import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
// import { MatButtonToggleModule } from "@angular/material/button-toggle";
// import { MatButtonToggleHarness } from "@angular/material/button-toggle/testing";
// import { MatCheckbox, MatCheckboxModule } from "@angular/material/checkbox";
// import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
// import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
// import { MatSlideToggleModule } from "@angular/material/slide-toggle";
// import { MatSlideToggleHarness } from "@angular/material/slide-toggle/testing";
// import { MatLegacyRadioButtonHarness as MatRadioButtonHarness } from '@angular/material/legacy-radio/testing';
// import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
// import { MatLegacySelectHarness as MatSelectHarness,  } from "@angular/material/legacy-select/testing";
// import { MatLegacyOptionHarness as MatOptionHarness } from "@angular/material/legacy-core/testing";
// import { By } from "@angular/platform-browser";
// import { firstValueFrom, lastValueFrom, Observable, skip, Subject, take, takeUntil } from "rxjs";
// import { MatButtonToggleFilterDirective, MatCheckboxTbFilterDirective, MatOptionTbFilterDirective, MatRadioButtonTbFilterDirective, MatSlideToggleTbFilterDirective, TableCustomFilterDirective } from "../directives/tb-filter.directive";
// import { NoopAnimationsModule } from "@angular/platform-browser/animations";

// abstract class ToggleTestComponent {

// }


// const takeItem = <T>(src:Observable<T>, itemNumber: number, until: Observable<any>) : Promise<T | null> => {
//   return firstValueFrom(src.pipe( skip(itemNumber - 1),takeUntil(until) ), {defaultValue: null});
// }

// @Component({
//   template: `
//     <mat-slide-toggle tbCustomFilter   > Slide me! </mat-slide-toggle>
//     <mat-checkbox tbCustomFilter   > Check me! </mat-checkbox>
//     <mat-radio-button tbCustomFilter   > Click me! </mat-radio-button>
//     <mat-select>
//       <mat-option tbCustomFilter   > Click me! </mat-option>
//       <mat-option [value]='"other"'   >Other</mat-option>
//     </mat-select>
//     <mat-button-toggle tbCustomFilter   > Click me! </mat-button-toggle>
//     <div class='optionGroup' tbCustomFilterGroup >
//       <mat-checkbox tbCustomFilter class="child-1-checkbox"  >1</mat-checkbox>
//     </div>
//   `
// }) export class SingleToggleTestComponent extends ToggleTestComponent {

// }


// let fixture: ComponentFixture<ToggleTestComponent>;
// let loader: HarnessLoader;


// const setupTest = (): void => {


//   TestBed.configureTestingModule({
//       imports: [
//         NoopAnimationsModule,
//         MatSlideToggleModule,
//         MatCheckboxModule,
//         MatRadioModule,
//         MatButtonToggleModule,
//         MatSelectModule
//       ],
//       declarations: [
//         TableCustomFilterDirective,
//         SingleToggleTestComponent,
//         MatSlideToggleTbFilterDirective,
//         MatButtonToggleFilterDirective,
//         MatOptionTbFilterDirective,
//         MatRadioButtonTbFilterDirective,
//         MatCheckboxTbFilterDirective,
//         TablebFilterGroupDirective,

//     ],
//     providers: [  ]
//     });
//     fixture = TestBed.createComponent(SingleToggleTestComponent);
//     fixture.detectChanges();
//     loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
// };


// describe("Custom Table Filters", () => {

//   describe("mat slide toggle filter",  () => {
//     let toggleHarnesses: MatSlideToggleHarness[];
//     let dElement: DebugElement;
//     beforeEach(async () => {
//       setupTest();
//       dElement = fixture.debugElement.query(By.directive(MatSlideToggleTbFilterDirective) );
//       toggleHarnesses = await loader.getAllHarnesses(MatSlideToggleHarness);
//     } );

//     it('should create', () : void => {
//       expect(dElement).toBeTruthy();
//     });

//     it('should emit on toggle', async () => {
//       var filterDirective = dElement.injector.get(TableCustomFilterDirective);
//       const dunzo = new Subject();
//       var val = takeItem(filterDirective.filter$, 2, dunzo);
//       await toggleHarnesses[0].toggle();
//       dunzo.next(null);
//       var i = await val;
//       expect(i).toBeTruthy();
//       expect(i?.active).toBeTrue();
//       expect(filterDirective.active).toBeTrue();
//     })
//   })

//   describe("check box filter",  () => {
//     let checkBoxHarnesses: MatCheckboxHarness;
//     let dElement: DebugElement;
//     beforeEach( async () => {
//      setupTest();
//       dElement = fixture.debugElement.query(By.directive(MatCheckboxTbFilterDirective) );
//       checkBoxHarnesses = await loader.getHarness(MatCheckboxHarness);

//     });

//     it('should create', async () : Promise<void> => {
//       expect(dElement).not.toBeNull();
//     });

//     it('should emit on check', async () => {
//       var filterDirective = dElement.injector.get(TableCustomFilterDirective);
//       var val = firstValueFrom(filterDirective.filter$);
//       await checkBoxHarnesses.check();
//       var i = await val;
//       expect(i).toBeTruthy();
//       expect(filterDirective.active).toBeTrue();
//     });


//   });


//   describe("radio button filter",  () => {
//     let radioHarnesses: MatRadioButtonHarness;
//     let dElement: DebugElement;
//     beforeEach( async () => {
//      setupTest();
//       dElement = fixture.debugElement.query(By.directive(MatRadioButtonTbFilterDirective) );
//       radioHarnesses = await loader.getHarness(MatRadioButtonHarness);

//     });

//     it('should create', async () : Promise<void> => {
//       expect(dElement).not.toBeNull();
//     });

//     it('should emit on check', async () => {
//       var filterDirective = dElement.injector.get(TableCustomFilterDirective);
//       var val = firstValueFrom(filterDirective.filter$);
//       await radioHarnesses.check();
//       var i = await val;
//       expect(i).toBeTruthy();
//       expect(filterDirective.active).toBeTrue();
//     });
//   });

//   describe("button toggle  filter",  () => {
//     let buttonToggleHarness: MatButtonToggleHarness;
//     let dElement: DebugElement;
//     beforeEach( async () => {
//      setupTest();
//       dElement = fixture.debugElement.query(By.directive(MatButtonToggleFilterDirective) );
//       buttonToggleHarness = await loader.getHarness(MatButtonToggleHarness);

//     });

//     it('should create',  () : void => {
//       expect(dElement).not.toBeNull();
//     });

//     it('should emit on toggle', async () => {
//       var filterDirective = dElement.injector.get(TableCustomFilterDirective);
//       var val = firstValueFrom(filterDirective.filter$);
//       await buttonToggleHarness.check();
//       var i = await val;
//       expect(i).toBeTruthy();
//       expect(filterDirective.active).toBeTrue();
//     });
//   });

//   describe("option filter",  () => {
//     let optionHarness: MatOptionHarness;
//     let optionHarness2: MatOptionHarness;
//     let selectHarness: MatSelectHarness;
//     let dElement: DebugElement;
//     beforeEach(async () => {
//       setupTest();
//       selectHarness = await loader.getHarness(MatSelectHarness);
//       await selectHarness.open();
//       var h = await loader.getAllHarnesses(MatOptionHarness);
//       optionHarness = h[0];
//       optionHarness2 = h[1];
//       dElement = fixture.debugElement.query(By.directive(MatOptionTbFilterDirective) );
//     });

//     it('should create', async () : Promise<void> => {
//       expect(dElement).toBeTruthy();
//     });

//     it('should emit on select', async () => {
//       let doneSubject = new Subject<void>();

//       var filterDirective = dElement.injector.get(TableCustomFilterDirective);

//       let val = takeItem(filterDirective.filter$, 2, doneSubject);
//       await optionHarness.click();
//       doneSubject.next();
//       let i = await val;

//       expect(i).toBeTruthy();
//       expect(i?.active).toBeTrue();
//       expect(filterDirective.active).toBeTrue();


//       val = takeItem(filterDirective.filter$, 2, doneSubject);
//       await optionHarness2.click();

//       i = await val;
//       expect(i).toBeTruthy();
//       expect(i?.active).toBeFalse();
//       expect(filterDirective.active).toBeFalse();

//     });
//   });

//   describe("group filter",  () => {
//     let checkboxHarness: MatCheckboxHarness;
//     let dElement: DebugElement;
//     beforeEach(async () => {
//       setupTest();

//       dElement = fixture.debugElement.query(By.directive(TablebFilterGroupDirective) );
//       const childLoader = await loader.getChildLoader('.optionGroup');
//       checkboxHarness = await childLoader.getHarness(MatCheckboxHarness);
//     });

//     it('should create', () : void => {
//       expect(dElement).toBeTruthy();
//     });

//     it('should emit on child select', async () => {

//       var directive = dElement.injector.get(TablebFilterGroupDirective);
//       var doneSubject = new Subject<void>();
//       var resultPromise = takeItem(directive.filter$, 2, doneSubject);

//       await checkboxHarness.check();
//       doneSubject.next();

//       var result = await resultPromise;
//       expect(result).toBeTruthy();

//     });
//   });

// });
