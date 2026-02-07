import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { InMemoryDataService } from './mock/in-memory-data.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // Mock backend - only in development
    ...(environment.useMock
      ? [
          importProvidersFrom(
            HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
              apiBase: 'api/',
              delay: 500,
              passThruUnknownUrl: true,
            }),
          ),
        ]
      : []),
  ],
};
