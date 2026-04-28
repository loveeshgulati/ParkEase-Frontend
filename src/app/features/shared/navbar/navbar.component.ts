import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/" class="logo">
          <span class="logo-text">park</span><span class="logo-accent">ease</span>
        </a>
      </div>
      <div class="nav-links" *ngIf="auth.isLoggedIn">
        <!-- Admin links -->
        <ng-container *ngIf="auth.isAdmin">
          <a routerLink="/admin" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/managers" routerLinkActive="active">Managers</a>
          <a routerLink="/admin/drivers" routerLinkActive="active">Drivers</a>
          <a routerLink="/admin/lots" routerLinkActive="active">Lots</a>
          <a routerLink="/admin/bookings" routerLinkActive="active">Bookings</a>
          <a routerLink="/admin/notifications" routerLinkActive="active">Notifications</a>
        </ng-container>

        <!-- Manager links -->
        <ng-container *ngIf="auth.isManager">
          <a routerLink="/manager" routerLinkActive="active">Dashboard</a>
          <a routerLink="/manager/lots" routerLinkActive="active">My Lots</a>
          <a routerLink="/manager/bookings" routerLinkActive="active">Bookings</a>
          <a routerLink="/manager/notifications" routerLinkActive="active">Notifications</a>
        </ng-container>

        <!-- Driver links -->
        <ng-container *ngIf="auth.isDriver">
          <a routerLink="/driver" routerLinkActive="active">Dashboard</a>
          <a routerLink="/driver/search" routerLinkActive="active">Find Parking</a>
          <a routerLink="/driver/vehicles" routerLinkActive="active">Vehicles</a>
          <a routerLink="/driver/bookings" routerLinkActive="active">Bookings</a>
          <a routerLink="/driver/payments" routerLinkActive="active">Payments</a>
          <a routerLink="/driver/notifications" routerLinkActive="active">Notifications</a>
        </ng-container>

        <span class="nav-user">{{ auth.currentUser?.fullName }}</span>
        <button class="btn btn-sm btn-outline" (click)="auth.logout()">Logout</button>
      </div>
      <div class="nav-links" *ngIf="!auth.isLoggedIn">
        <a routerLink="/login" routerLinkActive="active">Login</a>
        <a routerLink="/register" routerLinkActive="active">Register</a>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
