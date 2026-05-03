import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User, Role } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(this.storedUser());
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private storedUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  login(req: LoginRequest): Observable<any> {
    return this.http.post<AuthResponse>(`${this.api}/login`, req).pipe(
      switchMap(res => {
        localStorage.setItem('token', res.token);
        return this.http.get<User>(`${environment.apiUrl}/utilisateurs/me`).pipe(
          tap(user => {
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
          }),
          catchError(() => {
            const user: User = {
              id: 0,
              nom: res.email.split('@')[0],
              email: res.email,
              role: res.role as Role,
              actif: true
            };
            localStorage.setItem('user', JSON.stringify(user));
            this.userSubject.next(user);
            return of(user);
          })
        );
      }),
      catchError(err => {
        console.error('Login error:', err);
        return throwError(() => new Error(err.message || 'Email ou mot de passe incorrect'));
      })
    );
  }

  register(req: RegisterRequest): Observable<any> {
    return this.http.post(`${this.api}/register`, req).pipe(
      catchError(err =>
        throwError(() => new Error(err.error?.message || 'Erreur inscription'))
      )
    );
  }

  // Vide la session SANS rediriger (pour inscription-membre)
  clearSession(): void {
    localStorage.clear();
    this.userSubject.next(null);
  }

  // Logout complet avec redirection
  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.currentUser?.role ?? '');
  }

  redirectByRole(): void {
    const map: Record<string, string> = {
      ADMIN: '/admin/dashboard',
      COMITE_PILOTAGE: '/pilotage/dashboard',
      COORDINATRICE: '/coordinatrice/dashboard',
      CHEF_COMITE: '/chef-comite/dashboard',
      MEMBRE: '/membre/dashboard',
    };
    this.router.navigate([map[this.currentUser?.role ?? ''] ?? '/auth/login']);
  }
}
