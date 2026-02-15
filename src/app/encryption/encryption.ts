import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/services/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-encryption',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, ToastComponent],
  templateUrl: './encryption.html',
  styleUrl: './encryption.css'
})
export class EncryptionComponent {
  title = 'Encryption Panel v2.0';
  private api = inject(ApiService);
  private http = inject(HttpClient);

  // Form Model
  specialId: string = '1234560000';
  encryptionKey: string = '1234';
  algorithm: string = 'AES-256-GCM';
  message: string = '';
  customAlgorithm: string = 'AES-256-GCM';
  activeTab: 'text' | 'file' = 'text';
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // State
  isLoading = signal(false);
  encryptedOutput: string | null = null;
  showSuccess: boolean = false;
  error: string | null = null;

  // Toast State
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  // Options
  algorithms = [
    'AES-256-GCM',
    'ChaCha20-Poly1305',
    'Blowfish',
    'Twofish',
    'NewAlgo'
  ];

  generateKey() {
    this.encryptionKey = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
  }

  lockAndEncrypt() {
    this.isLoading.set(true);
    this.showSuccess = false;
    this.encryptedOutput = null;
    this.error = null;

    this.registerUser().subscribe({
      next: () => {
        this.sendDataEntry();
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.isLoading.set(false);
        const msg = this.extractErrorMessage(err);
        this.showNotification(`Registration failed: ${msg}`, 'error');
        if (true) return;
        this.showNotification(`Registration failed...`, 'error');
      }
    });
  }

  private registerUser() {
    const dummyEmail = `${this.specialId.toLowerCase()}@gmail.com`;
    return this.api.registerUser(this.specialId, dummyEmail);
  }

  private showNotification(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  private showError(msg: string) {
    this.showNotification(msg, 'error');
  }

  private sendDataEntry() {
    let algo = this.algorithm;
    if (this.algorithm === 'NewAlgo') {
      if (!this.customAlgorithm) {
        this.showError('Please specify the new algorithm name');
        this.isLoading.set(false);
        return;
      }
      algo = this.customAlgorithm;
    }

    if (this.activeTab === 'file') {
      if (!this.selectedFile) {
        this.showError('Please select a file to encrypt.');
        this.isLoading.set(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', this.selectedFile);

      // Since URL pattern changed to exclude algo, we append it to body just in case
      formData.append('algoId', algo);

      this.api.uploadEncryptedPhoto(this.specialId, this.encryptionKey, algo, formData)
        .pipe(finalize(() => {
          this.isLoading.set(false);
        }))
        .subscribe({
          next: (response: any) => {
            this.showSuccess = true;
            this.encryptedOutput = `File "${this.selectedFile?.name}" encrypted successfully.`;
            this.showNotification('File Encrypted Successfully', 'success');
          },
          error: (err) => {
            console.error('File Encryption failed', err);
            this.showError('File encryption failed. Check console.');
          }
        });
    } else {
      const payload = {
        message: this.message,
      };

      this.api.sendDataEntry(this.specialId, this.encryptionKey, algo, payload)
        .pipe(finalize(() => {
          this.isLoading.set(false);
        }))
        .subscribe({
          next: (response: any) => {
            this.showSuccess = true;
            this.encryptedOutput = this.mockEncrypt(this.message, this.encryptionKey);
            this.showNotification('Text Encrypted Successfully', 'success');
          },
          error: (err) => {
            console.error('Encryption failed', err);
            this.showError('Encryption request failed. Check console.');
          }
        });
    }
  }

  private mockEncrypt(text: string, key: string): string {
    return btoa(text + key).split('').reverse().join('');
  }

  clear() {
    this.message = '';
    this.encryptedOutput = null;
    this.showSuccess = false;
  }

  copyResult() {
    if (this.encryptedOutput) {
      navigator.clipboard.writeText(this.encryptedOutput);
      this.showNotification('Copied to clipboard!', 'success');
    }
  }


}
