import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home.component';
import { IndividualProfileComponent } from './features/individuals/components/individual-profile/individual-profile.component';
import { IndividualProfileEditComponent } from './features/individuals/components/individual-profile-edit/individual-profile-edit.component';
import { IndividualEventsComponent } from './features/individuals/components/individual-events/individual-events.component';
import { individualGuard } from './shared/guards/individual.guard';
import { RouteSettings } from './shared/models/route-settings';
import { SignInFormComponent } from './features/auth/components/forms/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './features/auth/components/forms/sign-up-form/sign-up-form.component';
import { AdListComponent } from './features/ads/components/ad-list/ad-list.component';
import { AdDetailComponent } from './features/ads/components/ad-detail/ad-detail.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './shared/guards/admin.guard';
import { AdminUsersListComponent } from './features/admin/admin-users-list/admin-users-list.component';
import { AdminAdsListComponent } from './features/admin/admin-ads-list/admin-ads-list.component';
import { AdminEventsListComponent } from './features/admin/admin-events-list/admin-events-list.component';

export const routes: Routes = [

  //region individuals

  // Individual profile
  {
    path: 'profile',
    component: IndividualProfileComponent,
    canActivate: [individualGuard]
  },
  {
    path: 'profile/edit',
    component: IndividualProfileEditComponent,
    canActivate: [individualGuard]
  },

  //endregion

  //region admin

  // Admin routes (protégées par adminGuard)
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    data: {
      showAppLayout: false
    } as RouteSettings
  },

  {
    path: 'admin/users',
    component: AdminUsersListComponent,
    canActivate: [adminGuard],
    data: {
      showAppLayout: false
    } as RouteSettings
  },

  {
    path: 'admin/ads',
    component: AdminAdsListComponent,
    canActivate: [adminGuard],
    data: {
      showAppLayout: false
    } as RouteSettings
  },

  {
    path: 'admin/events',
    component: AdminEventsListComponent,
    canActivate: [adminGuard],
    data: {
      showAppLayout: false
    } as RouteSettings
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
