import { UserRole } from '../../../shared/enums/user-role';

/** Application user. */
export class User {

  /** User ID. */
  public id = NaN;

  /** User first name. */
  public firstName = '';

  /** User last name. */
  public lastName = '';

  /** User birthdate. */
  public birthdayDate = new Date;

  /** User email. */
  public email = '';

  /** User password. */
  public password = '';

  /** User roles. */
  public roles = new Array<UserRole>;

  /** User address. */
  public address = '';

  /** User gender. */
  public gender = '';

  /** User bio. */
  public bio = '';

  /** User phone number. */
  public phone = '';

}
