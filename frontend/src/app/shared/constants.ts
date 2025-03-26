export class Constants {

  /** Cookie names. */
  public static readonly COOKIE_NAMES = {

    /** Current user identity cookie name. */
    userIdentity: 'user-identity'

  };

  /** Regex expression user passwords must match when registering. */
  public static readonly PASSWORD_FORMAT_REGEX = /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/;

}
