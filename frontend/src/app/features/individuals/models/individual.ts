import { File } from './file';

/** Individual user. */
export class Individual {

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

  /** User address. */
  public address = '';

  /** User sex. */
  public sex = '';

  /** User bio. */
  public bio = '';

  /** User phone number. */
  public phone = '';

  /** User roles */
  public roles: string[] = [];

  /** User files (profile picture, banner, etc.). */
  public files: File[] = [];

}
