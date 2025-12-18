import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn:'root'
})

export class DataHandlingService {
  private data = new BehaviorSubject<any[]>([]);
  public formData:Observable <any> = this.data.asObservable();
  

  setData(data:any) {
     this.data.next([...this.data.getValue(), data])
  }
}