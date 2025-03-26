import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { IndividualProfileComponent } from './features/individuals/individual-profile/individual-profile.component';
import { individualGuard } from './shared/guards/individual.guard';
import { RouteSettings } from './shared/models/route-settings';
import { SignInFormComponent } from './features/auth/components/forms/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './features/auth/components/forms/sign-up-form/sign-up-form.component';

export const routes: Routes = [

  //region individuals

  // Individual profile
  {
    path: 'profile',
    component: IndividualProfileComponent,
    canActivate: [individualGuard]
  },

  //endregion

  //region service providers

  //endregion

  //region default

  // Sign in form
  {
    path: 'sign-in',
    component: SignInFormComponent,
    data: {
      showAppLayout: false
    } as RouteSettings
  },

  // Sign up form
  {
    path: 'sign-up',
    component: SignUpFormComponent,
    data: {
      showAppLayout: false
    } as RouteSettings
  },

  // Default route (index)
  {
    path: '',
    component: HomeComponent
  },

  // 404 page
  {
    path: '**',
    component: NotFoundComponent,
    pathMatch: 'full'
  }

  //endregion

];
