import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(),withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideToastr({
      timeOut: 5000,
      preventDuplicates: true,
      closeButton: true,
      extendedTimeOut: 5000,
      progressBar: true,
      progressAnimation: 'decreasing',
      positionClass: 'toast-top-right',
      maxOpened: 1,
      autoDismiss: true,
    }),
  ],
};
