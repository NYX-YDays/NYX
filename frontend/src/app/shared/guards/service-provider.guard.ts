import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { UserRole } from '../enums/user-role';
import { UtilService } from '../services/util.service';

/**
 * Guard checking if the current user is authenticated as a "service provider".
 * @param _next
 * @param _state
 * @returns `true` if the user is a "service provider", else redirects to the auth form and returns `false`.
 */
export const serviceProviderGuard: CanActivateFn = async (
  _next: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const utilService = inject(UtilService);

  // Check if current user is authenticated as a "service provider"
  const isValid = await utilService.checkUserIdentityAsync(UserRole.SERVICE_PROVIDER);

  // Redirect to the auth form if the user session isn't valid
  if (!isValid) {
    utilService.removeCurrentUserIdentity();
    await router.navigateByUrl('/sign-in');
  }

  return isValid;
};
