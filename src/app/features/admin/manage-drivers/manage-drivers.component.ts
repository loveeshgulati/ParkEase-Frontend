import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/api.services';
import { DriverDto } from '../../../core/models';

@Component({
  selector: 'app-manage-drivers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header"><h1>Manage Drivers</h1></div>
    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of drivers">
              <td>{{ d.fullName }}</td>
              <td>{{ d.email }}</td>
              <td>{{ d.phone }}</td>
              <td><span class="badge" [class]="d.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">{{ d.status }}</span></td>
              <td>{{ d.createdAt | date:'shortDate' }}</td>
              <td>
                <button class="btn btn-sm btn-warning mr-1" *ngIf="d.status === 'ACTIVE'" (click)="suspend(d.userId)">Suspend</button>
                <button class="btn btn-sm btn-success mr-1" *ngIf="d.status !== 'ACTIVE'" (click)="reactivate(d.userId)">Reactivate</button>
                <button class="btn btn-sm btn-danger" (click)="delete(d.userId)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManageDriversComponent implements OnInit {
  drivers: DriverDto[] = []; msg = '';
  constructor(private adminService: AdminService) {}
  ngOnInit() { this.load(); }
  load() { this.adminService.getAllDrivers().subscribe(r => { if (r.success) this.drivers = r.data; }); }
  suspend(id: number) { const reason = prompt('Reason:') || 'Suspended'; this.adminService.suspendDriver(id, reason).subscribe(() => { this.msg = 'Driver suspended'; this.load(); }); }
  reactivate(id: number) { this.adminService.reactivateDriver(id).subscribe(() => { this.msg = 'Driver reactivated'; this.load(); }); }
  delete(id: number) { if (confirm('Delete this driver?')) this.adminService.deleteDriver(id).subscribe(() => { this.msg = 'Driver deleted'; this.load(); }); }
}
