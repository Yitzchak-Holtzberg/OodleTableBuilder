import { Component } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { DialogDirective, DialogWrapper } from "../utilities";
import { DialogService } from "../utilities/directives/dialog-service";
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import {HarnessLoader} from '@angular/cdk/testing';
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";

@Component({
    template: `
    <ng-container *opDialog='subject; let text; let close = close'>
      If you see this text, I'm open {{text}}
      <button mat-button (click)='close()' >close</button>
    </ng-container>
    `,
    imports: [MatDialogModule, MatButtonModule]
}) export class TestComponent {
  subject = new Subject();
}


describe("DialogDirective", () => {

let fixture: ComponentFixture<TestComponent>;
let loader: HarnessLoader;

beforeEach(
  waitForAsync(async () => {
    await TestBed.configureTestingModule({
    imports: [MatDialogModule, NoopAnimationsModule, MatButtonModule, TestComponent,
        DialogDirective],
    declarations: [DialogWrapper],
    providers: [DialogService]
}).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  }),
);

  it('before observable emits the dialog should remain closed',async () => {
    expect(fixture.nativeElement.textContent).not.toContain('If you see this text, I\'m open');
  });

  it('when observable emits the dialog should be open', fakeAsync( async () => {
    fixture.componentInstance.subject.next(true);
    fixture.detectChanges();
    const dialogHarness = await loader.getHarness(MatDialogHarness);
    expect(await dialogHarness.getText()).toContain('If you see this text, I\'m open');
  }));

  it('when observable emits false the dialog should close', fakeAsync( async () => {
    fixture.componentInstance.subject.next(true);
    fixture.detectChanges();
    let dialogHarness = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogHarness.length).toBe(1);
    fixture.componentInstance.subject.next(false);
    fixture.detectChanges();
    dialogHarness = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogHarness.length).toBe(0);
  }));

  it('when close is clicked the dialog should close', fakeAsync( async () => {
    fixture.componentInstance.subject.next(true);
    fixture.detectChanges();
    let dialogHarness = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogHarness.length).toBe(1);
    let buttonHarness = await dialogHarness[0].getHarness(MatButtonHarness);
    await buttonHarness.click();
    fixture.detectChanges();
    dialogHarness = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogHarness.length).toBe(0);
  }));

  it('when observable emits the template should have access to the emitted data', fakeAsync( async () => {
    fixture.componentInstance.subject.next('Text #1');
    fixture.detectChanges();
    const dialogHarness = await loader.getHarness(MatDialogHarness);
    expect(await dialogHarness.getText()).toContain('Text #1');
  }));

  it('when observable emits a 2nd time the template should have access to the new data', fakeAsync( async () => {
    fixture.componentInstance.subject.next('Text #1');
    fixture.detectChanges();
    const dialogHarness = await loader.getHarness(MatDialogHarness);
    expect(await dialogHarness.getText()).toContain('Text #1');
    fixture.componentInstance.subject.next('Text #2');
    fixture.detectChanges();
    expect(await dialogHarness.getText()).toContain('Text #2');
  }));

});


