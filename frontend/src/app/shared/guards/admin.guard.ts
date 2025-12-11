import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { UserRole } from '../enums/user-role';
import { UtilService } from '../services/util.service';

/**
 * Guard checking if the current user is authenticated as an admin.
 * @param _next
 * @param _state
 * @returns `true` if the user is an admin, else redirects to the home page and returns `false`.
 */
export const adminGuard: CanActivateFn = async (
  _next: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const utilService = inject(UtilService);

  // Check if current user has ROLE_ADMIN
  const isAdmin = utilService.getCurrentUserIdentity()?.roles.includes(UserRole.ADMIN) ?? false;

  // Redirect to home if the user isn't an admin
  if (!isAdmin) {
    await router.navigateByUrl('/');
  }
  
  return isAdmin;
};