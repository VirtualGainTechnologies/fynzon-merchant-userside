import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { AadharModel, BankModel, GstModel, PanModel, SelfieModel } from '../models/kycModel';


@Injectable({
  providedIn: 'root',
})
export class KycService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  constructor() {}

  verifyAadhaar(payload: any): Observable<AadharModel> {
    return this.http.post<AadharModel>(
      `${this.baseUrl}/kyc/api/v1/verify-aadhaar`,
      payload,
    );
  }

  verifyIndividualPan(payload: any): Observable<PanModel> {
    return this.http.post<PanModel>(
      `${this.baseUrl}/kyc/api/v1/verify-individual-pan`,
      payload,
    );
  }

  verifyBusinessPan(payload: any): Observable<PanModel> {
    return this.http.post<PanModel>(
      `${this.baseUrl}/kyc/api/v1/verify-business-pan`,
      payload,
    );
  }

  verifyGst(payload: any): Observable<GstModel> {
    return this.http.post<GstModel>(
      `${this.baseUrl}/kyc/api/v1/verify-gstin`,
      payload,
    );
  }

  verifyBank(payload: any): Observable<BankModel> {
    return this.http.post<BankModel>(
      `${this.baseUrl}/kyc/api/v1/verify-bank`,
      payload,
    );
  }

  verifySelfie(payload: any): Observable<SelfieModel> {
    return this.http.post<SelfieModel>(
      `${this.baseUrl}/kyc/api/v1/verify-selfie`,
      payload,
    );
  }
}
