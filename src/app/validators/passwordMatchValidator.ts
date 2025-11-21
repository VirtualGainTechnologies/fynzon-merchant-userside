import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export function passwordMatchValidator(
  password: string,
  confirmPassword: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordVal = control.get(password)?.value;
    const confirmPasswordVal = control.get(confirmPassword)?.value;
    const confirmPasswordControl = control.get(confirmPassword);

    if (!confirmPasswordControl) {
      return null;
    }

    // Merge custom error with existing ones
    const existingErrors = confirmPasswordControl.errors || {};

    if (passwordVal !== confirmPasswordVal) {
      confirmPasswordControl.setErrors({
        ...existingErrors,
        passwordMismatch: true,
      });
      return { passwordMismatch: true };
    } else {
      // Remove the passwordMismatch error while preserving others
      delete existingErrors['passwordMismatch'];

      // If there are no other errors, set to null; otherwise, keep the remaining errors
      if (Object.keys(existingErrors).length === 0) {
        confirmPasswordControl.setErrors(null);
      } else {
        confirmPasswordControl.setErrors(existingErrors);
      }

      return null;
    }
  };
}
