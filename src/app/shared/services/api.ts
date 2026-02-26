import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly BASE_URL = '/api/data';
  private readonly LAMBDA_URL = environment.lambdaUrl;

  registerUser(specialId: string, email: string): Observable<any> {
    return this.http.post(this.LAMBDA_URL, {
      action: 'register',
      specialId,
      email
    });
  }

  sendDataEntry(specialId: string, key: string, algo: string, payload: any): Observable<any> {
    // Calling Lambda to handle orchestration/encryption
    return this.http.post(this.LAMBDA_URL, {
      action: 'encrypt',
      specialId,
      key,
      algo,
      data: payload
    });
  }

  fetchEncryptedPayload(securityId: string, key: string, algo: string): Observable<any> {
    // Calling Lambda to handle orchestration/decryption
    return this.http.post(this.LAMBDA_URL, {
      action: 'decrypt',
      securityId,
      key,
      algo
    });
  }

  fetchEncryptedPhoto(securityId: string, key: string): Observable<any> {
    return this.http.post(this.LAMBDA_URL, {
      action: 'fetch_photo',
      securityId,
      key
    });
  }

  uploadEncryptedPhoto(specialId: string, key: string, algo: string, base64Image: string): Observable<any> {
    const payload = {
      action: 'upload_photo',
      specialId: specialId,
      key: key,
      algo: algo,
      image: base64Image
    };

    return this.http.post(this.LAMBDA_URL, payload);
  }

  downloadImage(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }
}
