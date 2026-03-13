import { Component } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ClickEmitterDirective, ClickSubjectDirective } from "../utilities";
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { CommonModule } from "@angular/common";

@Component({
    template: `
     <a mat-button clickEmitter  #subj='clickEmitter' >click me</a>
     @if (subj | async) {
       <div>Hello World!</div>
     }
     `,
    imports: [MatButtonModule, CommonModule]
}) export class TestComponent {
  subject = new Subject();
}

@Component({
    template: `
   <a mat-button [clickSubject]='{content: "Hello World!" }' #subj='clickSubject' >click me</a>
   @if (subj | async; as o) {
     <div>{{o.content}}</div>
   }
   `,
    imports: [MatButtonModule, CommonModule]
}) export class TestContentComponent {
subject = new Subject();
}


let fixture: ComponentFixture<TestComponent>;
let loader: HarnessLoader;

const setupTest = (): void => {
  TestBed.configureTestingModule({
    imports: [MatButtonModule, CommonModule, TestComponent,
        ClickEmitterDirective],
    providers: []
});
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
};

const setupContentTest = (): void => {
  TestBed.configureTestingModule({
    imports: [MatButtonModule, CommonModule, TestContentComponent,
        ClickSubjectDirective],
    providers: []
});
    fixture = TestBed.createComponent(TestContentComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
};


describe("ClickSubjectDirective", () => {
  describe("Default Subject", () => {
    beforeEach(waitForAsync(setupTest));

    it('before button is clicked the text should remain hidden',async () => {
      expect(fixture.nativeElement.textContent).not.toContain('Hello World!');
    });

    it('when button is clicked the text should display', fakeAsync( async () => {
      const buttonHarness = await loader.getHarness(MatButtonHarness);
      await buttonHarness.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Hello World!');
    }));

  });

  describe("Subject with Content", () => {
    beforeEach(waitForAsync(setupContentTest));

    it('before button is clicked the text should remain hidden',async () => {
      expect(fixture.nativeElement.textContent).not.toContain('Hello World!');
    });

    it('when button is clicked the text should display', fakeAsync( async () => {
      const buttonHarness = await loader.getHarness(MatButtonHarness);
      await buttonHarness.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Hello World!');
    }));
  })

});


