import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';

export function phoneValidator(region: string = 'US'): ValidatorFn {
  const phoneUtil = PhoneNumberUtil.getInstance();

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Don't validate empty value here

    try {
      const phoneNumber = phoneUtil.parse(value, region);
      const isValid = phoneUtil.isValidNumberForRegion(phoneNumber, region);
      return isValid ? null : { invalidPhone: true };
    } catch (error) {
      return { invalidPhone: true };
    }
  };
}