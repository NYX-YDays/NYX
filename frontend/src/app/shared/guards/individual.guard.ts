import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { UserRole } from '../enums/user-role';
import { UtilService } from '../services/util.service';

/**
 * Guard checking if the current user is authenticated as an "individual".
 * @param _next
 * @param _state
 * @returns `true` if the user is an "individual", else redirects to the auth form and returns `false`.
 */
export const individualGuard: CanActivateFn = async (
  _next: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const utilService = inject(UtilService);

  // Check if current user is an "individual"
  const isIndividual = utilService.getCurrentUserIdentity()?.roles.includes(UserRole.INDIVIDUAL) ?? false;

  // Redirect to the auth form if the user isn't an "individual"
  if (!isIndividual) await router.navigateByUrl('/sign-in');
  return isIndividual;
};
