import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserIdentity } from '../models/user-identity';
import Cookies from 'universal-cookie';
import { Constants } from '../constants';
import { firstValueFrom } from 'rxjs';
import { AlertService } from './alert.service';
import { AlertType } from '../../core/alert-manager/enums/alert-type';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  //region fields

  //region API

  /** HTTP headers to use to call API routes. */
  private readonly apiAuthHeader!: HttpHeaders;

  //endregion

  //endregion

  //region injections

  protected readonly http = inject(HttpClient);

  protected readonly alertService = inject(AlertService);

  protected readonly translateService = inject(TranslateService);

  //endregion

  //region constructors

  constructor() {
    this.apiAuthHeader = new HttpHeaders({Authorization: `Bearer ${this.getCurrentUserIdentity()?.token}`});
  }

  //endregion

  //region methods

  //region user identity

  /** @returns The `UserIdentity` of the current user if authenticated, else `null`. */
  public getCurrentUserIdentity(): UserIdentity | null {
    const cookie = new Cookies(null, {path: '/'});
    return cookie.get(Constants.COOKIE_NAMES.userIdentity);
  }

  //endregion

  //region API

  /**
   * Trying to get data from the given URL by using the authenticated user token.
   * @param url URL to get data from.
   * @param handleErrors Display an alert if an error occurres.
   * @returns The retrieved data.
   */
  public async tryGetAsync(url: string, handleErrors = true): Promise<any> {
    try {
      return await firstValueFrom(this.http.get(url, {headers: this.apiAuthHeader}));
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
  public async tryPostAsync(url: string, data: any, handleErrors = true): Promise<any> {
    try {
      return await firstValueFrom(this.http.post(url, data, {headers: this.apiAuthHeader}));
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
  public async tryPutAsync(url: string, data: any, handleErrors): Promise<any> {
    try {
      return await firstValueFrom(this.http.put(url, data, {headers: this.apiAuthHeader}));
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
  public async tryDeleteAsync(url: string, handleErrors = true): Promise<any> {
    try {
      return await firstValueFrom(this.http.delete(url, {headers: this.apiAuthHeader}));
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

  //endregion

  //endregion

}
