import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse, UserProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): LoginResponse | null { return this.currentUserSubject.value; }
  get token(): string | null { 
    const token = this.currentUser?.accessToken ?? null;
    console.log('AuthService: Token getter called, returning:', !!token);
    return token;
  }
  get role(): string { return this.currentUser?.role ?? ''; }
  get userId(): number { return this.currentUser?.userId ?? 0; }
  get isLoggedIn(): boolean { return !!this.token; }
  get isAdmin(): boolean { return this.role === 'ADMIN'; }
  get isManager(): boolean { return this.role === 'MANAGER'; }
  get isDriver(): boolean { return this.role === 'DRIVER'; }

  login(req: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.authUrl}/auth/login`, req).pipe(
      tap(res => {
        console.log('AuthService: Login response:', res);
        if (res.success && res.data) {
          console.log('AuthService: Storing user data:', res.data);
          localStorage.setItem('parkease_user', JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
          console.log('AuthService: User stored, current token:', this.token);
        }
      })
    );
  }

  register(req: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.authUrl}/auth/register`, req);
  }

  logout(): void {
    this.http.post(`${environment.authUrl}/auth/logout`, {}).subscribe();
    localStorage.removeItem('parkease_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${environment.authUrl}/auth/profile`);
  }

  private getStoredUser(): LoginResponse | null {
    const stored = localStorage.getItem('parkease_user');
    console.log('AuthService: getStoredUser called, stored data:', stored);
    const user = stored ? JSON.parse(stored) : null;
    console.log('AuthService: Parsed user:', user);
    return user;
  }

  redirectByRole(): void {
    if (this.isAdmin) this.router.navigate(['/admin']);
    else if (this.isManager) this.router.navigate(['/manager']);
    else this.router.navigate(['/driver']);
  }
}
