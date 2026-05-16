import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ParkingLotService } from '../../../core/services/api.services';
import { ParkingLot } from '../../../core/models';

@Component({
  selector: 'app-my-lots',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>My Parking Lots</h1>
      <button class="btn btn-primary" (click)="showForm = !showForm">+ Add Lot</button>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <!-- Add Lot Form -->
    <div class="card mb-3" *ngIf="showForm">
      <div class="card-header"><h3>Register New Lot</h3></div>
      <form (ngSubmit)="createLot()">
        <div class="form-row">
          <div class="form-group">
            <label>Lot Name</label>
            <input type="text" [(ngModel)]="form.name" name="name" class="form-control" required />
          </div>
          <div class="form-group">
            <label>City</label>
            <input type="text" [(ngModel)]="form.city" name="city" class="form-control" required />
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" [(ngModel)]="form.address" name="address" class="form-control" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Latitude</label>
            <input type="number" [(ngModel)]="form.latitude" name="latitude" class="form-control" step="any" required />
          </div>
          <div class="form-group">
            <label>Longitude</label>
            <input type="number" [(ngModel)]="form.longitude" name="longitude" class="form-control" step="any" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Open Time</label>
            <input type="time" [(ngModel)]="form.openTime" name="openTime" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Close Time</label>
            <input type="time" [(ngModel)]="form.closeTime" name="closeTime" class="form-control" required />
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading">{{ loading ? 'Saving...' : 'Submit for Approval' }}</button>
          <button type="button" class="btn btn-outline" (click)="showForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Lots Table -->
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>City</th><th>Status</th><th>Open</th><th>Spots</th><th>Hours</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let lot of lots">
              <td><strong>{{ lot.name }}</strong></td>
              <td>{{ lot.city }}</td>
              <td><span class="badge" [class]="getStatusClass(lot.approvalStatus)">{{ lot.approvalStatus }}</span></td>
              <td>
                <span class="badge" [class]="lot.isOpen ? 'badge-success' : 'badge-danger'">{{ lot.isOpen ? 'Open' : 'Closed' }}</span>
              </td>
              <td>{{ lot.availableSpots }}/{{ lot.totalSpots }}</td>
              <td>{{ lot.openTime }} - {{ lot.closeTime }}</td>
              <td>
                <a [routerLink]="['/manager/lots', lot.lotId, 'spots']" class="btn btn-sm btn-primary mr-1" *ngIf="lot.approvalStatus === 'APPROVED'">Spots</a>
                <button class="btn btn-sm btn-warning mr-1" (click)="toggle(lot.lotId)" *ngIf="lot.approvalStatus === 'APPROVED'">
                  {{ lot.isOpen ? 'Close' : 'Open' }}
                </button>
                <button class="btn btn-sm btn-danger" (click)="delete(lot.lotId)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="lots.length === 0"><td colspan="7" class="text-center">No lots yet. Add your first lot!</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MyLotsComponent implements OnInit {
  lots: ParkingLot[] = [];
  showForm = false; loading = false; msg = ''; error = '';
  form = { name: '', city: '', address: '', latitude: 0, longitude: 0, openTime: '08:00', closeTime: '22:00' };

  constructor(private readonly lotService: ParkingLotService) {}

  ngOnInit() { this.load(); }

  load() { this.lotService.getMyLots().subscribe(r => { if (r.success) this.lots = r.data; }); }

  createLot() {
    this.loading = true; this.error = '';
    this.lotService.createLot(this.form).subscribe({
      next: r => {
        this.loading = false;
        if (r.success) { this.msg = 'Lot submitted for approval!'; this.showForm = false; this.load(); }
        else this.error = r.message;
      },
      error: err => { this.loading = false; this.error = err.error?.message || 'Failed to create lot'; }
    });
  }

  toggle(id: number) { this.lotService.toggleLot(id).subscribe(r => { if (r.success) { this.msg = `Lot ${r.data.isOpen ? 'opened' : 'closed'}`; this.load(); } }); }

  delete(id: number) {
    if (confirm('Delete this lot?')) {
      this.lotService.deleteLot(id).subscribe(r => { if (r.success) { this.msg = 'Lot deleted'; this.load(); } });
    }
  }

  getStatusClass(s: string) {
    return { 'badge-success': s === 'APPROVED', 'badge-warning': s === 'PENDING_APPROVAL', 'badge-danger': s === 'REJECTED' };
  }
}
