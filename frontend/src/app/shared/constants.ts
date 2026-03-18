export class Constants {

  /** Cookie names. */
  public static readonly COOKIE_NAMES = {

    /** Current user identity cookie name. */
    userIdentity: 'user-identity'

  };

  /** Regex expression user passwords must match when registering. */
  public static readonly PASSWORD_FORMAT_REGEX = /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/;

  // User roles
  public static readonly ROLE_INDIVIDUAL = 'ROLE_INDIVIDUAL';
  public static readonly ROLE_SERVICE_PROVIDER = 'ROLE_SERVICE_PROVIDER';
  public static readonly ROLE_ADMIN = 'ROLE_ADMIN';

  // File types
  public static readonly FILE_TYPE_PROFILE_PICTURE = 'profile_picture';
  public static readonly FILE_TYPE_BANNER = 'banner';

  // File upload limits
  public static readonly MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024; // 2MB
  public static readonly MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB
  public static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Phone validation regex (french format: 10 digits starting with 0)
  public static readonly PHONE_REGEX = /^0[1-9][0-9]{8}$/;
}
