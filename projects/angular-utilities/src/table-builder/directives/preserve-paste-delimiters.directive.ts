import { Directive, ElementRef, HostListener } from '@angular/core';
import { hasPreservableDelimiters, injectPasteText } from '../functions/paste-preservation';

/**
 * Apply to any single-line `<input>` to keep tab and newline characters from being
 * silently replaced with spaces on paste. The pasted text is injected via the native
 * value setter so Angular's ngModel still sees the change.
 *
 * Pair with `splitCommaValue` (or any predicate that handles `[,\t\n\r]+` delimiters)
 * for the multi-value semantics. Plain typed input with regular spaces is untouched.
 */
@Directive({
  selector: 'input[tbPreservePasteDelimiters]',
  standalone: false,
})
export class PreservePasteDelimitersDirective {
  constructor(private host: ElementRef<HTMLInputElement>) {}

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text/plain');
    if (!hasPreservableDelimiters(text)) return;
    e.preventDefault();
    // Single-line <input> sanitizes its `.value` by stripping newlines per HTML spec,
    // so injecting raw newlines would lose them. Convert tab/newline runs to commas
    // before injection — splitter handles commas, and the user sees the normalized
    // value as visible confirmation of how their paste was interpreted.
    const normalized = text.replace(/[\t\n\r]+/g, ',');
    injectPasteText(this.host.nativeElement, normalized);
  }
}
