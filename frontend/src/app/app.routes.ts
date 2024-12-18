import { Routes } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { NotFoundComponent } from './core/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];
