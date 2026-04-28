import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParkingLotService, SpotService, BookingService, VehicleService } from '../../../core/services/api.services';
import { ParkingLot, Spot, Vehicle } from '../../../core/models';

@Component({
  selector: 'app-lot-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="lot" class="page-header">
      <h1>{{ lot.name }}</h1>
      <p>📍 {{ lot.address }}, {{ lot.city }}</p>
      <span class="badge badge-lg" [class]="lot.isOpen ? 'badge-success' : 'badge-danger'">
        {{ lot.isOpen ? '🟢 Open' : '🔴 Closed' }}
      </span>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <div class="two-col" *ngIf="lot">
      <!-- Left: Lot Info -->
      <div>
        <div class="card mb-3">
          <div class="card-header"><h3>Lot Details</h3></div>
          <div class="info-list">
            <div class="info-row"><span>🕐 Hours</span><span>{{ lot.openTime }} - {{ lot.closeTime }}</span></div>
            <div class="info-row"><span>🅿️ Available</span><span>{{ lot.availableSpots }}/{{ lot.totalSpots }}</span></div>
          </div>
        </div>

        <!-- Spot Filters -->
        <div class="card mb-3">
          <div class="card-header"><h3>Available Spots</h3></div>
          <div class="form-row mb-2">
            <select [(ngModel)]="filterVehicleType" class="form-control" (change)="filterSpots()">
              <option value="">All Vehicle Types</option>
              <option value="2W">2-Wheeler</option>
              <option value="4W">4-Wheeler</option>
              <option value="HEAVY">Heavy</option>
            </select>
            <select [(ngModel)]="filterSpotType" class="form-control" (change)="filterSpots()">
              <option value="">All Spot Types</option>
              <option value="COMPACT">Compact</option>
              <option value="STANDARD">Standard</option>
              <option value="LARGE">Large</option>
              <option value="MOTORBIKE">Motorbike</option>
              <option value="EV">EV</option>
            </select>
          </div>

          <div class="spots-grid-sm">
            <div *ngFor="let spot of filteredSpots" class="spot-card-sm"
              [class.spot-available]="spot.status === 'AVAILABLE'"
              [class.spot-taken]="spot.status !== 'AVAILABLE'"
              [class.spot-selected]="selectedSpot?.spotId === spot.spotId"
              (click)="selectSpot(spot)">
              <strong>{{ spot.spotNumber }}</strong>
              <div>{{ spot.spotType }}</div>
              <div>₹{{ spot.pricePerHour }}/hr</div>
              <div *ngIf="spot.isEVCharging">⚡</div>
              <div *ngIf="spot.isHandicapped">♿</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Booking Form -->
      <div>
        <div class="card" *ngIf="selectedSpot">
          <div class="card-header"><h3>Book Spot {{ selectedSpot.spotNumber }}</h3></div>
          <form (ngSubmit)="createBooking()">
            <div class="form-group">
              <label>My Vehicle</label>
              <select [(ngModel)]="bookingForm.vehiclePlate" name="vehiclePlate" class="form-control" required>
                <option value="">Select vehicle</option>
                <option *ngFor="let v of myVehicles" [value]="v.licensePlate">
                  {{ v.licensePlate }} — {{ v.make }} {{ v.model }} ({{ v.vehicleType }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Vehicle Type</label>
              <select [(ngModel)]="bookingForm.vehicleType" name="vehicleType" class="form-control" required>
                <option value="2W">2-Wheeler</option>
                <option value="4W">4-Wheeler</option>
                <option value="HEAVY">Heavy</option>
              </select>
            </div>
            <div class="form-group">
              <label>Booking Type</label>
              <select [(ngModel)]="bookingForm.bookingType" name="bookingType" class="form-control">
                <option value="PRE_BOOKING">Pre-Booking (Advance)</option>
                <option value="WALK_IN">Walk-in (Now)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Start Time</label>
              <input type="datetime-local" [(ngModel)]="bookingForm.startTime" name="startTime" class="form-control" required />
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="datetime-local" [(ngModel)]="bookingForm.endTime" name="endTime" class="form-control" required />
            </div>

            <div class="fare-preview" *ngIf="bookingForm.startTime && bookingForm.endTime">
              <strong>Estimated Fare:</strong> ₹{{ estimatedFare | number:'1.2-2' }}
              <small>({{ estimatedHours | number:'1.1-1' }} hrs × ₹{{ selectedSpot.pricePerHour }}/hr)</small>
            </div>

            <button type="submit" class="btn btn-primary btn-block mt-2" [disabled]="loading || !lot.isOpen">
              {{ loading ? 'Booking...' : (lot.isOpen ? 'Confirm Booking' : 'Lot is Closed') }}
            </button>
          </form>
        </div>

        <div class="card" *ngIf="!selectedSpot">
          <p class="text-center mt-2">👈 Select a spot from the list to book</p>
        </div>
      </div>
    </div>
  `
})
export class LotDetailComponent implements OnInit {
  lot: ParkingLot | null = null;
  spots: Spot[] = [];
  filteredSpots: Spot[] = [];
  myVehicles: Vehicle[] = [];
  selectedSpot: Spot | null = null;
  filterVehicleType = ''; filterSpotType = '';
  loading = false; msg = ''; error = '';

  bookingForm = { lotId: 0, spotId: 0, vehiclePlate: '', vehicleType: '4W', bookingType: 'PRE_BOOKING', startTime: '', endTime: '' };

  get estimatedHours(): number {
    if (!this.bookingForm.startTime || !this.bookingForm.endTime) return 0;
    const diff = (new Date(this.bookingForm.endTime).getTime() - new Date(this.bookingForm.startTime).getTime()) / 3600000;
    return Math.max(diff, 1);
  }

  get estimatedFare(): number {
    return this.selectedSpot ? Math.round(this.estimatedHours * this.selectedSpot.pricePerHour * 100) / 100 : 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: ParkingLotService,
    private spotService: SpotService,
    private bookingService: BookingService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.bookingForm.lotId = id;
    this.lotService.getLotById(id).subscribe(r => { if (r.success) this.lot = r.data; });
    this.spotService.getAvailableSpots(id).subscribe(r => { if (r.success) { this.spots = r.data; this.filteredSpots = r.data; } });
    this.vehicleService.getMyVehicles().subscribe(r => { if (r.success) this.myVehicles = r.data; });
  }

  filterSpots() {
    this.filteredSpots = this.spots.filter(s => {
      const matchV = !this.filterVehicleType || s.vehicleType === this.filterVehicleType;
      const matchS = !this.filterSpotType || s.spotType === this.filterSpotType;
      return matchV && matchS;
    });
  }

  selectSpot(spot: Spot) {
    if (spot.status !== 'AVAILABLE') return;
    this.selectedSpot = spot;
    this.bookingForm.spotId = spot.spotId;
  }

  createBooking() {
    if (!this.bookingForm.vehiclePlate) { this.error = 'Please select a vehicle'; return; }
    this.loading = true; this.error = '';
    this.bookingService.createBooking(this.bookingForm).subscribe({
      next: r => {
        this.loading = false;
        if (r.success) { this.msg = 'Booking confirmed! 🎉'; setTimeout(() => this.router.navigate(['/driver/bookings']), 1500); }
        else this.error = r.message;
      },
      error: err => { this.loading = false; this.error = err.error?.message || 'Booking failed'; }
    });
  }
}
