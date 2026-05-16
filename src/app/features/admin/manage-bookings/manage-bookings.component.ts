import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/api.services';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header"><h1>All Bookings</h1></div>
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>ID</th><th>User</th><th>Lot</th><th>Spot</th><th>Plate</th><th>Type</th><th>Status</th><th>Amount</th><th>Created</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bookings">
              <td>#{{ b.bookingId }}</td>
              <td>{{ b.userId }}</td>
              <td>{{ b.lotId }}</td>
              <td>{{ b.spotId }}</td>
              <td>{{ b.vehiclePlate }}</td>
              <td>{{ b.bookingType }}</td>
              <td><span class="badge" [class]="getStatusClass(b.status)">{{ b.status }}</span></td>
              <td>₹{{ b.totalAmount }}</td>
              <td>{{ b.createdAt | date:'short' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManageBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  constructor(private readonly bookingService: BookingService) {}
  ngOnInit() { this.bookingService.getAllBookings().subscribe(r => { if (r.success) this.bookings = r.data; }); }
  getStatusClass(s: string) {
    return { 'badge-success': s === 'COMPLETED', 'badge-primary': s === 'ACTIVE', 'badge-warning': s === 'RESERVED', 'badge-danger': s === 'CANCELLED' || s === 'EXPIRED' };
  }
}
