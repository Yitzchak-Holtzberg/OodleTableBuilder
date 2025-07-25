import { Component } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ClickEmitterDirective, ClickSubjectDirective } from "../utilities";
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";

@Component({
    template: `
     <a mat-button clickEmitter  #subj='clickEmitter' >click me</a>
     <div *ngIf='subj | async'>Hello World!</div>
    `,
    standalone: false
}) export class TestComponent {
  subject = new Subject();
}

@Component({
    template: `
   <a mat-button [clickSubject]='{content: "Hello World!" }' #subj='clickSubject' >click me</a>
   <div *ngIf='subj | async as o'>{{o.content}}</div>
  `,
    standalone: false
}) export class TestContentComponent {
subject = new Subject();
}


let fixture: ComponentFixture<TestComponent>;
let loader: HarnessLoader;

const setupTest = (): void => {
  TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [
        TestComponent,
        ClickEmitterDirective,
    ],
    providers: [  ]
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
};

const setupContentTest = (): void => {
  TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [
        TestContentComponent,
        ClickSubjectDirective,
    ],
    providers: [  ]
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


