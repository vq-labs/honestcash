import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import User from '../../models/user';
import { CryptoUtils } from '../../shared/lib/CryptoUtils';
import { HttpService } from '../../core';
import { AppState } from 'app/app.states';

export interface IAuthRequest {
  username?: string;
  email: string;
  password: string;
  captcha?: string;
}


export interface IAuthRequestSuccessResponse {
  user: User;
  wallet?: any;
  token?: string;
  password?: string;
}

export interface IAuthRequestFailedResponse {
  code: string;
  desc: string;
  httpCode: number;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private LOCAL_TOKEN_KEY = 'HC_USER_TOKEN';

  constructor(
    private store: Store<AppState>,
    private http: HttpService
  ) {}

  public setup(): void {
    // check or setup token
    // check or setup wallet
  }

  public getToken(): string {
    return localStorage.getItem('token');
  }

  public setToken(token: string): void {
    return localStorage.setItem(this.LOCAL_TOKEN_KEY, token);
  }

  public unsetToken(): void {
    return localStorage.removeItem(this.LOCAL_TOKEN_KEY);
  }

  public logIn(payload: IAuthRequest): Observable<IAuthRequestSuccessResponse | IAuthRequestFailedResponse> {
    const url = `/login`;

    const passwordHash = CryptoUtils.calculatePasswordHash(payload.email, payload.password);

    return this.http.post<IAuthRequestSuccessResponse | IAuthRequestFailedResponse>(url, {email: payload.email, password: passwordHash});
  }

  public signUp(payload: IAuthRequest): Observable<User> {
    const url = `/signup/email`;

    const passwordHash = CryptoUtils.calculatePasswordHash(payload.email, payload.password);

    return this.http.post<User>(url, {
      username: payload.username,
      email: payload.email,
      password: passwordHash,
      captcha: payload.captcha
    });
  }

  public resetPassword(email: string): Observable<User> {
    const url = `/register`;

    return this.http.post<User>(url, {
      email
    });
  }

  public changePassword(data: {
    email: string;
    code: string,
    newPassword: string,
    repeatNewPassword: string;
    mnemonicEncrypted: string;
  }) {
    return this.http.post(`/auth/reset-password"`, data);
  }

  public getMe() {
    return this.http.get<User>(`/me`);
  }

  getStatus(): Observable<User> {
    const url = `/status`;
    return this.http.get<User>(url);
  }
}
