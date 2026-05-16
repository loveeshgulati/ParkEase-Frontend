import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParkingLotService } from '../../../core/services/api.services';
import { ParkingLot } from '../../../core/models';

@Component({
  selector: 'app-manage-lots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Manage Parking Lots</h1></div>
    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>

    <!-- Pending Lots -->
    <div class="card mb-3" *ngIf="pendingLots.length > 0">
      <div class="card-header"><h3>⏳ Pending Approval ({{ pendingLots.length }})</h3></div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>City</th><th>Address</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let lot of pendingLots">
              <td>{{ lot.name }}</td>
              <td>{{ lot.city }}</td>
              <td>{{ lot.address }}</td>
              <td>
                <button class="btn btn-sm btn-success mr-1" (click)="approve(lot.lotId)">Approve</button>
                <button class="btn btn-sm btn-danger" (click)="openReject(lot.lotId)">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- All Lots -->
    <div class="card">
      <div class="card-header"><h3>All Lots ({{ allLots.length }})</h3></div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>City</th><th>Status</th><th>Open</th><th>Spots</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let lot of allLots">
              <td>{{ lot.name }}</td>
              <td>{{ lot.city }}</td>
              <td><span class="badge" [class]="getStatusClass(lot.approvalStatus)">{{ lot.approvalStatus }}</span></td>
              <td><span class="badge" [class]="lot.isOpen ? 'badge-success' : 'badge-danger'">{{ lot.isOpen ? 'Open' : 'Closed' }}</span></td>
              <td>{{ lot.availableSpots }}/{{ lot.totalSpots }}</td>
              <td>
                <button class="btn btn-sm btn-danger" (click)="delete(lot.lotId)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal-overlay" *ngIf="showRejectModal" (click)="showRejectModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Reject Lot</h3>
        <div class="form-group">
          <label>Reason</label>
          <textarea [(ngModel)]="rejectReason" class="form-control" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-danger" (click)="confirmReject()">Reject</button>
          <button class="btn btn-outline" (click)="showRejectModal = false">Cancel</button>
        </div>
      </div>
    </div>
  `
})
export class ManageLotsComponent implements OnInit {
  pendingLots: ParkingLot[] = [];
  allLots: ParkingLot[] = [];
  showRejectModal = false;
  rejectReason = '';
  selectedId = 0;
  msg = '';

  constructor(private readonly lotService: ParkingLotService) {}

  ngOnInit() { this.load(); }

  load() {
    this.lotService.getPendingLots().subscribe(r => { if (r.success) this.pendingLots = r.data; });
    this.lotService.getAllLots().subscribe(r => { if (r.success) this.allLots = r.data; });
  }

  approve(id: number) {
    this.lotService.approveLot(id).subscribe(r => { if (r.success) { this.msg = 'Lot approved!'; this.load(); } });
  }

  openReject(id: number) { this.selectedId = id; this.rejectReason = ''; this.showRejectModal = true; }

  confirmReject() {
    this.lotService.rejectLot(this.selectedId, this.rejectReason).subscribe(r => {
      if (r.success) { this.msg = 'Lot rejected'; this.showRejectModal = false; this.load(); }
    });
  }

  delete(id: number) {
    if (confirm('Delete this lot?')) {
      this.lotService.deleteLot(id).subscribe(r => { if (r.success) { this.msg = 'Lot deleted'; this.load(); } });
    }
  }

  getStatusClass(status: string) {
    return { 'badge-success': status === 'APPROVED', 'badge-warning': status === 'PENDING_APPROVAL', 'badge-danger': status === 'REJECTED' };
  }
}
