import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { map, Observable } from 'rxjs';

import { ValidateUserData } from '../auth/models/validateUserModel';

export function UserValiadtor(data: {
  services: any;
  controlName: string;
}): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const payload: any = {
      ...(data?.controlName === 'email' && {
        email: control.value,
      }),
      ...(data?.controlName === 'businessName' && {
        businessName: control.value,
      }),
      ...(data?.controlName === 'phone' && {
        phone: control.value,
      }),
    };

    return data?.services?.authservice?.validateUser(payload).pipe(
      map((res: ValidateUserData) => {
        console.log('res', res);
        return res?.data?.userExists ? { userExists: true } : null;
      }),
    );
  };
}
