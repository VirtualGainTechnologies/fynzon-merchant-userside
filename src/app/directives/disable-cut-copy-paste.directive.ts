import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[disableCutCopyPaste]',
  standalone: true,
})
export class DisableCutCopyPasteDirective {
  constructor(el: ElementRef, renderer: Renderer2) {
    const events = ['cut', 'copy', 'paste'];
    events.forEach((e) => {
      renderer.listen(el.nativeElement, e, (event) => {
        event.preventDefault();
      });
    });
  }
}
