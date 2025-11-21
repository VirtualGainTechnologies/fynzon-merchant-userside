import { inject, Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { LocalStorageService } from 'angular-web-storage';
import { environment } from '../../../environment/environment';



@Injectable({
  providedIn: 'root',
})
export class LocalStoreService {
  key = environment?.encryptionKey;

  private local = inject(LocalStorageService);

  constructor() {}

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }

  private decrypt(data: string) {
    const decryptedData = CryptoJS.AES.decrypt(data, this.key).toString(
      CryptoJS.enc.Utf8,
    );
    return decryptedData;
  }

  public setData(
    key: string,
    value: any,
    expired: number = 0,
    timeUnit: any = '',
  ) {
    const data = JSON.stringify(value);
    const encryptedValue = this.encrypt(data);
    if (expired && timeUnit) {
      this.local.set(key, encryptedValue, expired, timeUnit);
    } else {
      this.local.set(key, encryptedValue);
    }
  }

  public getData(key: string) {
    const data = this.local.get(key) || null;
    return data ? JSON.parse(this.decrypt(data)) : null;
  }

  public removeData(key: string) {
    this.local.remove(key);
  }

  public clearData() {
    this.local.clear();
  }
}
