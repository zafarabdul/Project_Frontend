import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/services/api';
import { InputComponent } from '../shared/components/input/input.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { SelectComponent } from '../shared/components/select/select.component';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-decryption',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, ToastComponent, SelectComponent, QRCodeComponent],
  templateUrl: './decryption.html',
  styleUrl: './decryption.css'
})
export class DecryptionComponent {
  private api = inject(ApiService);

  securityId = signal('1234560000');
  decryptionKey = signal('1234');
  algorithm = signal('AES-256-GCM');
  encryptedPayload = signal('');
  customAlgorithm = signal('');
  decryptionType = signal<'text' | 'image'>('text');

  // Options
  algorithms = [
    'AES-256-GCM',
    'ChaCha20-Poly1305',
    'Blowfish',
    'Twofish',
    'Custom Algo'
  ];

  isDecrypting = signal(false);
  isLoadingPayload = signal(false);
  decryptedOutput = signal<string | null>(null);
  showQR = signal(false);
  expiresAt = signal<string | null>(null);
  isExpired = signal(false);

  
  constructor() {
    // Manual trigger only
  }


  onCredentialsChange() {
    // Reset output when credentials change, but don't fetch
    this.decryptedOutput.set(null);
    this.encryptedPayload.set('');
    this.isExpired.set(false);
  }

  timeout: any;
  photoUrl = signal<string | null>(null);

