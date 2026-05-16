import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse, UserProfile } from '../models';

// Declare the global google identity object injected by the GSI script
declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient, private router: Router, private ngZone: NgZone) {
    this.initGoogleSignIn();
  }

  // ── Getters ──────────────────────────────────────────────────────────────────
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

  // ── Standard Auth ─────────────────────────────────────────────────────────────
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

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  /**
   * Send a Google ID token to the backend and receive ParkEase JWT tokens.
   * @param idToken  Google ID token from the GIS credential response
   * @param role     'DRIVER' | 'MANAGER' (used only for first-time registrations)
   */
  googleAuth(idToken: string, role: string = 'DRIVER'): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.authUrl}/auth/google`,
      { idToken, role }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('parkease_user', JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  /**
   * Render a Google Sign-In button in the given container element.
   * @param containerId  DOM element ID of the button container
   * @param role         Role to pass on first-time registration
   * @param onSuccess    Callback invoked on successful authentication
   * @param onError      Callback invoked when auth fails
   */
  renderGoogleButton(
    containerId: string,
    role: string,
    onSuccess: (res: LoginResponse) => void,
    onError: (msg: string) => void
  ): void {
    // Defer until the GSI library is available
    const tryRender = () => {
      if ((globalThis as any).google === undefined || !google?.accounts?.id) {
        setTimeout(tryRender, 200);
        return;
      }
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) => {
          this.ngZone.run(() => {
            this.googleAuth(response.credential, role).subscribe({
              next: res => {
                if (res.success) onSuccess(res.data);
                else onError(res.message);
              },
              error: err => onError(err.error?.message || 'Google sign-in failed')
            });
          });
        }
      });
      google.accounts.id.renderButton(
        document.getElementById(containerId),
        {
          theme: 'filled_blue',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: '100%'
        }
      );
    };
    tryRender();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  redirectByRole(): void {
    if (this.isAdmin) this.router.navigate(['/admin']);
    else if (this.isManager) this.router.navigate(['/manager']);
    else this.router.navigate(['/driver']);
  }

  private getStoredUser(): LoginResponse | null {
    const stored = localStorage.getItem('parkease_user');
    console.log('AuthService: getStoredUser called, stored data:', stored);
    const user = stored ? JSON.parse(stored) : null;
    console.log('AuthService: Parsed user:', user);
    return user;
  }

  /** Load the Google Identity Services script once per app session */
  private initGoogleSignIn(): void {
    if (document.getElementById('gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}
