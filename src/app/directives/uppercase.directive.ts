import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[uppercase]',
  standalone: true,
})
export class UppercaseDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  // Listen to input events and modify the value
  @HostListener('input', ['$event']) onInputChange(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = input.value.toUpperCase();
     this.control.control?.setValue(input.value, { emitEvent: false });
  }
}
