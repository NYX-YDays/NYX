<?php

namespace App\Constants;

class AppConstants
{
    public const PUBLIC_ACCESS = 'PUBLIC_ACCESS';
    public const ROLE_INDIVIDUAL = 'ROLE_INDIVIDUAL';
    public const ROLE_SERVICE_PROVIDER = 'ROLE_SERVICE_PROVIDER';
    public const ROLE_ADMIN = 'ROLE_ADMIN';

    // Types de fichiers autorisés
    public const FILE_TYPE_PROFILE_PICTURE = 'profile_picture';
    public const FILE_TYPE_BANNER = 'banner';

    public const ALLOWED_FILE_TYPES = [
        self::FILE_TYPE_PROFILE_PICTURE,
        self::FILE_TYPE_BANNER,
    ];
}
