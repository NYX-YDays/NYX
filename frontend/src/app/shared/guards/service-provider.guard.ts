import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { UserIdentityService } from '../services/user-identity.service';
import { UserRole } from '../enums/user-role';

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
  const sharedAuthService = inject(UserIdentityService);

  // Check if current user is a "service provider"
  const isServiceProvider = sharedAuthService.getCurrentUserIdentity()?.roles.includes(UserRole.SERVICE_PROVIDER) ?? false;

  // Redirect to the auth form if the user isn't an "individual"
  if (!isServiceProvider) await router.navigateByUrl('/auth');
  return isServiceProvider;
};
