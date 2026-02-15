import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'http://localhost:8000/api/data';

  registerUser(specialId: string, email: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/register/${specialId}/${email}/`, {});
  }

  sendDataEntry(specialId: string, key: string, algo: string, payload: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/${specialId}/${key}/${algo}/message/`, payload);
  }

  fetchEncryptedPayload(securityId: string, key: string, algo: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/${securityId}/${key}/${algo}/message/`);
  }

  fetchEncryptedPhoto(securityId: string, key: string): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/${securityId}/${key}/photo/`, { responseType: 'blob' });
  }
}
