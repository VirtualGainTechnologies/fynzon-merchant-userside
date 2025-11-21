import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';

export const authRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
];
