import { inject, Injectable} from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { ContactResponse } from '../models/contactResponse';
import { Observable } from 'rxjs';
import { CreateContactPayload } from '../types/createContactPayload';
import { CreateContactResponse, GetContactResponse } from '../models/createContactResponse';
import { CreateContactTypePayload } from '../types/createContactTypePayload';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  baseUrl: string = environment.apiUrl;

  //dependacies

  private http = inject(HttpClient);

  getAllContactTypes(mode: string): Observable<ContactResponse> {
    const payload = {
      mode: mode,
    };
    return this.http.get<ContactResponse>(`${this.baseUrl}/contacts/api/v1/get-contact-types`, {
      params: payload,
    });
  }

  sendContactType(payload: CreateContactTypePayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(
      `${this.baseUrl}/contacts/api/v1/create-contact-type`,
      payload
    );
  }

  sendContactDetails(payload: CreateContactPayload): Observable<CreateContactResponse> {
    return this.http.post<CreateContactResponse>(
      `${this.baseUrl}/contacts/api/v1/upsert-contact`,
      payload
    );
  }

  getAllContacts(queryPayload:any): Observable<GetContactResponse> {
    const payload = queryPayload
    return this.http.get<GetContactResponse>(`${this.baseUrl}/contacts/api/v1/all-contacts`,{params:payload})               
  }

  createInvoice(payload:CreateContactPayload): Observable <CreateContactResponse> {
    return this.http.post<CreateContactResponse>(`${this.baseUrl}/invoice/api/v1/create-invoice`, payload);
  }
}
