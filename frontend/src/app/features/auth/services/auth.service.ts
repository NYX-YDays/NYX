import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { UserIdentity } from '../../../shared/models/user-identity';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //region fields

  /** Authentication route URL. */
  private apiUrl = environment.apiUrl;

  //endregion

  //region injections

  private http = inject(HttpClient);

  //endregion

  //region methods

  /**
   * Register a new application user.
   * @param user New application user to register.
   */
  public signUpAsync(user: User): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/user`, user));
  }

  /**
   * Sign in using the given authentication data.
   * @param email Authentication email.
   * @param password Authentication password.
   * @returns The corresponding user identity if the authentication succeeded.
   */
  public signInAsync(email: string, password: string): Promise<UserIdentity> {
    return firstValueFrom(this.http.post<UserIdentity>(`${this.apiUrl}/auth`, {email: email, password: password}));
  }

  //endregion

}
