import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService, VehicleService, NotificationService } from '../../../core/services/api.services';
import { SignalrService } from '../../../core/services/signalr.service';
import { Booking, Notification } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Welcome, {{ auth.currentUser?.fullName }} 👋</h1>
      <p>Find and book parking spots easily</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ totalBookings }}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
      <div class="stat-card">
        <div class="stat-number text-success">{{ activeBookings }}</div>
        <div class="stat-label">Active Now</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ myVehicles }}</div>
        <div class="stat-label">My Vehicles</div>
      </div>
      <div class="stat-card">
        <div class="stat-number text-warning">{{ unreadNotifications }}</div>
        <div class="stat-label">Notifications</div>
      </div>
    </div>

    <div class="action-grid mt-3">
      <a routerLink="/driver/search" class="action-card action-card-primary">
        <span class="action-icon">🔍</span>
        <span>Find Parking</span>
      </a>
      <a routerLink="/driver/bookings" class="action-card">
        <span class="action-icon">📋</span>
        <span>My Bookings</span>
      </a>
      <a routerLink="/driver/vehicles" class="action-card">
        <span class="action-icon">🚗</span>
        <span>My Vehicles</span>
      </a>
      <a routerLink="/driver/payments" class="action-card">
        <span class="action-icon">💳</span>
        <span>My Payments</span>
      </a>
    </div>

    <!-- Active Booking Alert -->
    <div class="card mt-3" *ngIf="activeBookingData">
      <div class="card-header alert-active">
        <h3>🟢 You have an active booking!</h3>
      </div>
      <div class="active-booking-info">
        <p><strong>Booking #{{ activeBookingData.bookingId }}</strong></p>
        <p>Spot: {{ activeBookingData.spotId }} | Plate: {{ activeBookingData.vehiclePlate }}</p>
        <p>Until: {{ activeBookingData.endTime | date:'medium' }}</p>
        <div class="modal-actions">
          <button class="btn btn-success" (click)="checkIn(activeBookingData.bookingId)" *ngIf="activeBookingData.status === 'RESERVED'">Check In</button>
          <button class="btn btn-primary" (click)="checkOut(activeBookingData.bookingId)" *ngIf="activeBookingData.status === 'ACTIVE'">Check Out</button>
        </div>
      </div>
    </div>

    <!-- Recent Notifications -->
    <div class="card mt-3" *ngIf="notifications.length > 0">
      <div class="card-header"><h3>🔔 Recent Notifications</h3></div>
      <div class="notification-list">
        <div *ngFor="let n of notifications.slice(0,5)" class="notification-item" [class.unread]="!n.isRead">
          <strong>{{ n.title }}</strong>
          <p>{{ n.message }}</p>
          <small>{{ n.sentAt | date:'short' }}</small>
        </div>
      </div>
    </div>
  `
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  totalBookings = 0;
  activeBookings = 0;
  myVehicles = 0;
  unreadNotifications = 0;
  activeBookingData: Booking | null = null;
  notifications: Notification[] = [];
  private notificationSubscription?: Subscription;

  constructor(
    public auth: AuthService,
    private bookingService: BookingService,
    private vehicleService: VehicleService,
    private notifService: NotificationService,
    private signalrService: SignalrService
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSignalR();
  }

  ngOnDestroy() {
    this.cleanupSignalR();
  }

  private loadData() {
    this.bookingService.getMyBookings().subscribe(r => {
      if (r.success) {
        this.totalBookings = r.data.length;
        this.activeBookings = r.data.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED').length;
        this.activeBookingData = r.data.find(b => b.status === 'ACTIVE' || b.status === 'RESERVED') || null;
      }
    });
    this.vehicleService.getMyVehicles().subscribe(r => {
      if (r.success) this.myVehicles = r.data.length;
    });
    this.notifService.getMyNotifications().subscribe(r => {
      if (r.success) {
        this.notifications = r.data;
        this.unreadNotifications = r.data.filter(n => !n.isRead).length;
      }
    });
  }

  private setupSignalR() {
    this.signalrService.startConnection();
    
    this.notificationSubscription = this.signalrService.notification$.subscribe(notification => {
      if (notification) {
        this.notifications.unshift(notification);
        if (!notification.isRead) {
          this.unreadNotifications++;
        }
      }
    });
  }

  private cleanupSignalR() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  checkIn(id: number) {
    this.bookingService.checkIn(id).subscribe(r => { if (r.success) { this.ngOnInit(); } });
  }

  checkOut(id: number) {
    this.bookingService.checkOut(id).subscribe(r => { if (r.success) { this.ngOnInit(); } });
  }
}
