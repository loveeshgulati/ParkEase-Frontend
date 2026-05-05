import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
        <h2>Create Account</h2>
        <span class="auth-subtitle">Join ParkEase and start parking smart</span>

        <div class="alert alert-error" *ngIf="error">{{ error }}</div>
        <div class="alert alert-success" *ngIf="success">{{ success }}</div>
        
        <form (ngSubmit)="register()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="form.fullName" name="fullName" class="form-control" placeholder="John Doe" required />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="form.email" name="email" class="form-control" placeholder="name@example.com" required />
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="form.phone" name="phone" class="form-control" placeholder="9999999999" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="form.password" name="password" class="form-control" placeholder="Min 6 characters" required />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword" tabindex="-1">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Register as</label>
            <select [(ngModel)]="form.role" name="role" class="form-control">
              <option value="DRIVER">Driver</option>
              <option value="MANAGER">Lot Manager</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block mt-3" [disabled]="loading">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading">Creating account...</span>
          </button>
        </form>
        
        <p>
          Already have an account? <a routerLink="/login">Log in here</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = { fullName: '', email: '', phone: '', password: '', role: 'DRIVER' };
  loading = false; error = ''; success = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.loading = true; this.error = ''; this.success = '';
    this.auth.register(this.form).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.success = res.message || 'Registered successfully!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else this.error = res.message;
      },
      error: err => { this.loading = false; this.error = err.error?.message || 'Registration failed'; }
    });
  }
}
