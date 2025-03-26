import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[originalPassword]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordConfirmDirective,
      multi: true,
    },
  ],
  standalone: true,
})
export class PasswordConfirmDirective implements Validator {

  /** Original password to confirm. */
  @Input('originalPassword') originalPassword = '';

  validate(control: AbstractControl): ValidationErrors | null {
    return control.value != this.originalPassword ? {wrongPassword: {value: control.value}} : null;
  }

}
