import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/api.services';
import { Vehicle } from '../../../core/models';

@Component({
  selector: 'app-my-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>My Vehicles 🚗</h1>
      <button class="btn btn-primary" (click)="showForm = !showForm">+ Add Vehicle</button>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Add Vehicle Form -->
    <div class="card mb-3" *ngIf="showForm">
      <div class="card-header"><h3>Register New Vehicle</h3></div>
      <form (ngSubmit)="addVehicle()">
        <div class="form-row">
          <div class="form-group">
            <label>License Plate</label>
            <input type="text" [(ngModel)]="form.licensePlate" name="licensePlate"
              class="form-control" placeholder="MH12AB1234" required />
          </div>
          <div class="form-group">
            <label>Vehicle Type</label>
            <select [(ngModel)]="form.vehicleType" name="vehicleType" class="form-control">
              <option value="2W">2-Wheeler</option>
              <option value="4W">4-Wheeler</option>
              <option value="HEAVY">Heavy</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Make</label>
            <input type="text" [(ngModel)]="form.make" name="make"
              class="form-control" placeholder="Toyota" required />
          </div>
          <div class="form-group">
            <label>Model</label>
            <input type="text" [(ngModel)]="form.model" name="model"
              class="form-control" placeholder="Corolla" required />
          </div>
          <div class="form-group">
            <label>Color</label>
            <input type="text" [(ngModel)]="form.color" name="color"
              class="form-control" placeholder="White" required />
          </div>
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" [(ngModel)]="form.isEV" name="isEV" />
            Electric Vehicle (EV)
          </label>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Saving...' : 'Register Vehicle' }}
          </button>
          <button type="button" class="btn btn-outline" (click)="showForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Vehicles Grid -->
    <div class="vehicles-grid" *ngIf="vehicles.length > 0">
      <div *ngFor="let v of vehicles" class="vehicle-card">
        <div class="vehicle-icon">{{ getVehicleIcon(v.vehicleType) }}</div>
        <div class="vehicle-info">
          <h4>{{ v.licensePlate }}</h4>
          <p>{{ v.make }} {{ v.model }}</p>
          <p class="text-muted">{{ v.color }} · {{ v.vehicleType }}</p>
          <span *ngIf="v.isEV" class="badge badge-success">⚡ EV</span>
        </div>
        <div class="vehicle-actions">
          <button class="btn btn-sm btn-danger" (click)="deleteVehicle(v.vehicleId)">Delete</button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="vehicles.length === 0 && !showForm">
      <p>No vehicles registered yet.</p>
      <button class="btn btn-primary" (click)="showForm = true">Add Your First Vehicle</button>
    </div>
  `
})
export class MyVehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  showForm = false; loading = false; msg = ''; error = '';
  form = { licensePlate: '', make: '', model: '', color: '', vehicleType: '4W', isEV: false };

  constructor(private vehicleService: VehicleService) {}

  ngOnInit() { this.load(); }

  load() {
    this.vehicleService.getMyVehicles().subscribe(r => { if (r.success) this.vehicles = r.data; });
  }

  addVehicle() {
    this.loading = true; this.error = '';
    this.vehicleService.registerVehicle(this.form).subscribe({
      next: r => {
        this.loading = false;
        if (r.success) {
          this.msg = 'Vehicle registered!';
          this.showForm = false;
          this.form = { licensePlate: '', make: '', model: '', color: '', vehicleType: '4W', isEV: false };
          this.load();
        } else this.error = r.message;
      },
      error: err => { this.loading = false; this.error = err.error?.message || 'Failed to register vehicle'; }
    });
  }

  deleteVehicle(id: number) {
    if (confirm('Remove this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe(r => {
        if (r.success) { this.msg = 'Vehicle removed'; this.load(); }
      });
    }
  }

  getVehicleIcon(type: string): string {
    return type === '2W' ? '🏍️' : type === 'HEAVY' ? '🚛' : '🚗';
  }
}
