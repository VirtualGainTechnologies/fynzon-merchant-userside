import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  Renderer2,
} from '@angular/core';


@Directive({
  selector: '[appTruncateText]',
  standalone: true,
})
export class TruncateTextDirective implements AfterViewInit {
  @Input('appTruncateText') text: string = '';
  @Input() limit: number = 15;
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {}

  ngAfterViewInit(): void {
    const truncatedText =
      this.text?.length > this.limit * 1
        ? this.text.substring(0, this.limit * 1) + '...'
        : this.text;

    this.renderer.setProperty(
      this.el.nativeElement,
      'innerText',
      truncatedText,
    );
    this.renderer.setAttribute(this.el.nativeElement, 'title', this.text);
  }
}
