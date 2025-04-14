import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { Constants } from '../../../../../shared/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { PasswordConfirmDirective } from '../../../directives/password-confirm.directive';
import { AuthFormLayoutComponent } from '../../auth-form-layout/auth-form-layout.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../../../shared/services/alert.service';
import { AlertType } from '../../../../../core/alert-manager/enums/alert-type';

@Component({
  selector: 'app-sign-up-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PasswordConfirmDirective,
    AuthFormLayoutComponent,
    TranslatePipe
  ],
  templateUrl: './sign-up-form.component.html',
  styleUrl: './sign-up-form.component.scss'
})
export class SignUpFormComponent {

  //region fields

  /** New user to fill information. */
  protected newUser = new User;

  /** Password confirm. */
  protected passwordConfirm = '';

  /** If a registration is running. */
  protected isRegistering = false;

  /** Error message obtained if an error occurs while authenticating. */
  protected errorMessage = '';

  protected readonly Constants = Constants;

  //endregion

  //region injections

  private translateService = inject(TranslateService);

  private authService = inject(AuthService);

  private alertService = inject(AlertService);

  private router = inject(Router);

  //endregion

  //region methods

  /** Register the new user. */
  protected async signUpAsync() {
    this.isRegistering = true;
    this.errorMessage = '';

    try {

      // Add the new user
      await this.authService.signUpAsync(this.newUser);

      // Redirect to the sign-in page
      await this.router.navigateByUrl('/sign-in');

      this.alertService.pushAlert(
        AlertType.SUCCESS,
        this.translateService.instant('AUTH.SIGN_UP.FORM_SUCCESS_TEXT'),
        7
      );

    } catch (e) {

      // Display server errors
      if (e instanceof HttpErrorResponse) {
        switch (e.status) {
          case 401:
          case 403:
            this.errorMessage = this.translateService.instant('AUTH.SIGN_UP.FORM_EMAIL_ALREADY_IN_USE_ERROR');
            break;
          default:
            this.errorMessage = this.translateService.instant('AUTH.FORM_SERVER_ERROR');
        }
      }

      // Display other errors
      else this.errorMessage = this.translateService.instant('AUTH.FORM_ERROR');

      console.error(e);
    }

    this.isRegistering = false;
  }

  //endregion

}
