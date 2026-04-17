import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserPayload } from '../models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response?.access_token) {
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserPayload(): UserPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as UserPayload;
    } catch {
      return null;
    }
  }

  getUserRole(): string {
    return this.getUserPayload()?.perfil ?? '';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  getUserId(): number {
    return this.getUserPayload()?.id_usuario ?? 0;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem(this.TOKEN_KEY);
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }
  }
}
