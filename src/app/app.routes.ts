import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((auth) => auth.authRoutes),
  },

  {
    path: '',
    loadChildren: () =>
      import('./navigation/navigation.routes').then((navigation) => navigation.navigationRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((dashboard) => dashboard.dashboardRoutes),
  },
];
