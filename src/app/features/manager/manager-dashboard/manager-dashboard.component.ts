import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ParkingLotService, BookingService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { ParkingLot } from '../../../core/models';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Manager Dashboard</h1>
      <p>Welcome, {{ auth.currentUser?.fullName }}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ myLots.length }}</div>
        <div class="stat-label">My Lots</div>
      </div>
      <div class="stat-card">
        <div class="stat-number text-success">{{ approvedLots }}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-card">
        <div class="stat-number text-warning">{{ pendingLots }}</div>
        <div class="stat-label">Pending Approval</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ openLots }}</div>
        <div class="stat-label">Open Now</div>
      </div>
    </div>

    <div class="action-grid mt-3">
      <a routerLink="/manager/lots" class="action-card">
        <span class="action-icon">🅿️</span>
        <span>My Parking Lots</span>
      </a>
      <a routerLink="/manager/bookings" class="action-card">
        <span class="action-icon">📋</span>
        <span>View Bookings</span>
      </a>
    </div>

    <div class="card mt-3" *ngIf="myLots.length > 0">
      <div class="card-header"><h3>My Lots</h3></div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>City</th><th>Status</th><th>Open</th><th>Spots</th></tr></thead>
          <tbody>
            <tr *ngFor="let lot of myLots">
              <td>{{ lot.name }}</td>
              <td>{{ lot.city }}</td>
              <td><span class="badge" [class]="lot.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'">{{ lot.approvalStatus }}</span></td>
              <td><span class="badge" [class]="lot.isOpen ? 'badge-success' : 'badge-danger'">{{ lot.isOpen ? 'Open' : 'Closed' }}</span></td>
              <td>{{ lot.availableSpots }}/{{ lot.totalSpots }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManagerDashboardComponent implements OnInit {
  myLots: ParkingLot[] = [];
  approvedLots = 0; pendingLots = 0; openLots = 0;

  constructor(public auth: AuthService, private lotService: ParkingLotService) {}

  ngOnInit() {
    this.lotService.getMyLots().subscribe(r => {
      if (r.success) {
        this.myLots = r.data;
        this.approvedLots = r.data.filter(l => l.approvalStatus === 'APPROVED').length;
        this.pendingLots = r.data.filter(l => l.approvalStatus === 'PENDING_APPROVAL').length;
        this.openLots = r.data.filter(l => l.isOpen).length;
      }
    });
  }
}
