import { Component } from '@angular/core';
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
      <div class="card auth-card">
        <h2>🅿️ ParkEase Login</h2>
        <div class="alert alert-error" *ngIf="error">{{ error }}</div>
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-control" placeholder="email@example.com" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" class="form-control" placeholder="Password" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <p class="text-center mt-2">
          No account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = ''; password = ''; loading = false; error = '';

  constructor(private auth: AuthService) {}

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
