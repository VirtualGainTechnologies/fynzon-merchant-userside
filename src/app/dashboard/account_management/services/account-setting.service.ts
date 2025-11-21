import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { OtpPayload } from '../../../auth/types/otpPayload';
import { OtpData } from '../../../auth/models/otpModel';
import { AuthData } from '../../../auth/models/authModel';
import { environment } from '../../../../environment/environment';
import { NullData } from '../../../shared/models/nullDataModel';
import { UpadtePasswordPayload } from '../types/updatePasswordPayload';
import { UploadSelfieResponse } from '../models/account-setting-model';
import { AccountModel } from '../models/accountModel';


@Injectable({
  providedIn: 'root',
})
export class AccountSettingService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  constructor() {}

  //update selfie
  uploadSelfie(payload: any): Observable<UploadSelfieResponse> {
    return this.http.put<UploadSelfieResponse>(
      `${this.baseUrl}/account/api/v1/upload-selfie`,
      payload,
    );
  }

  //chnage mobile number
  sendEmailOtpForMobileChange(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl}/account/api/v1/update-mobile/send-email-otp`,
      payload,
    );
  }

  verifyEmailOtpForMobileChange(payload: OtpPayload): Observable<NullData> {
    return this.http.post<NullData>(
      `${this.baseUrl}/account/api/v1/update-mobile/verify-email-otp`,
      payload,
    );
  }

  sendMobileOtpForMobileChange(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl}/account/api/v1/update-mobile/send-mobile-otp`,
      payload,
    );
  }

  changeMobileNumber(payload: OtpPayload): Observable<AuthData> {
    return this.http.post<AuthData>(
      `${this.baseUrl}/account/api/v1/update-mobile`,
      payload,
    );
  }

  //change email id
  sendMobileOtpForEmailChange(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl}/account/api/v1/update-email/send-mobile-otp`,
      payload,
    );
  }

  verifyMobileOtpForEmailChange(payload: OtpPayload): Observable<NullData> {
    return this.http.post<NullData>(
      `${this.baseUrl}/account/api/v1/update-email/verify-mobile-otp`,
      payload,
    );
  }

  sendEmailOtpForEmailChange(payload: OtpPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl}/account/api/v1/update-email/send-email-otp`,
      payload,
    );
  }

  changeEmailId(payload: OtpPayload): Observable<AuthData> {
    return this.http.post<AuthData>(
      `${this.baseUrl}/account/api/v1/update-email`,
      payload,
    );
  }

  //change password
  sendOtpForPasswordChange(
    payload: UpadtePasswordPayload,
  ): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.baseUrl}/account/api/v1/update-password/send-email-otp`,
      payload,
    );
  }

  updatePassword(payload: UpadtePasswordPayload): Observable<NullData> {
    return this.http.post<NullData>(
      `${this.baseUrl}/account/api/v1/update-password`,
      payload,
    );
  }
}
