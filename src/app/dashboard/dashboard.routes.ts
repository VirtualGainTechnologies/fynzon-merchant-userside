import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard';
import { Invoice } from './payment/components/invoice/invoice';

export const dashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.routes').then((home) => home.homeRoutes),
      },
      {
        path: "account",
        loadChildren:()=> import('./account_management/account-management.routes').then((account)=>account.accountManagementRoute)
      },
      {
        path:"developer", loadChildren:()=> import("./developer_control/developerControl.routes").then((routes)=> routes.dashboardRoutes)
      },
      {
        path:"payment", loadChildren:()=> import("./payment/payment.routes").then((routes)=>routes.paymentRoutes)
      }
    ],
  },
];
