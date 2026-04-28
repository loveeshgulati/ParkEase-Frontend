import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/api.services';
import { SignalrService } from '../../../core/services/signalr.service';
import { Notification } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>🔔 Notifications</h1>
    </div>

    <div class="alert alert-success" *ngIf="msg">{{ msg }}</div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <div class="notification-filters mb-3">
      <button class="btn btn-outline" [class.active]="filter === 'all'" (click)="setFilter('all')">
        All ({{ notifications.length }})
      </button>
      <button class="btn btn-outline" [class.active]="filter === 'unread'" (click)="setFilter('unread')">
        Unread ({{ unreadCount }})
      </button>
    </div>

    <div class="notification-list">
      <div *ngIf="loading" class="text-center py-4">
        <div class="spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <div *ngIf="!loading && filteredNotifications.length === 0" class="text-center py-4">
        <p class="text-muted">No notifications found</p>
      </div>

      <div 
        *ngFor="let notification of filteredNotifications" 
        class="notification-card"
        [class.unread]="!notification.isRead"
        [class]="getNotificationClass(notification.type)">
        <div class="notification-header">
          <div class="notification-title">
            <span class="notification-icon">{{ getNotificationIcon(notification.type) }}</span>
            <strong>{{ notification.title }}</strong>
          </div>
          <div class="notification-actions">
            <button 
              *ngIf="!notification.isRead" 
              class="btn btn-sm btn-outline" 
              (click)="markAsRead(notification.notificationId)">
              Mark Read
            </button>
            <button class="btn btn-sm btn-danger-outline" (click)="deleteNotification(notification.notificationId)">
              Delete
            </button>
          </div>
        </div>
        <div class="notification-body">
          <p>{{ notification.message }}</p>
          <small class="text-muted">{{ formatDate(notification.sentAt) }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-filters {
      display: flex;
      gap: 0.5rem;
    }

    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.25rem;
      background: var(--surface-color);
      transition: all 0.2s ease;
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    .notification-card.unread {
      border-left: 4px solid var(--primary);
      background: var(--surface-hover);
    }

    .notification-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: var(--primary);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .notification-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.1rem;
    }

    .notification-icon {
      font-size: 1.2rem;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
    }

    .notification-body p {
      margin: 0 0 0.5rem 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .notification-card.BOOKING {
      border-left-color: var(--success);
    }

    .notification-card.PAYMENT {
      border-left-color: var(--warning);
    }

    .notification-card.AUTH {
      border-left-color: var(--danger);
    }

    .notification-card.SYSTEM {
      border-left-color: var(--text-secondary);
    }

    .spinner {
      border: 2px solid var(--surface-hover);
      border-top: 2px solid var(--primary);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class MyNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filter = 'all';
  loading = true;
  msg = '';
  error = '';
  private notificationSubscription?: Subscription;

  constructor(
    private notifService: NotificationService,
    private signalrService: SignalrService
  ) {}

  ngOnInit() {
    this.load();
    this.setupSignalR();
  }

  ngOnDestroy() {
    this.cleanupSignalR();
  }

  private setupSignalR() {
    // Start SignalR connection
    this.signalrService.startConnection();

    // Subscribe to real-time notifications
    this.notificationSubscription = this.signalrService.notification$.subscribe(notification => {
      if (notification) {
        // Add new notification to the list
        this.notifications.unshift(notification);
        this.applyFilter();
        
        // Show success message for real-time notification
        this.msg = `New notification: ${notification.title}`;
        setTimeout(() => this.msg = '', 5000);
      }
    });
  }

  private cleanupSignalR() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    // Optionally stop connection when navigating away
    // this.signalrService.stopConnection();
  }

  
  load() {
    this.loading = true;
    this.notifService.getMyNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = response.data;
          this.applyFilter();
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load notifications';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    if (this.filter === 'unread') {
      this.filteredNotifications = this.notifications.filter(n => !n.isRead);
    } else {
      this.filteredNotifications = this.notifications;
    }
  }

  setFilter(filter: string) {
    this.filter = filter;
    this.applyFilter();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(id: number) {
    this.notifService.markAsRead(id).subscribe({
      next: (response) => {
        if (response.success) {
          const notif = this.notifications.find(n => n.notificationId === id);
          if (notif) {
            notif.isRead = true;
          }
          this.applyFilter();
          this.msg = 'Notification marked as read';
          setTimeout(() => this.msg = '', 3000);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Failed to mark notification as read';
      }
    });
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications.forEach(n => n.isRead = true);
          this.applyFilter();
          this.msg = 'All notifications marked as read';
          setTimeout(() => this.msg = '', 3000);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Failed to mark all notifications as read';
      }
    });
  }

  deleteNotification(id: number) {
    if (confirm('Delete this notification?')) {
      this.notifService.deleteNotification(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notifications = this.notifications.filter(n => n.notificationId !== id);
            this.applyFilter();
            this.msg = 'Notification deleted';
            setTimeout(() => this.msg = '', 3000);
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Failed to delete notification';
        }
      });
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'BOOKING': return '📋';
      case 'PAYMENT': return '💰';
      case 'AUTH': return '🔐';
      case 'SYSTEM': return '⚙️';
      default: return '📢';
    }
  }

  getNotificationClass(type: string): string {
    return type || 'SYSTEM';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  }
}
