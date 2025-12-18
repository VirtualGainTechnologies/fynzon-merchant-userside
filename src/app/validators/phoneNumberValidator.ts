import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js';

export function phoneNumberValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // let required handle empty

    try {
      const isValid = isValidPhoneNumber(control.value);
      return isValid ? null : { invalidPhone: true };
    } catch {
      return { invalidPhone: true };
    }
  };
}