import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

// Gestione di cosa mostrare in base all'Url corrente
// Le guard sono utilizzate per prevenire accessi indesiderati
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sensor/:sensorId',
    loadComponent: () => import('./components/sensor-widget/sensor-widget.component').then(m => m.SensorWidgetComponent),
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];