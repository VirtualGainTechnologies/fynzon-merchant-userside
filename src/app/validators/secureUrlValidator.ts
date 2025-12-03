import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function secureUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const url = control.value;

    if (url && !url.startsWith('https://')) {
      return { insecureUrl: true };
    }

    return null;
  };
}