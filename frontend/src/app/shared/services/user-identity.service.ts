import { Injectable } from '@angular/core';
import { Constants } from '../constants';
import { UserIdentity } from '../models/user-identity';
import Cookies from 'universal-cookie';

@Injectable({
  providedIn: 'root'
})
export class UserIdentityService {

  //region methods

  /** @returns The `UserIdentity` of the current user if authenticated, else `null`. */
  public getCurrentUserIdentity(): UserIdentity | null {
    const cookie = new Cookies(null, {path: '/'});
    const value = cookie.get(Constants.COOKIE_NAMES.userIdentity);
    return value ? JSON.parse(value) : null;
  }

  //endregion

}
