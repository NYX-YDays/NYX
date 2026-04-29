import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserIdentity } from '../models/user-identity';
import Cookies from 'universal-cookie';
import { Constants } from '../constants';
import { firstValueFrom } from 'rxjs';
import { AlertService } from './alert.service';
import { AlertType } from '../../core/alert-manager/enums/alert-type';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { UserRole } from '../enums/user-role';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  //region fields

  /** Application API URL. */
  protected readonly apiRootUrl = environment.apiUrl;

  //endregion

  //region injections

  protected readonly translateService = inject(TranslateService);

  protected readonly http = inject(HttpClient);

  protected readonly alertService = inject(AlertService);

  protected readonly router = inject(Router);

  //endregion

  //region methods

  //region user identity

  /** @returns The `UserIdentity` of the current user if authenticated, else `null`. */
  public getCurrentUserIdentity(): UserIdentity | null {
    const cookie = new Cookies(null, {path: '/'});
    return cookie.get(Constants.COOKIE_NAMES.userIdentity);
  }

  /** Remove the current user identity. */
  public removeCurrentUserIdentity() {
    const cookie = new Cookies(null, {path: '/'});
    cookie.remove(Constants.COOKIE_NAMES.userIdentity);
  }

  /**
   * Check if the current user identity is valid.
   * @param role If given, check if the authenticated user has the corresponding role.
   * @returns `true` if the current user identity is valid, else `false`.
   * */
  public async checkUserIdentityAsync(role?: UserRole): Promise<boolean> {
    try {

      // Check if the user identity is still valid
      await this.tryGetAsync(`${this.apiRootUrl}/user`, false);

      // Check if the user has a specific role
      return (!role || this.getCurrentUserIdentity()?.roles.includes(role) == true);

    } catch (e) {
      if ((e as HttpErrorResponse).status == 401 || (e as HttpErrorResponse).status == 403) return false;
      else throw e;
    }
  }

  //endregion

  //region API

  /**
   * Trying to get data from the given URL by using the authenticated user token.
   * @param url URL to get data from.
   * @param handleErrors Display an alert if an error occurres.
   * @returns The retrieved data.
   */
  public async tryGetAsync<TOut>(url: string, handleErrors = true): Promise<TOut> {
    try {
      return await firstValueFrom(this.http.get<TOut>(url, {headers: this.getApiAuthHeader()}));
    } catch (e) {
      if (handleErrors) {
        this.alertService.pushAlert(
          AlertType.ERROR,
          this.translateService.instant('COMMON.API.GET_ERROR'),
          7
        );
      }
      throw e;
    }
  }

  /**
   * Trying to post data to the given URL by using the authenticated user token.
   * @param url URL to post data to.
   * @param data Data to post.
   * @param handleErrors Display an alert if an error occurres.
   * @returns The server response.
   */
  public async tryPostAsync<TIn, TOut>(url: string, data: TIn, handleErrors = true): Promise<TOut> {
    try {
      return await firstValueFrom(this.http.post<TOut>(url, data, {headers: this.getApiAuthHeader()}));
    } catch (e) {
      if (handleErrors) {
        this.alertService.pushAlert(
          AlertType.ERROR,
          this.translateService.instant('COMMON.API.ADD_ERROR'),
          7
        );
      }
      throw e;
    }
  }

  /**
   * Trying to put data to the given URL by using the authenticated user token.
   * @param url URL to put data to.
   * @param data Data to put.
   * @param handleErrors Display an alert if an error occurres.
   * @returns The server response.
   */
  public async tryPutAsync<TIn, TOut>(url: string, data: TIn, handleErrors = true): Promise<TOut> {
    try {
      return await firstValueFrom(this.http.put<TOut>(url, data, {headers: this.getApiAuthHeader()}));
    } catch (e) {
      if (handleErrors) {
        this.alertService.pushAlert(
          AlertType.ERROR,
          this.translateService.instant('COMMON.API.UPDATE_ERROR'),
          7
        );
      }
      throw e;
    }
  }

  /**
   * Trying to delete data by using the authenticated user token.
   * @param url URL to call to delete data.
   * @param handleErrors Display an alert if an error occurres.
   * @returns The server response.
   */
  public async tryDeleteAsync<TOut>(url: string, handleErrors = true): Promise<TOut> {
    try {
      return await firstValueFrom(this.http.delete<TOut>(url, {headers: this.getApiAuthHeader()}));
    } catch (e) {
      if (handleErrors) {
        this.alertService.pushAlert(
          AlertType.ERROR,
          this.translateService.instant('COMMON.API.DELETE_ERROR'),
          7
        );
      }
      throw e;
    }
  }

  /**
   * @returns The HTTP headers containing the current user credentials to access the API routes if the user is
   * authenticated, else `undefined`.
   */
  public getApiAuthHeader(): HttpHeaders | undefined {
    const userIdentity = this.getCurrentUserIdentity();
    return !!userIdentity ? new HttpHeaders({Authorization: `Bearer ${userIdentity.token}`}) : undefined;
  }

  //endregion

  //endregion

}
