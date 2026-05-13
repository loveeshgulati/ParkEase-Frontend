import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo-container">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-3">
            <rect width="64" height="64" rx="16" fill="url(#logoGradient)"/>
            <path d="M22 18H34C39.5228 18 44 22.4772 44 28C44 33.5228 39.5228 38 34 38H28V46H22V18ZM28 32H34C36.2091 32 38 30.2091 38 28C38 25.7909 36.2091 24 34 24H28V32Z" fill="white"/>
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stop-color="#008CFF"/>
                <stop offset="1" stop-color="#0055FF"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2>ParkEase</h2>
        <span class="auth-subtitle">Sign in to continue to your dashboard</span>

        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-control" placeholder="name@example.com" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="form-control" placeholder="••••••••" required />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword" tabindex="-1">
                <!-- Eye icon -->
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <!-- Eye-off icon -->
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block mt-3" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Google Sign-In Button -->
        <div id="google-signin-btn" class="google-btn-container"></div>

        <p>
          Don't have an account? <a routerLink="/register">Create one now</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.25rem 0;
      color: var(--text-muted, #8899aa);
      font-size: 0.85rem;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
    }
    .auth-divider span {
      padding: 0 0.75rem;
    }
    .google-btn-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    /* Force GIS button to fill the container width */
    .google-btn-container > div,
    .google-btn-container iframe {
      width: 100% !important;
    }
  `]
})
export class LoginComponent implements AfterViewInit {
  email = ''; password = ''; loading = false; error = '';
  showPassword = false;

  constructor(private auth: AuthService) {}

  ngAfterViewInit(): void {
    this.auth.renderGoogleButton(
      'google-signin-btn',
      'DRIVER',
      (user) => {
        this.loading = false;
        this.auth.redirectByRole();
      },
      (msg) => {
        this.loading = false;
        this.error = msg;
      }
    );
  }

  login() {
    this.loading = true; this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) this.auth.redirectByRole();
        else this.error = res.message;
      },
      error: err => { this.loading = false; this.error = err.error?.message || 'Login failed'; }
    });
  }
}
