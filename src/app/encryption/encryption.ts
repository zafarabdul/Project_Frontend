import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../shared/services/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { SelectComponent } from '../shared/components/select/select.component';
import { FileUploadComponent } from '../shared/components/file-upload/file-upload.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-encryption',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, ToastComponent, SelectComponent, FileUploadComponent],
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
  algorithm: string = 'Triple-DES';
  message: string = '';
  customAlgorithm: string = 'Triple-DES';
  activeTab: 'text' | 'file' = 'text';
  selectedFile: File | null = null;
  selectedTTL: number = 0; // 0 means Never/No TTL

  ttlOptions = [
    { label: 'Never (Infinite)', value: 0 },
    { label: '1 Minute', value: 1 },
    { label: '5 Minutes', value: 5 },
    { label: '15 Minutes', value: 15 },
    { label: '1 Hour', value: 60 },
    { label: '24 Hours', value: 1440 },
  ];

  onFileSelected(file: File | null) {
    this.selectedFile = file;
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
    'Triple-DES',
    'AES-256-GCM',
    'ChaCha20-Poly1305',
    'Blowfish',
    'Twofish',
    'Custom Algo'
  ];

  showCustomAlgoDialog = false;
  customAlgoTab: 'code' | 'upload' = 'code';
  customCode: string = `import sys

def encrypt(text, key):
    # Add your custom encryption logic here
    return text

def decrypt(text, key):
    # Add your custom decryption logic here
    return text

if __name__ == "__main__":
    if len(sys.argv) >= 4:
        action, text, key = sys.argv[1], sys.argv[2], sys.argv[3]
        if action == "encrypt":
            print(encrypt(text, key))
        elif action == "decrypt":
            print(decrypt(text, key))
`;
  customCodeFile: File | null = null;

  onAlgorithmChange(algo: string) {
    this.algorithm = algo;
    if (algo === 'Custom Algo') {
      this.showCustomAlgoDialog = true;
    }
  }

  onCustomAlgoFileSelected(file: File | null) {
    this.customCodeFile = file;
  }


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
    let customAlgoBase64: string | undefined = undefined;

    if (this.algorithm === 'Custom Algo') {
      if (!this.customAlgorithm) {
        this.showError('Please specify the new algorithm name');
        this.isLoading.set(false);
        return;
      }
      algo = this.customAlgorithm;

      this.prepareCustomAlgoCode(algo);
      return; // Execution will continue inside prepareCustomAlgoCode
    } else {
      this.processDataEntryRequest(algo, customAlgoBase64);
    }
  }

  private prepareCustomAlgoCode(algo: string) {
    if (this.customAlgoTab === 'upload' && this.customCodeFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.processDataEntryRequest(algo, reader.result as string);
      };
      reader.onerror = () => {
        this.showError('Failed to read custom code file.');
        this.isLoading.set(false);
      };
      reader.readAsDataURL(this.customCodeFile);
    } else if (this.customAlgoTab === 'code' && this.customCode.trim()) {
      const blob = new Blob([this.customCode], { type: 'text/x-python' });
      const reader = new FileReader();
      reader.onload = () => {
        this.processDataEntryRequest(algo, reader.result as string);
      };
      reader.onerror = () => {
        this.showError('Failed to read custom code blob.');
        this.isLoading.set(false);
      };
      reader.readAsDataURL(blob);
    } else {
      // No custom code provided, just proceed without it, or enforce it?
      // It's likely we want to send what we have, or could fail here if it's strictly required
      this.processDataEntryRequest(algo, undefined);
    }
  }

  private processDataEntryRequest(algo: string, customAlgoBase64?: string) {
    const payload = {
      message: this.message,
    };

    if (this.activeTab === 'file') {
      if (!this.selectedFile) {
        this.showError('Please select a photo to encrypt.');
        this.isLoading.set(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;

        this.api.sendDataEntry(this.specialId, this.encryptionKey, algo, payload, { 
          file: base64Image, 
          customAlgoCode: customAlgoBase64,
          ttl: this.selectedTTL > 0 ? this.selectedTTL : undefined
        })
          .pipe(finalize(() => {
            this.isLoading.set(false);
          }))
          .subscribe({
            next: (response: any) => {
              this.showSuccess = true;
              this.encryptedOutput = `Photo "${this.selectedFile?.name}" encrypted successfully.`;
              this.showNotification('Photo Encrypted Successfully', 'success');
            },
            error: (err: any) => {
              console.error('Photo Encryption failed', err);
              this.showError('Photo encryption failed. Check console.');
            }
          });
      };

      reader.onerror = () => {
        this.showError('Failed to read file.');
        this.isLoading.set(false);
      };

      reader.readAsDataURL(this.selectedFile);
    } else {
      this.api.sendDataEntry(this.specialId, this.encryptionKey, algo, payload, { 
        customAlgoCode: customAlgoBase64,
        ttl: this.selectedTTL > 0 ? this.selectedTTL : undefined
      })
        .pipe(finalize(() => {
          this.isLoading.set(false);
        }))
        .subscribe({
          next: (response: any) => {
            this.showSuccess = true;
            // Use the actual encrypted output returned by the Lambda function backend!
            this.encryptedOutput = response.message || response.encrypted_data || "Successfully Encrypted!";
            this.showNotification('Text Encrypted Successfully', 'success');
          },
          error: (err: any) => {
            console.error('Encryption failed', err);
            this.showError('Encryption request failed. Check console.');
          }
        });
    }
  }

  // Mock encrypt function removed as we now use backend execution

  clear() {
    this.message = '';
    this.encryptedOutput = null;
    this.showSuccess = false;
    this.selectedTTL = 0;
  }

  copyResult() {
    if (this.encryptedOutput) {
      navigator.clipboard.writeText(this.encryptedOutput);
      this.showNotification('Copied to clipboard!', 'success');
    }
  }


}
