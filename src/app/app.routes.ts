import { Routes } from '@angular/router';
import { authGuard, adminGuard, managerGuard, driverGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // Admin
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'admin/managers', canActivate: [adminGuard], loadComponent: () => import('./features/admin/manage-managers/manage-managers.component').then(m => m.ManageManagersComponent) },
  { path: 'admin/drivers', canActivate: [adminGuard], loadComponent: () => import('./features/admin/manage-drivers/manage-drivers.component').then(m => m.ManageDriversComponent) },
  { path: 'admin/lots', canActivate: [adminGuard], loadComponent: () => import('./features/admin/manage-lots/manage-lots.component').then(m => m.ManageLotsComponent) },
  { path: 'admin/bookings', canActivate: [adminGuard], loadComponent: () => import('./features/admin/manage-bookings/manage-bookings.component').then(m => m.ManageBookingsComponent) },
  { path: 'admin/notifications', canActivate: [adminGuard], loadComponent: () => import('./features/driver/my-notifications/my-notifications.component').then(m => m.MyNotificationsComponent) },

  // Manager
  { path: 'manager', canActivate: [managerGuard], loadComponent: () => import('./features/manager/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent) },
  { path: 'manager/lots', canActivate: [managerGuard], loadComponent: () => import('./features/manager/my-lots/my-lots.component').then(m => m.MyLotsComponent) },
  { path: 'manager/lots/:id/spots', canActivate: [managerGuard], loadComponent: () => import('./features/manager/manage-spots/manage-spots.component').then(m => m.ManageSpotsComponent) },
  { path: 'manager/bookings', canActivate: [managerGuard], loadComponent: () => import('./features/manager/lot-bookings/lot-bookings.component').then(m => m.LotBookingsComponent) },
  { path: 'manager/notifications', canActivate: [managerGuard], loadComponent: () => import('./features/driver/my-notifications/my-notifications.component').then(m => m.MyNotificationsComponent) },

  // Driver
  { path: 'driver', canActivate: [driverGuard], loadComponent: () => import('./features/driver/driver-dashboard/driver-dashboard.component').then(m => m.DriverDashboardComponent) },
  { path: 'driver/search', canActivate: [driverGuard], loadComponent: () => import('./features/driver/search-lots/search-lots.component').then(m => m.SearchLotsComponent) },
  { path: 'driver/lots/:id', canActivate: [driverGuard], loadComponent: () => import('./features/driver/lot-detail/lot-detail.component').then(m => m.LotDetailComponent) },
  { path: 'driver/vehicles', canActivate: [driverGuard], loadComponent: () => import('./features/driver/my-vehicles/my-vehicles.component').then(m => m.MyVehiclesComponent) },
  { path: 'driver/bookings', canActivate: [driverGuard], loadComponent: () => import('./features/driver/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) },
  { path: 'driver/payments', canActivate: [driverGuard], loadComponent: () => import('./features/driver/my-payments/my-payments.component').then(m => m.MyPaymentsComponent) },
  { path: 'driver/notifications', canActivate: [driverGuard], loadComponent: () => import('./features/driver/my-notifications/my-notifications.component').then(m => m.MyNotificationsComponent) },

  { path: '**', redirectTo: 'login' }
];
