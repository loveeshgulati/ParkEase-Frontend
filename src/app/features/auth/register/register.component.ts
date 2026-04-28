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
      <div class="card auth-card">
        <h2>🅿️ Create Account</h2>
        <div class="alert alert-error" *ngIf="error">{{ error }}</div>
        <div class="alert alert-success" *ngIf="success">{{ success }}</div>
        <form (ngSubmit)="register()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="form.fullName" name="fullName" class="form-control" placeholder="John Doe" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" name="email" class="form-control" placeholder="email@example.com" required />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="form.phone" name="phone" class="form-control" placeholder="9999999999" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="form.password" name="password" class="form-control" placeholder="Min 6 characters" required />
          </div>
          <div class="form-group">
            <label>Register as</label>
            <select [(ngModel)]="form.role" name="role" class="form-control">
              <option value="DRIVER">Driver</option>
              <option value="MANAGER">Lot Manager (requires admin approval)</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>
        <p class="text-center mt-2">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = { fullName: '', email: '', phone: '', password: '', role: 'DRIVER' };
  loading = false; error = ''; success = '';

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
