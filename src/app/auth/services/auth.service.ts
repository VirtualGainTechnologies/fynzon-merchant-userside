import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { AuthData } from '../models/authModel';

import { LoginPayload } from '../types/loginPayload';
import { ValidateUserData } from '../models/validateUserModel';
import { OtpData } from '../models/otpModel';
import { OtpPayload } from '../types/otpPayload';
import { ValidateUserPayload } from '../types/validateUserPayload';
import { RegisterPayload } from '../types/registerPayload';
import { ForgotPasswordPayload } from '../types/forgotPasswordPayload';
import { environment } from '../../../environment/environment';
import { UserProfileResponse } from '../models/userProfileModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  constructor() {}

  //validate user
  validateUser(payload: ValidateUserPayload): Observable<ValidateUserData> {
    return this.http.post<ValidateUserData>(
      `${this.baseUrl}/auth/api/v1/validate-merchant`,
      payload
    );
  }

  //register
  sendEmailOtp(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/api/v1/registration/send-otp`, payload);
  }

  register(payload: RegisterPayload): Observable<AuthData> {
    return this.http.post<AuthData>(`${this.baseUrl}/auth/api/v1/registration/verify-otp`, payload);
  }

  //login
  sendLoginOtp(payload: OtpPayload): Observable<OtpData | AuthData> {
    return this.http.post<OtpData | AuthData>(
      `${this.baseUrl}/auth/api/v1/login/send-otp`,
      payload
    );
  }

  login(payload: LoginPayload): Observable<AuthData> {
    return this.http.post<AuthData>(`${this.baseUrl}/auth/api/v1/login/verify-otp`, payload);
  }

  //logout
  logout(): Observable<AuthData> {
    return this.http.get<AuthData>(`${this.baseUrl}/auth/api/v1/logout`);
  }

  //forgot-password
  sendForgotPasswordOtp(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(`${this.baseUrl}/auth/api/v1/forgot-password/send-otp`, payload);
  }

  verifyForgotPasswordOtp(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl}/auth/api/v1/forgot-password/verify-otp`,
      payload
    );
  }

  changePassword(payload: ForgotPasswordPayload): Observable<AuthData> {
    return this.http.post<AuthData>(`${this.baseUrl}/auth/api/v1/forgot-password`, payload);
  }

  //resend-otp
  resendOtp(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(`${this.baseUrl}/resend-otp/api/v1`, payload);
  }


  //get user account data

  getUserProfile():Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/account/api/v1/get-account-details`);
  }

  getMerchantDetails():Observable<AuthData> {
    return this.http.get<AuthData>(`${this.baseUrl}/auth/api/v1/get-merchant-details`);
  }
}


