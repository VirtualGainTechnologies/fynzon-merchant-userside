import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function bankAccMatchValidator(
  accNumber: string,
  confirmAccNumber: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const accNumberVal = control.get(accNumber)?.value;
    const confirmAccNumberVal = control.get(confirmAccNumber)?.value;
    const confirmAccControl = control.get(confirmAccNumber);

    if (!confirmAccControl) {
      return null;
    }

    // Merge custom error with existing ones
    const existingErrors = confirmAccControl.errors || {};

    if (accNumberVal !== confirmAccNumberVal) {
      confirmAccControl.setErrors({
        ...existingErrors,
        accountMismatch: true,
      });
      return { accountMismatch: true };
    } else {
      delete existingErrors['accountMismatch'];

      if (Object.keys(existingErrors).length === 0) {
        confirmAccControl.setErrors(null);
      } else {
        confirmAccControl.setErrors(existingErrors);
      }

      return null;
    }
  };
}

export function gstinMatchValidator(
  gstinNumber: string,
  confirmGstinNumber: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const gstinNumberVal = control.get(gstinNumber)?.value;
    const confirmGstinNumberVal = control.get(confirmGstinNumber)?.value;
    const confirmGstinControl = control.get(confirmGstinNumber);

    if (!confirmGstinControl) {
      return null;
    }

    // Merge custom error with existing ones
    const existingErrors = confirmGstinControl.errors || {};

    if (gstinNumberVal !== confirmGstinNumberVal) {
      confirmGstinControl.setErrors({
        ...existingErrors,
        gstinMismatch: true,
      });
      return { gstinMismatch: true };
    } else {
      delete existingErrors['gstinMismatch'];

      if (Object.keys(existingErrors).length === 0) {
        confirmGstinControl.setErrors(null);
      } else {
        confirmGstinControl.setErrors(existingErrors);
      }

      return null;
    }
  };
}