import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/api.services';
import { PaymentService } from '../../../core/services/api.services';
import { BookingService } from '../../../core/services/api.services';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Admin Dashboard</h1>
      <p>Platform overview</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ totalManagers }}</div>
        <div class="stat-label">Managers</div>
      </div>
      <div class="stat-card">
        <div class="stat-number text-warning">{{ pendingManagers }}</div>
        <div class="stat-label">Pending Approvals</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalDrivers }}</div>
        <div class="stat-label">Drivers</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalBookings }}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
    </div>

    <div class="quick-links">
      <h3>Quick Actions</h3>
      <div class="action-grid">
        <a routerLink="/admin/managers" class="action-card">
          <span class="action-icon">👤</span>
          <span>Manage Managers</span>
          <span class="badge badge-warning" *ngIf="pendingManagers > 0">{{ pendingManagers }} pending</span>
        </a>
        <a routerLink="/admin/drivers" class="action-card">
          <span class="action-icon">🚗</span>
          <span>Manage Drivers</span>
        </a>
        <a routerLink="/admin/lots" class="action-card">
          <span class="action-icon">🅿️</span>
          <span>Manage Lots</span>
        </a>
        <a routerLink="/admin/bookings" class="action-card">
          <span class="action-icon">📋</span>
          <span>All Bookings</span>
        </a>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  totalManagers = 0; pendingManagers = 0; totalDrivers = 0; totalBookings = 0;

  constructor(
    private adminService: AdminService,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.adminService.getAllManagers().subscribe(r => { if (r.success) this.totalManagers = r.data.length; });
    this.adminService.getPendingManagers().subscribe(r => { if (r.success) this.pendingManagers = r.data.length; });
    this.adminService.getAllDrivers().subscribe(r => { if (r.success) this.totalDrivers = r.data.length; });
    this.bookingService.getAllBookings().subscribe(r => { if (r.success) this.totalBookings = r.data.length; });
  }
}
