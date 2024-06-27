import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ssnValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^\d{13}\/\d{2}$/.test(control.value);
    return valid ? null : { 'ssnInvalid': { value: control.value } };
  };
}
