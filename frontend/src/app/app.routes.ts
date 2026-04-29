import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home.component';
import { IndividualProfileComponent } from './features/individuals/components/individual-profile/individual-profile.component';
import { IndividualProfileEditComponent } from './features/individuals/components/individual-profile-edit/individual-profile-edit.component';
import { EventListComponent } from './features/events/components/event-list/event-list.component';
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
import { AdminCategoriesListComponent } from './features/admin/admin-categories-list/admin-categories-list.component';
import { EventDetailComponent } from './features/events/components/event-detail/event-detail.component';
import { AddEventComponent } from './features/events/components/add-event/add-event.component';
import { ApproachListComponent } from './features/approaches/components/approach-list/approach-list.component';
import { serviceProviderGuard } from './shared/guards/service-provider.guard';
import {
  ServiceProviderAdListComponent
} from './features/ads/components/service-provider-ad-list/service-provider-ad-list.component';
import { AdAddComponent } from './features/ads/components/ad-add/ad-add.component';
import {
  ServiceProviderAdDetailComponent
} from './features/ads/components/service-provider-ad-detail/service-provider-ad-detail.component';

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

  {
    path: 'admin/categories',
    component: AdminCategoriesListComponent,
    canActivate: [adminGuard],
    data: {
      showAppLayout: false
    } as RouteSettings
  },

  //endregion

  //region events

  {
    path: 'events',
    component: EventListComponent,
    canActivate: [individualGuard]
  },

  {
    path: 'event/add',
    component: AddEventComponent,
    canActivate: [individualGuard]
  },

  {
    path: 'event/:id',
    component: EventDetailComponent,
    canActivate: [individualGuard]
  },

  //endregion

  //region ads

  // Ads list
  {
    path: 'ads',
    component: AdListComponent
  },

  // Ad detail
  {
    path: 'ad/:id',
    component: AdDetailComponent
  },

  // Service provider ads
  {
    path: 'my-ads',
    component: ServiceProviderAdListComponent,
    canActivate: [serviceProviderGuard]
  },

  // Service provider ad form (addition)
  {
    path: 'my-ads/add',
    component: AdAddComponent,
    canActivate: [serviceProviderGuard]
  },

  // Service provider ad
  {
    path: 'my-ads/:id',
    component: ServiceProviderAdDetailComponent,
    canActivate: [serviceProviderGuard]
  },

  //endregion

  //region approaches

  {
    path: 'approaches',
    component: ApproachListComponent,
    canActivate: [serviceProviderGuard]
  },

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
