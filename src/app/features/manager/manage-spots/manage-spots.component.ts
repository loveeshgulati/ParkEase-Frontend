import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SpotService } from '../../../core/services/api.services';
import { Spot } from '../../../core/models';

@Component({
  selector: 'app-manage-spots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Manage Spots — Lot #{{ lotId }}</h1>
      <button class="btn btn-primary" (click)="showForm = !showForm">+ Add Spot</button>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Add Spot Form -->
    <div class="card mb-3" *ngIf="showForm">
      <div class="card-header">
        <h3>Add Spots</h3>
        <div class="tab-toggle">
          <button class="btn btn-sm" [class.btn-primary]="addMode === 'single'" (click)="addMode = 'single'">Single</button>
          <button class="btn btn-sm" [class.btn-primary]="addMode === 'bulk'" (click)="addMode = 'bulk'">Bulk</button>
        </div>
      </div>

      <!-- Single Spot -->
      <form *ngIf="addMode === 'single'" (ngSubmit)="addSpot()">
        <div class="form-row">
          <div class="form-group">
            <label>Spot Number</label>
            <input type="text" [(ngModel)]="singleForm.spotNumber" name="spotNumber" class="form-control" placeholder="A-01" required />
          </div>
          <div class="form-group">
            <label>Floor</label>
            <input type="number" [(ngModel)]="singleForm.floor" name="floor" class="form-control" value="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Spot Type</label>
            <select [(ngModel)]="singleForm.spotType" name="spotType" class="form-control">
              <option value="COMPACT">Compact</option>
              <option value="STANDARD">Standard</option>
              <option value="LARGE">Large</option>
              <option value="MOTORBIKE">Motorbike</option>
              <option value="EV">EV</option>
            </select>
          </div>
          <div class="form-group">
            <label>Vehicle Type</label>
            <select [(ngModel)]="singleForm.vehicleType" name="vehicleType" class="form-control">
              <option value="2W">2-Wheeler</option>
              <option value="4W">4-Wheeler</option>
              <option value="HEAVY">Heavy</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price/Hour (₹)</label>
            <input type="number" [(ngModel)]="singleForm.pricePerHour" name="pricePerHour" class="form-control" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group checkbox-group">
            <label><input type="checkbox" [(ngModel)]="singleForm.isEVCharging" name="isEVCharging" /> EV Charging</label>
          </div>
          <div class="form-group checkbox-group">
            <label><input type="checkbox" [(ngModel)]="singleForm.isHandicapped" name="isHandicapped" /> Handicapped</label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">{{ loading ? 'Adding...' : 'Add Spot' }}</button>
          <button type="button" class="btn btn-outline" (click)="showForm = false">Cancel</button>
        </div>
      </form>

      <!-- Bulk Spots -->
      <form *ngIf="addMode === 'bulk'" (ngSubmit)="addBulkSpots()">
        <div class="form-row">
          <div class="form-group">
            <label>Prefix</label>
            <input type="text" [(ngModel)]="bulkForm.prefix" name="prefix" class="form-control" placeholder="A" required />
          </div>
          <div class="form-group">
            <label>Count</label>
            <input type="number" [(ngModel)]="bulkForm.count" name="count" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Floor</label>
            <input type="number" [(ngModel)]="bulkForm.floor" name="floor" class="form-control" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Spot Type</label>
            <select [(ngModel)]="bulkForm.spotType" name="spotType" class="form-control">
              <option value="COMPACT">Compact</option>
              <option value="STANDARD">Standard</option>
              <option value="LARGE">Large</option>
              <option value="MOTORBIKE">Motorbike</option>
              <option value="EV">EV</option>
            </select>
          </div>
          <div class="form-group">
            <label>Vehicle Type</label>
            <select [(ngModel)]="bulkForm.vehicleType" name="vehicleType" class="form-control">
              <option value="2W">2-Wheeler</option>
              <option value="4W">4-Wheeler</option>
              <option value="HEAVY">Heavy</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price/Hour (₹)</label>
            <input type="number" [(ngModel)]="bulkForm.pricePerHour" name="pricePerHour" class="form-control" required />
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">{{ loading ? 'Adding...' : 'Add Bulk Spots' }}</button>
          <button type="button" class="btn btn-outline" (click)="showForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Spots Grid -->
    <div class="spots-grid">
      <div *ngFor="let spot of spots" class="spot-card" [class]="getSpotClass(spot.status)">
        <div class="spot-number">{{ spot.spotNumber }}</div>
        <div class="spot-info">
          <span>{{ spot.spotType }}</span> | <span>{{ spot.vehicleType }}</span>
        </div>
        <div class="spot-price">₹{{ spot.pricePerHour }}/hr</div>
        <div class="spot-badges">
          <span *ngIf="spot.isEVCharging" class="badge badge-success">⚡ EV</span>
          <span *ngIf="spot.isHandicapped" class="badge badge-primary">♿</span>
        </div>
        <div class="spot-status">{{ spot.status }}</div>
        <button class="btn btn-sm btn-danger mt-1" (click)="deleteSpot(spot.spotId)">Delete</button>
      </div>
      <div *ngIf="spots.length === 0" class="empty-state">No spots yet. Add spots above.</div>
    </div>
  `
})
export class ManageSpotsComponent implements OnInit {
  lotId = 0; spots: Spot[] = [];
  showForm = false; addMode = 'single'; loading = false; msg = ''; error = '';

  singleForm = { lotId: 0, spotNumber: '', floor: 0, spotType: 'STANDARD', vehicleType: '4W', pricePerHour: 30, isHandicapped: false, isEVCharging: false };
  bulkForm = { lotId: 0, floor: 0, spotType: 'STANDARD', vehicleType: '4W', pricePerHour: 30, isHandicapped: false, isEVCharging: false, count: 10, prefix: 'A' };

  constructor(private route: ActivatedRoute, private spotService: SpotService) {}

  ngOnInit() {
    this.lotId = +this.route.snapshot.params['id'];
    this.singleForm.lotId = this.lotId;
    this.bulkForm.lotId = this.lotId;
    this.load();
  }

  load() { this.spotService.getSpotsByLot(this.lotId).subscribe(r => { if (r.success) this.spots = r.data; }); }

  addSpot() {
    this.loading = true;
    this.spotService.addSpot(this.singleForm).subscribe({
      next: r => { this.loading = false; if (r.success) { this.msg = 'Spot added!'; this.load(); } else this.error = r.message; },
      error: err => { this.loading = false; this.error = err.error?.message || 'Failed'; }
    });
  }

  addBulkSpots() {
    this.loading = true;
    this.spotService.addBulkSpots(this.bulkForm).subscribe({
      next: r => { this.loading = false; if (r.success) { this.msg = `${r.data.spotsCreated} spots created!`; this.load(); } },
      error: err => { this.loading = false; this.error = err.error?.message || 'Failed'; }
    });
  }

  deleteSpot(id: number) {
    if (confirm('Delete this spot?')) {
      this.spotService.deleteSpot(id).subscribe(r => { if (r.success) { this.msg = 'Spot deleted'; this.load(); } });
    }
  }

  getSpotClass(status: string) {
    return { 'spot-available': status === 'AVAILABLE', 'spot-reserved': status === 'RESERVED', 'spot-occupied': status === 'OCCUPIED' };
  }
}
