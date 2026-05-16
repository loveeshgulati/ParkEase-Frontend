import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.services';
import { ManagerDto, PendingManagerDto } from '../../../core/models';

@Component({
  selector: 'app-manage-managers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Manage Managers</h1>
    </div>

    <!-- Pending Approvals -->
    <div class="card mb-3" *ngIf="pending.length > 0">
      <div class="card-header">
        <h3>⏳ Pending Approvals ({{ pending.length }})</h3>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let m of pending">
              <td>{{ m.fullName }}</td>
              <td>{{ m.email }}</td>
              <td>{{ m.phone }}</td>
              <td>{{ m.registeredAt | date:'short' }}</td>
              <td>
                <button class="btn btn-sm btn-success mr-1" (click)="approve(m.userId)">Approve</button>
                <button class="btn btn-sm btn-danger" (click)="openReject(m.userId)">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- All Managers -->
    <div class="card">
      <div class="card-header"><h3>All Managers</h3></div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Approved</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let m of managers">
              <td>{{ m.fullName }}</td>
              <td>{{ m.email }}</td>
              <td><span class="badge" [class]="getBadgeClass(m.status)">{{ m.status }}</span></td>
              <td>{{ m.approvedAt | date:'shortDate' }}</td>
              <td>
                <button class="btn btn-sm btn-warning mr-1" *ngIf="m.status === 'ACTIVE'" (click)="suspend(m.userId)">Suspend</button>
                <button class="btn btn-sm btn-success mr-1" *ngIf="m.status === 'SUSPENDED'" (click)="reactivate(m.userId)">Reactivate</button>
                <button class="btn btn-sm btn-danger" (click)="delete(m.userId)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal-overlay" *ngIf="showRejectModal" (click)="showRejectModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Reject Manager</h3>
        <div class="form-group">
          <label>Reason</label>
          <textarea [(ngModel)]="rejectReason" class="form-control" rows="3" placeholder="Reason for rejection"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-danger" (click)="confirmReject()">Reject</button>
          <button class="btn btn-outline" (click)="showRejectModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
  `
})
export class ManageManagersComponent implements OnInit {
  pending: PendingManagerDto[] = [];
  managers: ManagerDto[] = [];
  showRejectModal = false;
  rejectReason = '';
  selectedId = 0;
  msg = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() { this.load(); }

  load() {
    this.adminService.getPendingManagers().subscribe(r => { if (r.success) this.pending = r.data; });
    this.adminService.getAllManagers().subscribe(r => { if (r.success) this.managers = r.data; });
  }

  approve(id: number) {
    this.adminService.approveManager(id).subscribe(r => { if (r.success) { this.msg = 'Manager approved!'; this.load(); } });
  }

  openReject(id: number) { this.selectedId = id; this.rejectReason = ''; this.showRejectModal = true; }

  confirmReject() {
    this.adminService.rejectManager(this.selectedId, this.rejectReason).subscribe(r => {
      if (r.success) { this.msg = 'Manager rejected'; this.showRejectModal = false; this.load(); }
    });
  }

  suspend(id: number) {
    const reason = prompt('Reason for suspension:') || 'Suspended by admin';
    this.adminService.suspendManager(id, reason).subscribe(r => { if (r.success) { this.msg = 'Manager suspended'; this.load(); } });
  }

  reactivate(id: number) {
    this.adminService.reactivateManager(id).subscribe(r => { if (r.success) { this.msg = 'Manager reactivated'; this.load(); } });
  }

  delete(id: number) {
    if (confirm('Permanently delete this manager?')) {
      this.adminService.deleteManager(id).subscribe(r => { if (r.success) { this.msg = 'Manager deleted'; this.load(); } });
    }
  }

  getBadgeClass(status: string) {
    return { 'badge-success': status === 'ACTIVE', 'badge-warning': status === 'PENDING_APPROVAL', 'badge-danger': status === 'SUSPENDED' || status === 'REJECTED' };
  }
}
