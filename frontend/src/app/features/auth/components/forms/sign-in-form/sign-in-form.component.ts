import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Constants } from '../../../../../shared/constants';
import { HttpErrorResponse } from '@angular/common/http';
import Cookies from 'universal-cookie';
import { AuthFormLayoutComponent } from '../../auth-form-layout/auth-form-layout.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-in-form',
  imports: [
    FormsModule,
    AuthFormLayoutComponent,
    TranslatePipe
  ],
  templateUrl: './sign-in-form.component.html',
  styleUrl: './sign-in-form.component.scss'
})
export class SignInFormComponent {

  //region fields

  /** Authentication email. */
  protected email = '';

  /** Authentication password. */
  protected password = '';

  /** If the user should be remembered when launching the app. */
  protected rememberMe = true;

  /** If an authentication is running. */
  protected isAuthenticating = false;

  /** Error message obtained if an error occurs while authenticating. */
  protected errorMessage = '';

  //endregion

  //region injections

  private translateService = inject(TranslateService);

  private authService = inject(AuthService);

  //endregion

  //region methods

  /** Sign in with the given form data. */
  protected async signInAsync() {
    this.isAuthenticating = true;
    this.errorMessage = '';

    try {

      // Sign in and get the current user identity
      const userIdentity = await this.authService.signInAsync(this.email, this.password);

      // Save the user identity in a cookie
      const cookie = new Cookies(null, {path: '/'});
      cookie.set(Constants.COOKIE_NAMES.userIdentity, JSON.stringify(userIdentity));

    } catch (e) {

      // Display server errors
      if (e instanceof HttpErrorResponse) {
        switch (e.status) {
          case 404:
            this.errorMessage = this.translateService.instant('AUTH.SIGN_IN.FORM_INVALID_USER_ERROR');
            break;
          case 401:
          case 403:
            this.errorMessage = this.translateService.instant('AUTH.SIGN_IN.FORM_INVALID_LOGIN_ERROR');
            break;
          default:
            this.errorMessage = this.translateService.instant('AUTH.FORM_SERVER_ERROR');
        }
      }

      // Display other errors
      else this.errorMessage = this.translateService.instant('AUTH.FORM_ERROR');

      console.error(e);
    }

    this.isAuthenticating = false;
  }

  //endregion

}
