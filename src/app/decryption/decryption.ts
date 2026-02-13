import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';
import { ButtonComponent } from '../shared/components/button/button.component';

@Component({
  selector: 'app-decryption',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent],
  templateUrl: './decryption.html',
  styleUrl: './decryption.css'
})
export class DecryptionComponent {
  private http = inject(HttpClient);

  securityId: string = '';
  decryptionKey: string = '';
  encryptedPayload: string = '';

  isDecrypting: boolean = false;
  isLoadingPayload: boolean = false;
  decryptedOutput: string | null = null;

  onCredentialsChange() {
    if (this.securityId && this.decryptionKey && this.decryptionKey.length >= 2) {
      this.fetchEncryptedPayload();
    }
  }

  fetchEncryptedPayload() {
    this.isLoadingPayload = true;
    this.encryptedPayload = ''; // Reset

    // Assuming the endpoint to fetch messages
    // Adjust URL as needed
    const url = `/api/data/${this.securityId}/${this.decryptionKey}/message/`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        this.encryptedPayload = response.message || response.encrypted_data || JSON.stringify(response);
        this.isLoadingPayload = false;
      },
      error: (err) => {
        console.error('Failed to fetch payload', err);
        // For demo purposes if backend fails or doesn't exist
        this.encryptedPayload = "No data found or backend unavailable";
        this.isLoadingPayload = false;
      }
    });
  }

  initiateDecryption() {
    if (!this.decryptionKey || !this.encryptedPayload) {
      alert("Please provide key and payload");
      return;
    }

    this.isDecrypting = true;

    // Simulate decryption process
    setTimeout(() => {
      try {
        // Mock reversal of our mock encryption: btoa(text + key).split('').reverse().join('')
        // So reverse again -> atob
        const reversed = this.encryptedPayload.split('').reverse().join('');
        const decoded = atob(reversed);

        // remove key from end
        if (decoded.endsWith(this.decryptionKey)) {
          this.decryptedOutput = decoded.slice(0, -this.decryptionKey.length);
        } else {
          // If key doesn't match roughly (for demo) just show decoded
          this.decryptedOutput = decoded;
        }
      } catch (e) {
        this.decryptedOutput = "Error: Invalid Payload or Key";
      }
      this.isDecrypting = false;
    }, 1500);
  }

  copyPayload() {
    if (this.encryptedPayload) {
      navigator.clipboard.writeText(this.encryptedPayload);
    }
  }
}
