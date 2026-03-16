import { Directive, ElementRef, Input, inject } from '@angular/core';
import { TableContainerComponent } from '../components/table-container/table-container';
import { Subject, takeUntil, tap } from 'rxjs';

@Directive({
    selector: 'tb-table-container[isVs]',
    exportAs: 'vs',
    standalone: true
})
export class VirtualScrollViewportDirective {
  private el = inject(ElementRef);
  private tbComponent = inject(TableContainerComponent);


  @Input() offset!: number;
  @Input() set isVs(val: boolean | string) {
    if (val || val === '') {
      this._isVs = true;
    } else {
      this._isVs = false;
    }
  }

  _isVs = false;
  private resizeFn!: () => void;
  private resizeTimeout: any;
  destroyed$ = new Subject<void>();

  addListener(callback: () => void) {
    this.resizeFn = callback;
    addEventListener('resize', this.resizeFn);
  }

  removeListener() {
    if (this.resizeFn) {
      removeEventListener('resize', this.resizeFn);
      this.resizeFn = null!;
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  private adjustViewportHeight(): void {
    const vsViewport: Element | undefined = this.el.nativeElement.querySelector('cdk-virtual-scroll-viewport') ?? undefined;
    const vsContentWrapper: Element | undefined = vsViewport?.querySelector('.cdk-virtual-scroll-content-wrapper') ?? undefined;
    if (!vsViewport || !vsContentWrapper) {
      return;
    }
    const hasHorizontalScrollBar = vsViewport.scrollWidth > vsViewport.clientWidth;
    const rect = vsContentWrapper.getBoundingClientRect();
    let wrapperHeight = 0;
    if (rect.top >= 0) {
      wrapperHeight = rect.bottom;
    } else {
      wrapperHeight = rect.bottom + rect.top;
    }
    if (wrapperHeight < window.innerHeight) {
      vsViewport.setAttribute('style', `height: ${vsContentWrapper.clientHeight + (hasHorizontalScrollBar ? 17 : 0)}px !important;`);
    } else {
      vsViewport.setAttribute('style', `height: ${window.innerHeight - this.el.nativeElement.offsetTop - (this.offset || 167)}px !important;`);
    }
  }

  resize(): void {
    if (this._isVs) {
      setTimeout(() => this.adjustViewportHeight(), 0);
    }
  }

  ngOnInit(): void {
    if (this._isVs) {
      this.addListener(() => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this.adjustViewportHeight(), 100);
      });
    }
  }

  ngAfterViewInit(): void {
    if (this._isVs) {
      setTimeout(() => {
        this.adjustViewportHeight();

        this.tbComponent?.data?.pipe(
          takeUntil(this.destroyed$),
          tap(() => {
            setTimeout(() => this.adjustViewportHeight(), 0);
          })
        ).subscribe();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.removeListener();
    this.destroyed$.next();
  }
}
