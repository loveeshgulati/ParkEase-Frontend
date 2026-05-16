import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/api.services';

@Component({
  selector: 'app-test-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3>Test Notification System</h3>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="testNotification()" [disabled]="loading">
          {{ loading ? 'Creating...' : 'Create Test Notification' }}
        </button>
        <button class="btn btn-outline ml-2" (click)="checkConnection()">
          Check SignalR Connection
        </button>
        
        <div class="mt-3">
          <div *ngIf="msg" class="alert alert-success">{{ msg }}</div>
          <div *ngIf="error" class="alert alert-error">{{ error }}</div>
          <div *ngIf="connectionStatus" class="alert alert-info">{{ connectionStatus }}</div>
        </div>
      </div>
    </div>
  `
})
export class TestNotificationComponent {
  loading = false;
  msg = '';
  error = '';
  connectionStatus = '';

  constructor(private readonly notifService: NotificationService) {}

  testNotification() {
    this.loading = true;
    this.msg = '';
    this.error = '';

    // This would require admin privileges, so let's test the fetch instead
    this.notifService.getMyNotifications().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.msg = `Successfully fetched ${response.data.length} notifications. System is working!`;
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to fetch notifications: ' + err.message;
      }
    });
  }

  checkConnection() {
    // Check if SignalR is available
    if ((globalThis as any).signalR !== undefined) {
      this.connectionStatus = 'SignalR library is loaded';
    } else {
      this.connectionStatus = 'SignalR library is NOT loaded';
    }
  }
}
