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
  }

  resize(): void {
    if (this._isVs) {
      setTimeout(() => {
        const vsViewport: Element = this.el.nativeElement.children[1]?.children[0]?.children[0];
        const vsContentWrapper: Element = vsViewport?.children[0];
        const hasHorizontalScrollBar = vsViewport?.scrollWidth > vsViewport?.clientWidth;
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
      }, 0)
    }
}

  ngOnInit(): void {
    if (this._isVs) {
      this.addListener(() => {
        const vsViewport: Element = this.el.nativeElement.children[1]?.children[0]?.children[0];
        const vsContentWrapper: Element = vsViewport?.children[0];
        const hasHorizontalScrollBar = vsViewport?.scrollWidth > vsViewport?.clientWidth;
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
      })
    }
  }

  ngAfterViewInit(): void {
    if (this._isVs) {
      setTimeout(() => {
        const vsViewport: Element = this.el.nativeElement.children[1]?.children[0]?.children[0];
        const vsContentWrapper: Element = vsViewport?.children[0];
        const hasHorizontalScrollBar = vsViewport?.scrollWidth > vsViewport?.clientWidth;
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

        this.tbComponent?.data?.pipe(
          takeUntil(this.destroyed$),
          tap(() => {
            setTimeout(() => {
              const vsViewport: Element = this.el.nativeElement.children[1]?.children[0]?.children[0];
              const vsContentWrapper: Element = vsViewport?.children[0];
              const hasHorizontalScrollBar = vsViewport?.scrollWidth > vsViewport?.clientWidth;
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
                  }, 0)
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
