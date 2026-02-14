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
  fetchEncryptedPayload() {
    this.isLoadingPayload.set(true);
    this.encryptedPayload.set(''); // Reset

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.api.fetchEncryptedPayload(this.securityId(), this.decryptionKey(), this.algorithm()).subscribe({
        next: (response: any) => {
          // If response has message, use it. If not, try encrypted_data. 
          // If neither, fallback to stringifying the whole response so user sees WHAT came back.
          if (response && typeof response === 'object') {
            const payload = response.message || response.encrypted_data || JSON.stringify(response);
            this.encryptedPayload.set(payload);

            if (response.algoId && this.algorithms.includes(response.algoId)) {
              this.algorithm.set(response.algoId);
            }
          } else {
            // If response is just a string or unknown
            this.encryptedPayload.set(String(response));
          }

          this.isLoadingPayload.set(false);
          this.showNotification('Data Fetched Successfully', 'success');
        },
        error: (err: any) => {
          console.error('Failed to fetch payload', err);
          // Show the actual error message or status text in the payload box
          const errorMsg = err.error?.message || err.statusText || "Unknown Error";
          this.encryptedPayload.set(`Error: ${errorMsg} (Status: ${err.status})`);
          this.isLoadingPayload.set(false);
          this.showNotification(`Fetch Failed: ${errorMsg}`, 'error');
        }
      });
    }, 1000);

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

  copyPayload() {
    if (this.encryptedPayload()) {
      navigator.clipboard.writeText(this.encryptedPayload())
        .then(() => {
          this.showNotification('Encrypted Payload Copied to Clipboard!', 'success');
        })
        .catch(() => {
          this.showNotification('Failed to copy to clipboard', 'error');
        });
    }
  }
}


