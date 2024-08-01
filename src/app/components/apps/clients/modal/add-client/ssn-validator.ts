import { AbstractControl, ValidatorFn } from "@angular/forms";

export function ssnValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^\d \d{2} \d{2} \d{2} \d{3} \d{3}\/\d{2}$/.test(control.value);
    return valid ? null : { ssnInvalid: { value: control.value } };
  };
}