  fetchEncryptedPayload() {
    this.isLoadingPayload.set(true);
    this.encryptedPayload.set(''); // Reset
    this.photoUrl.set(null); // Reset photo
    this.isExpired.set(false); // Reset expired state
    this.decryptedOutput.set(null); // Reset old output

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      if (this.decryptionType() === 'text') {
        const algoToSend = this.algorithm() === 'Custom Algo' ? this.customAlgorithm() : this.algorithm();
        this.api.fetchEncryptedPayload(this.securityId(), this.decryptionKey(), algoToSend).subscribe({
          next: (response: any) => {
            if (response && typeof response === 'object') {
              const payload = response.message || response.encrypted_data || JSON.stringify(response);
              this.encryptedPayload.set(payload);
              this.expiresAt.set(response.expires_at || null);
              if (response.algoId) {
                if (this.algorithms.includes(response.algoId) && response.algoId !== 'Custom Algo') {
                  this.algorithm.set(response.algoId);
                } else {
                  this.algorithm.set('Custom Algo');
                  this.customAlgorithm.set(response.algoId);
                }
              }
              this.showNotification('Message Fetched Successfully', 'success');
            } else {
              this.encryptedPayload.set(String(response));
              this.showNotification('Message Fetched Successfully', 'success');
            }
            this.isLoadingPayload.set(false);
          },
          error: (err: any) => {
            const msg = err.error?.error || err.error?.message || 'Failed to fetch text data';
            this.handleFetchError(msg, err.status);
            this.isLoadingPayload.set(false);
          }
        });
      } else {
        this.fetchPhoto();
      }
    }, 1000);
  }

  fetchPhoto() {
    this.api.fetchEncryptedPhoto(this.securityId(), this.decryptionKey()).subscribe({
      next: (response: any) => {
        let url = '';
        if (typeof response === 'string') {
          url = response;
        } else if (response && typeof response === 'object') {
          // Check common property names for the image URL
          url = response.image || response.photo || response.url || response.src || response.file || '';
          this.expiresAt.set(response.expires_at || null);
        }

        if (url) {
          this.photoUrl.set(url);
          this.encryptedPayload.set('Photo decrypted. Click "DOWNLOAD PHOTO" to save.');
          this.showNotification('Photo Decrypted Successfully', 'success');
        } else {
          this.handleFetchError('No valid photo URL found in response');
        }
        this.isLoadingPayload.set(false);
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Failed to fetch photo';
        this.handleFetchError(msg, err.status);
        this.isLoadingPayload.set(false);
      }
    });
  }

  downloadPhoto() {
    const url = this.photoUrl();
    if (url) {
      if (url.startsWith('http') || url.startsWith('/')) {
        this.api.downloadImage(url).subscribe({
          next: (blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = 'decrypted-image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
            this.showNotification('Download Started', 'success');
          },
          error: (err) => {
            console.error('Blob fetch failed, falling back to direct link', err);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'decrypted-image.png';
            a.target = '_blank'; // Open in new tab if download fails
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        });
      } else {
        // Data URL or Blob URL
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decrypted-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  }

  handleFetchError(msg: string, status?: any) {
    if (msg === 'This content has expired and was automatically deleted.') {
      this.isExpired.set(true);
      this.encryptedPayload.set('Content Expired');
    } else {
      const errorText = `Error: ${msg} ${status ? '(Status: ' + status + ')' : ''}`;
      this.encryptedPayload.set(errorText);
      this.isExpired.set(false);
    }
    this.isLoadingPayload.set(false);
    this.isDecrypting.set(false);
    this.showNotification(`Fetch Failed: ${msg}`, 'error');
  }

  copyPayload() {
    if (this.encryptedPayload() && !this.photoUrl()) {
      // ... existing copy logic
      navigator.clipboard.writeText(this.encryptedPayload())
        .then(() => {
          this.showNotification('Encrypted Payload Copied to Clipboard!', 'success');
        })
        .catch(() => {
          this.showNotification('Failed to copy to clipboard', 'error');
        });
    }
  }

  initiateDecryption() {
    if (!this.decryptionKey() || !this.securityId()) {
      this.showNotification('Security ID and Key are required', 'error');
      return;
    }

    this.isDecrypting.set(true);
    this.decryptedOutput.set(null);
    this.encryptedPayload.set('');
    this.isExpired.set(false);

    if (this.decryptionType() === 'text') {
      const algoToSend = this.algorithm() === 'Custom Algo' ? this.customAlgorithm() : this.algorithm();
      this.api.fetchEncryptedPayload(this.securityId(), this.decryptionKey(), algoToSend).subscribe({
        next: (response: any) => {
          if (response && typeof response === 'object') {
            const payload = response.message || response.encrypted_data || JSON.stringify(response);
            this.decryptedOutput.set(payload);
            this.expiresAt.set(response.expires_at || null);
            if (response.algoId) {
              if (this.algorithms.includes(response.algoId) && response.algoId !== 'Custom Algo') {
                this.algorithm.set(response.algoId);
              } else {
                this.algorithm.set('Custom Algo');
                this.customAlgorithm.set(response.algoId);
              }
            }
            this.showNotification('Decryption Successful', 'success');
          } else {
            this.decryptedOutput.set(String(response));
            this.showNotification('Decryption Successful', 'success');
          }
          this.isDecrypting.set(false);
        },
        error: (err: any) => {
          const msg = err.error?.error || err.error?.message || 'Failed to decrypt data';
          this.handleFetchError(msg, err.status);
          this.isDecrypting.set(false);
        }
      });
    } else {
      this.api.fetchEncryptedPhoto(this.securityId(), this.decryptionKey()).subscribe({
        next: (response: any) => {
          let url = '';
          if (typeof response === 'string') {
            url = response;
          } else if (response && typeof response === 'object') {
            url = response.image || response.photo || response.url || response.src || response.file || '';
            this.expiresAt.set(response.expires_at || null);
          }

          if (url) {
            this.photoUrl.set(url);
            this.decryptedOutput.set('Photo decrypted successfully.');
            this.showNotification('Photo Decrypted Successfully', 'success');
          } else {
            this.handleFetchError('No valid photo URL found in response');
          }
          this.isDecrypting.set(false);
        },
        error: (err) => {
          const msg = err.error?.error || err.error?.message || 'Failed to fetch photo';
          this.handleFetchError(msg, err.status);
          this.isDecrypting.set(false);
        }
      });
    }
  }

  showToast = signal(false);
  toastMessage = signal('Encrypted Payload Copied to Clipboard!');
  toastType = signal<'success' | 'error'>('success');

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }


}


