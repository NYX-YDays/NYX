import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home.component';
import { IndividualProfileComponent } from './features/individuals/components/individual-profile/individual-profile.component';
import { IndividualEventsComponent } from './features/individuals/components/individual-events/individual-events.component';
import { individualGuard } from './shared/guards/individual.guard';
import { RouteSettings } from './shared/models/route-settings';
import { SignInFormComponent } from './features/auth/components/forms/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './features/auth/components/forms/sign-up-form/sign-up-form.component';
import { AdListComponent } from './features/ads/components/ad-list/ad-list.component';
import { AdDetailComponent } from './features/ads/components/ad-detail/ad-detail.component';
import { NotFoundComponent } from './core/not-found/not-found.component';

export const routes: Routes = [

  //region individuals

  // Individual profile
  {
    path: 'profile',
    component: IndividualProfileComponent,
    canActivate: [individualGuard]
  },

  //endregion

  //region events

  {
    path: 'events',
    component: IndividualEventsComponent,
    canActivate: [individualGuard],
  },

  //endregion

  //region ads

  // Ads list
  {
    path: 'ads',
    component: AdListComponent,
    data: {
      showAppLayout: true
    } as RouteSettings
  },

  // Ad detail
  {
    path: 'ad/:id',
    component: AdDetailComponent
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
