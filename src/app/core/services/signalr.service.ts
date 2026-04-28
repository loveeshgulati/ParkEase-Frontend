import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Notification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: HubConnection | null = null;
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  private connectionStateSubject = new BehaviorSubject<boolean>(false);

  // Observable streams
  public notification$ = this.notificationSubject.asObservable();
  public connectionState$ = this.connectionStateSubject.asObservable();

  constructor(private authService: AuthService) {}

  public startConnection(): void {
    if (this.hubConnection?.state === 'Connected') {
      return;
    }

    const token = this.authService.currentUser?.accessToken;
    if (!token) {
      console.warn('Cannot start SignalR connection: No auth token available');
      return;
    }

    const hubUrl = `${environment.notificationUrl.replace('/api/v1', '')}/hubs/notifications`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry intervals
      .build();

    this.setupEventHandlers();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection established');
        this.connectionStateSubject.next(true);
      })
      .catch(err => {
        console.error('Error establishing SignalR connection:', err);
        this.connectionStateSubject.next(false);
      });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR connection stopped');
          this.connectionStateSubject.next(false);
        })
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Handle real-time notifications
    this.hubConnection.on('ReceiveNotification', (notification: any) => {
      console.log('Real-time notification received:', notification);
      
      // Convert to Notification format
      const formattedNotification: Notification = {
        notificationId: notification.notificationId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: false,
        sentAt: notification.sentAt,
        recipientId: 0, // Will be filled by backend
        relatedId: undefined,
        relatedType: undefined,
        channel: 'APP'
      };

      this.notificationSubject.next(formattedNotification);
    });

    // Handle connection events
    this.hubConnection.onreconnecting(error => {
      console.warn('SignalR reconnecting...', error);
      this.connectionStateSubject.next(false);
    });

    this.hubConnection.onreconnected(connectionId => {
      console.log('SignalR reconnected with connectionId:', connectionId);
      this.connectionStateSubject.next(true);
    });

    this.hubConnection.onclose(error => {
      console.error('SignalR connection closed:', error);
      this.connectionStateSubject.next(false);
    });
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  public getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }
}
