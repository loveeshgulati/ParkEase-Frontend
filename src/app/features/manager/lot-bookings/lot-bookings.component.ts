import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingLotService, BookingService } from '../../../core/services/api.services';
import { ParkingLot, Booking } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-lot-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header"><h1>Lot Bookings</h1></div>
    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>

    <!-- Lot Selector -->
    <div class="card mb-3">
      <div class="form-group">
        <label>Select Lot</label>
        <select class="form-control" (change)="selectLot($event)">
          <option value="">-- Select a lot --</option>
          <option *ngFor="let lot of myLots" [value]="lot.lotId">{{ lot.name }}</option>
        </select>
      </div>
    </div>

    <div *ngIf="selectedLotId">
      <!-- Active Check-ins -->
      <div class="card mb-3">
        <div class="card-header"><h3>🔴 Active Check-ins ({{ activeBookings.length }})</h3></div>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Booking ID</th><th>Plate</th><th>Spot</th><th>Check In</th><th>End Time</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of activeBookings">
                <td>#{{ b.bookingId }}</td>
                <td>{{ b.vehiclePlate }}</td>
                <td>{{ b.spotId }}</td>
                <td>{{ b.checkInTime | date:'short' }}</td>
                <td>{{ b.endTime | date:'short' }}</td>
                <td>
                  <button class="btn btn-sm btn-warning" (click)="forceCheckout(b.bookingId)">Force Checkout</button>
                </td>
              </tr>
              <tr *ngIf="activeBookings.length === 0"><td colspan="6" class="text-center">No active check-ins</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- All Bookings -->
      <div class="card">
        <div class="card-header"><h3>All Bookings ({{ allBookings.length }})</h3></div>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>ID</th><th>Plate</th><th>Type</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of allBookings">
                <td>#{{ b.bookingId }}</td>
                <td>{{ b.vehiclePlate }}</td>
                <td>{{ b.bookingType }}</td>
                <td><span class="badge" [class]="getStatusClass(b.status)">{{ b.status }}</span></td>
                <td>₹{{ b.totalAmount }}</td>
                <td>{{ b.createdAt | date:'short' }}</td>
              </tr>
              <tr *ngIf="allBookings.length === 0"><td colspan="6" class="text-center">No bookings yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LotBookingsComponent implements OnInit {
  myLots: ParkingLot[] = [];
  allBookings: Booking[] = [];
  activeBookings: Booking[] = [];
  selectedLotId = 0;
  msg = '';

  constructor(
    private lotService: ParkingLotService,
    private bookingService: BookingService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.lotService.getMyLots().subscribe(r => { if (r.success) this.myLots = r.data; });
  }

  selectLot(event: Event) {
    this.selectedLotId = +(event.target as HTMLSelectElement).value;
    if (!this.selectedLotId) return;
    this.bookingService.getBookingsByLot(this.selectedLotId).subscribe(r => { if (r.success) this.allBookings = r.data; });
    this.bookingService.getActiveBookingsByLot(this.selectedLotId).subscribe(r => { if (r.success) this.activeBookings = r.data; });
  }

  forceCheckout(bookingId: number) {
    if (confirm('Force checkout this vehicle?')) {
      this.bookingService.forceCheckout(bookingId).subscribe(r => {
        if (r.success) { this.msg = 'Force checkout successful'; this.selectLot({ target: { value: this.selectedLotId } } as any); }
      });
    }
  }

  getStatusClass(s: string) {
    return { 'badge-success': s === 'COMPLETED', 'badge-primary': s === 'ACTIVE', 'badge-warning': s === 'RESERVED', 'badge-danger': s === 'CANCELLED' || s === 'EXPIRED' };
  }
}
