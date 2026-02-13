import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-encryption',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encryption.html',
  styleUrl: './encryption.css'
})
export class EncryptionComponent {
  title = 'Encryption Panel v2.0';
  private http = inject(HttpClient);

  // Form Model
  specialId: string = 'USER-8821-X';
  encryptionKey: string = '';
  algorithm: string = 'AES-256-GCM';
  message: string = '';
  activeTab: 'text' | 'file' = 'text';
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // State
  isLoading: boolean = false;
  encryptedOutput: string | null = null;
  showSuccess: boolean = false;

  // Options
  algorithms = [
    'AES-256-GCM',
    'ChaCha20-Poly1305',
    'Blowfish',
    'Twofish'
  ];

  generateKey() {
    this.encryptionKey = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
  }

  lockAndEncrypt() {
    if (!this.specialId || !this.encryptionKey || !this.message) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.showSuccess = false;
    this.encryptedOutput = null;

    this.registerUser().subscribe({
      next: () => {
        this.sendDataEntry();
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.sendDataEntry();
      }
    });
  }

  private registerUser() {
    const dummyEmail = `${this.specialId.toLowerCase()}@gmail.com`;
    return this.http.post(`/api/data/register/${this.specialId}/${dummyEmail}/`, {});
  }

  private sendDataEntry() {
    const payload = {
      message: this.message,
    };

    const url = `/api/data/${this.specialId}/${this.encryptionKey}/${this.algorithm}/message/`;

    this.http.post(url, payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.showSuccess = true;
        this.encryptedOutput = this.mockEncrypt(this.message, this.encryptionKey);
      },
      error: (err) => {
        console.error('Encryption failed', err);
        this.isLoading = false;
        alert('Encryption request failed. Check console.');
      }
    });
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
      alert('Copied to clipboard!');
    }
  }

  downloadTxt() {
    if (!this.encryptedOutput) return;
    const blob = new Blob([this.encryptedOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encrypted-data.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
