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

  sendDataEntry(specialId: string, key: string, algo: string, payload: any, options?: { file?: string, customAlgoCode?: string }): Observable<any> {
    // Calling Lambda to handle orchestration/encryption
    const body: any = {
      action: 'encrypt',
      specialId,
      key,
      algo,
      data: payload
    };
    if (options?.file) {
      body.file = options.file;
    }
    if (options?.customAlgoCode) {
      body.customAlgoCode = options.customAlgoCode;
    }
    return this.http.post(this.LAMBDA_URL, body);
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



  downloadImage(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }


}
