import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { ApiSettingModel } from '../models/apiSettingDataModel';
import { environment } from '../../../../environment/environment';
import { ApiSettingConstat } from '../types/apiSettingConstants';
import { ApiSettingPayload } from '../types/apiSettingPayload';
import { DeveloperControlModel } from '../models/developerControlModel';
import { OtpData } from '../../../auth/models/otpModel';

@Injectable({
  providedIn: 'root',
})
export class ApiSettingService {
  base_url = environment.apiUrl;

  //dependancies
  private http = inject(HttpClient);

  constructor() {}

  //generate api Key
  generateApiKey(payload: ApiSettingPayload): Observable<ApiSettingModel> {
    return this.http.post<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.generateApiKey}`,
      payload
    );
  }

  //delete api key
  deleteApiKey(payload: ApiSettingPayload): Observable<ApiSettingModel> {
    return this.http.put<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.deleteApiKey}`,
      payload
    );
  }

  //Add ip address
  sendOtptoAddIpAddress(payload: ApiSettingPayload): Observable<OtpData> {
    return this.http.post<OtpData>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.addIpAddress}/${ApiSettingConstat.sendOtp}`,
      payload
    );
  }

  //verify otpdata to addIpAddress
  verifyOtptoAddIpAddress(
    payload: ApiSettingPayload
  ): Observable<ApiSettingModel> {
    return this.http.post<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.addIpAddress}/${ApiSettingConstat.verifyOtp}`,
      payload
    );
  }

  // update ip address
  sendOtptoUpdateIpAddress(payload: ApiSettingPayload): Observable<OtpData> {
    return this.http.put<OtpData>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.updateIp}/${ApiSettingConstat.sendOtp}`,
      payload
    );
  }

  // verify otp to update ip address
  verifyOtptoUpdateIpAddress(
    payload: ApiSettingPayload
  ): Observable<ApiSettingModel> {
    return this.http.put<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.updateIp}/${ApiSettingConstat.verifyOtp}`,
      payload
    );
  }

  // remove ipAddress
  sendOtptoRemoveIpAddress(payload: ApiSettingPayload): Observable<OtpData> {
    return this.http.put<OtpData>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.removeIp}/${ApiSettingConstat.sendOtp}`,
      payload
    );
  }

  // verify otp to remove ipAddress
  verifyOtptoRemoveIpAddress(
    payload: ApiSettingPayload
  ): Observable<ApiSettingModel> {
    return this.http.put<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.removeIp}/${ApiSettingConstat.verifyOtp}`,
      payload
    );
  }

  //add webhook url
  addWebHookUrl(payload: ApiSettingPayload): Observable<ApiSettingModel> {
    return this.http.post<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.addWebHookUrl}`,
      payload
    );
  }

  // update web hook url
  updateWebHookUrl(payload: ApiSettingPayload): Observable<ApiSettingModel> {
    return this.http.put<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.updateWebHookUrl}`,
      payload
    );
  }

  // remove web hook url
  removeWebHookUrl(payload: ApiSettingPayload): Observable<ApiSettingModel> {
    return this.http.put<ApiSettingModel>(
      `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.removeWebHookUrl}`,
      payload
    );
  }

  //get developer profile data;
  getDeveloperData(): Observable<DeveloperControlModel> {
    return this.http
      .get<DeveloperControlModel>(
        `${this.base_url}/${ApiSettingConstat.developerUrl}/${ApiSettingConstat.getDeveloperData}`
      );
  }
}
