// Helpers for preserving multi-line / tab-separated paste content into single-line
// <input> elements. Browsers replace `\n` with a space when pasting into a single-line
// input, which destroys the structure of an Excel column paste before any framework code
// can see it. The trick is to intercept the `paste` event, read the raw clipboard text,
// and write it directly into the input's value via the prototype setter so frameworks
// (Angular's ngModel, etc.) still get a synthetic input event.

export function hasPreservableDelimiters(text: string | null | undefined): text is string {
  return !!text && /[\n\r\t]/.test(text);
}

export function injectPasteText(input: HTMLInputElement, text: string): void {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const newValue = input.value.slice(0, start) + text + input.value.slice(end);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, newValue);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
