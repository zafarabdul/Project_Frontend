import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/services/api';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ToastComponent } from '../shared/components/toast/toast.component';

@Component({
  selector: 'app-decryption',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, ToastComponent],
  templateUrl: './decryption.html',
  styleUrl: './decryption.css'
})
export class DecryptionComponent {
  private api = inject(ApiService);

  securityId = signal('1234567899');
  decryptionKey = signal('zafar1');
  algorithm = signal('zafar');
  encryptedPayload = signal('');

  // Options
  algorithms = [
    'AES-256-GCM',
    'ChaCha20-Poly1305',
    'Blowfish',
    'Twofish'
  ];

  isDecrypting = signal(false);
  isLoadingPayload = signal(false);
  decryptedOutput = signal<string | null>(null);

  onCredentialsChange() {
    if (this.securityId() && this.decryptionKey() && this.decryptionKey().length >= 2) {
      this.fetchEncryptedPayload();
    }
  }

  timeout: any;
  photoUrl = signal<string | null>(null);

  fetchEncryptedPayload() {
    this.isLoadingPayload.set(true);
    this.encryptedPayload.set(''); // Reset
    this.photoUrl.set(null); // Reset photo

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      // 1. Try fetching text message
      this.api.fetchEncryptedPayload(this.securityId(), this.decryptionKey(), this.algorithm()).subscribe({
        next: (response: any) => {
          if (response && typeof response === 'object') {
            const payload = response.message || response.encrypted_data || JSON.stringify(response);
            this.encryptedPayload.set(payload);
            if (response.algoId && this.algorithms.includes(response.algoId)) {
              this.algorithm.set(response.algoId);
            }
            this.showNotification('Message Fetched Successfully', 'success');
          } else {
            this.encryptedPayload.set(String(response));
            this.showNotification('Message Fetched Successfully', 'success');
          }
          this.isLoadingPayload.set(false);
        },
        error: (err: any) => {
          // If text fetch fails, try fetching photo
          this.fetchPhoto();
        }
      });
    }, 1000);
  }

  fetchPhoto() {
    this.api.fetchEncryptedPhoto(this.securityId(), this.decryptionKey()).subscribe({
      next: (blob: Blob) => {
        if (blob.size > 0 && blob.type.startsWith('image/')) {
          const url = URL.createObjectURL(blob);
          this.photoUrl.set(url);
          this.encryptedPayload.set('Image data received');
          this.showNotification('Photo Fetched Successfully', 'success');
        } else {
          this.handleFetchError('No valid text or photo found');
        }
        this.isLoadingPayload.set(false);
      },
      error: (err) => {
        // Both failed
        this.handleFetchError(err.error?.message || err.statusText || 'Unknown Error', err.status);
        this.isLoadingPayload.set(false);
      }
    });
  }

  handleFetchError(msg: string, status?: any) {
    const errorText = `Error: ${msg} ${status ? '(Status: ' + status + ')' : ''}`;
    this.encryptedPayload.set(errorText);
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
    if (!this.decryptionKey() || !this.encryptedPayload()) {
      // Please provide key and payload
      return;
    }

    this.isDecrypting.set(true);

    // Simulate decryption process
    setTimeout(() => {
      try {
        // Since the backend returns the actual text (plaintext) when the correct key is provided
        this.decryptedOutput.set(this.encryptedPayload());
      } catch (e) {
        this.decryptedOutput.set("Error: Invalid Payload or Key");
      }
      this.isDecrypting.set(false);
    }, 1500);
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


