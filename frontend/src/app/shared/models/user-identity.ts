import { UserRole } from '../enums/user-role';

/** The current user identity. */
export class UserIdentity {

  /** The current user ID. */
  public id = NaN;

  /** The current user roles. */
  public roles = new Array<UserRole>;

  /** The current user first name. */
  public firstName = '';

  /** The current user last name. */
  public lastName = '';

  /** The current user email. */
  public email = '';

  /** The current user token. */
  public token = '';

  /** If the current user should be remembered when launching the app. */
  public rememberMe = true;

}
